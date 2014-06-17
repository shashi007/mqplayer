'use strict';

angular.module('services')
    .factory('dataService', function($http, $q, $timeout, Item){
        var that = {
            authorized: undefined,
            token: null,
            userInfo: null
        };

        var clientid = '97071318931-0pqadkdeov03b36bhthnri1n3h64eg7d.apps.googleusercontent.com';

        var scopes = [
            'https://www.googleapis.com/auth/drive.readonly'
        ];

        /**
         * Child items cached by parent item's id.
         * @type {object}
         */
        var cache = {};

        /**
         * Instantiates the Item based on data received from drive api.
         * @param data raw data object received from drive.files.list method.
         * @returns {Item}
         */
        function getItem(data) {
            return new Item(data.id, data.title, data.mimeType === 'application/vnd.google-apps.folder', data.webContentLink, data.parents[0].id);
        }

        /**
         * Loads files from server by query and returns the promise of Items array
         * @param {string} query Search query. See https://developers.google.com/drive/web/search-parameters?hl=ru for
         * details.
         * @returns {Promise<Item[]>}
         */
        function getItems(query) {
            var deferred = $q.defer();

            var retrievePageOfFiles = function (request, result) {
                request.execute(function (resp) {
                    if (resp.items) {
                        result = result.concat(resp.items);
                    }
                    var nextPageToken = resp.nextPageToken;
                    if (nextPageToken) {
                        request = gapi.client.drive.files.list({ q: query, pageToken: nextPageToken });
                        retrievePageOfFiles(request, result);
                    }
                    else {
                        deferred.resolve(result);
                    }
                });
            };

            var initialRequest = gapi.client.drive.files.list({ q: query });
            retrievePageOfFiles(initialRequest, []);

            return deferred.promise.then(function (rawItems) {
                var items = rawItems.map(function (rawItem) {
                    return getItem(rawItem);
                });

                items.sort(function (a, b) {
                    if (a.isDir === b.isDir) {
                        return a.name < b.name ? -1 : 1;
                    }
                    else {
                        return a.isDir ? -1 : 1;
                    }
                });

                return items;
            });
        }

        that.authorize = function(immediate) {
            var deferred = $q.defer();

            gapi.auth.authorize({'client_id': clientid, 'scope': scopes.join(' '), 'immediate': immediate || false}, function(authResult) {
                if (authResult && !authResult.error) {
                    gapi.client.drive.about.get().execute(function(resp) {
                        that.authorized = true;
                        that.token = gapi.auth.getToken();
                        that.userInfo = resp;
                        deferred.resolve();
//                            console.log('Current user name: ' + resp.name);
//                            console.log('Root folder ID: ' + resp.rootFolderId);
//                            console.log('Total quota (bytes): ' + resp.quotaBytesTotal);
//                            console.log('Used quota (bytes): ' + resp.quotaBytesUsed);
                    });
                }
                else {
                    that.authorized = false;
                    deferred.reject();
                }
            });

            return deferred.promise;
        };

        that.signOut = function() {
            var deferred = $q.defer();

            var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + that.token.access_token;

            // this is strange
            $http.get(url)['finally'](function() {
                that.authorized = false;
                deferred.resolve();
            });

            return deferred.promise;
        };

        /**
         * Loads child Items from drive by parent id (if not cached) and caches them internally to reuse further.
         * @param {string} [parentid = 'root'] parent item id.
         * @returns {Promise<Item[]>}
         */
        that.getItemsByParent = function(parentid) {
            if (!cache[parentid]) {

                var query = "'" + (parentid || 'root') + "' in parents and trashed = false";
                cache[parentid] = getItems(query);
            }

            return cache[parentid];
        };

        /**
         * Loads the file from drive by id.
         * @param {integer} id File id.
         * @returns {Promise<Item>}
         */
        that.getItemById = function(id) {
            var deferred = $q.defer();

            var request = gapi.client.drive.files.get({
                'fileId': id
            });

            request.execute(function(resp) {
                deferred.resolve(getItem(resp));
            });

            return deferred.promise;
        };

        return that;
    });