'use strict';

angular.module('Services')
    .factory('session', function(Player, Playlist, Tree, DataService, Page) {
        return {
            active: false,
            userInfo: undefined,
            login: function(auto) {
                if (auto)
                    this.authorizing = true;

                var self = this;

                return DataService.authorize(auto)
                    .then(function() {
                        self.start();
                        self.active = true;
                        self.userInfo = DataService.userInfo;

                        self.authorizing = false;
                    });
            },
            logout: function() {
                var self = this;
                return DataService.signOut()
                    .then(function() {
                        self.end();
                        self.active = false;
                    });
            },
            start: function() {
                this.playlist = new Playlist();
                this.tree = new Tree();
                this.player = new Player();
            },
            end: function() {
                this.player.stop();
                this.player = undefined;
                this.tree = undefined;
                this.playlist = undefined;
                Page.setTitle('Music Queue');
            }
        };
    });