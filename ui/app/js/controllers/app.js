'use strict';

angular.module('app')
    .controller('AppController', function($scope, $location, $timeout, session, page, helper, clients, $document, $route, $rootScope) {
        // preload clients
        clients.available().forEach(function(client) {
            clients.load(client.name);
        });

        $scope.page = page;

        $scope.session = session;

        $scope.login = function(service) {
            session.login(service);
        };

        $scope.logout = function(service) {
            session.logout(service);
        };

        // MENU WIDGETS

        $scope.currentMenuWidget = null;

        $scope.isMenuWidgetOpen = function(widget) {
//            return widget == 'playlistManager';
            return $scope.currentMenuWidget == widget;
        };

        $scope.toggleMenuWidget = function(widget) {
            if ($scope.currentMenuWidget == widget) {
                $scope.currentMenuWidget = null;
            }
            else {
                $scope.currentMenuWidget = widget;
            }
        };

        $scope.closeMenuWidget = function() {
            $scope.toggleMenuWidget(null);
        };

        $rootScope.$on('keydown', function(e, keyCode) {
            if (keyCode == 27) {
                $scope.closeMenuWidget();
            }
        });

        // ACCOUNTS
        $scope.toggleAccounts = function(show) {
            if (show !== undefined) {
                $scope.accountsOpen = show;
            }
            else {
                $scope.accountsOpen = !$scope.accountsOpen;
            }
        };

        // PLAYLISTS
        $scope.togglePlaylistManager = function(show) {
            if (show !== undefined) {
                $scope.playlistManagerOpen = show;
            }
            else {
                $scope.playlistManagerOpen = !$scope.playlistManagerOpen;
            }
        };

        // hm...
        $(document).on('mousedown', function(e) {
            if ($(e.target).parents('.dropdown').length === 0) {
                $scope.$apply(function() {
                    $scope.closeMenuWidget();
                });
            }
        });

        $(document).on('click.bs.dropdown.data-api', '.accounts button', function (e) {
            $scope.$apply(function() {
                $scope.toggleAccounts(false);
            });
        });
        // END OF ACCOUNTS

        $scope.mousedown = function() {
            $scope.$emit('mousedown');
        };

        $scope.keydown = function(e) {
            $scope.$emit('keydown', e.keyCode);
        };
    });