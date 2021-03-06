'use strict';

angular.module('app')
    .controller('PlaylistController', function($scope, $document, $timeout, session, Record, helper, $rootScope) {
        var player = session.player,
            playlist = session.playlist,
            tree = session.tree;

        $scope.player = player;
        $scope.playlist = playlist;

        this.getScope = function() {
            return $scope;
        };

        var lastClickedRecord;

        $scope.deleteSelected = function() {
            playlist.removeSelected();
        };

        $scope.selectAll = function() {
            playlist.selectedRecords.empty();
            playlist.records.forEach(function(record) {
                record.selected = true;
                playlist.selectedRecords.push(record);
            });
        };

        $scope.clear = function() {
            playlist.clear();
        };

        var selectNone = function() {
            playlist.selectedRecords.forEach(function(record) {
                record.selected = false;
            });
            playlist.selectedRecords.empty();
        };

        var moveUp = function(e) {
            var nextRecord = playlist.prev(lastClickedRecord, false, false);
            if (nextRecord) {
                $scope.mousedown(e, nextRecord);
            }
        };

        var moveDown = function(e) {
            var nextRecord = playlist.next(lastClickedRecord, false, false);
            if (nextRecord) {
                $scope.mousedown(e, nextRecord);
            }
        };

        $scope.dblclick = function(e, record) {
            $rootScope.$broadcast('player.timeupdate', 0);
            $timeout(function() {
                playlist.rotateShuffledRecords(record);
                player.playRecord(record)
                    .catch(function(error) {
                        $scope.error(error);
                    });
            }); // this is odd - gotta investigate
        };

        var handleSelection;

        $scope.mousedown = function(e, record) {
            if (!record) { // clear selection on playlist mousedown
                if(e.target.id === 'playlist') {
                    selectNone();
                }
                return;
            }

            if (e.shiftKey) {
                if (lastClickedRecord && lastClickedRecord.selected != record.selected) {
                    var i1 = playlist.records.indexOf(lastClickedRecord);
                    var i2 = playlist.records.indexOf(record);
                    var first = i1 < i2 ? i1 + 1 : i2;
                    var last = i1 < i2 ? i2 : i1 - 1;
                    for (var i = first; i <= last; i++) {
                        playlist.records[i].selected = lastClickedRecord.selected;
                        playlist.selectedRecords.push(playlist.records[i]);
                    }
                }
            }
            else if (e.ctrlKey) {
                if (!record.selected) {
                    playlist.selectedRecords.push(record);
                }
                else {
                    var i = playlist.selectedRecords.indexOf(record);
                    playlist.selectedRecords.splice(i, 1);
                }

                record.selected = !record.selected;
            }
            else {
                // reset unhandeld selection when dragging (no mouseup is fired in this case)
                handleSelection = undefined;

                // if this is one the selected records - put off the handling untill mouseup to alow dragging
                // otherwise - hanlde immediately
                if (playlist.selectedRecords.indexOf(record) === -1) {
                    selectRecord(record);
                }
                else {
                    handleSelection = record;
                }
            }

            lastClickedRecord = record;
//                    e.preventDefault(); // no selection on double click
        };

        function selectRecord(record) {
            playlist.selectedRecords.forEach(function(record) {
                record.selected = false;
            });
            playlist.selectedRecords.empty();

            record.selected = !record.selected;

            if (record.selected)
                playlist.selectedRecords.push(record);
        }

        $scope.mouseup = function(e, record) {
            if (handleSelection) {
                selectRecord(handleSelection);
                handleSelection =  undefined;
            }
        };

        function shortcut(e) {
            switch (e.keyCode) {
//                        case 13:
//                            if (playlist.selectedRecords.length > 0) {
//                                var record;
//
//                                if (playlist.selectedRecords.length > 0) {
//                                    record = playlist.selectedRecords[playlist.selectedRecords.length - 1];
//                                }
//                                else if (playlist.records.length > 0) {
//                                    record = playlist.records[0];
//                                }
//
//                                if (record) {
//                                    player.playRecord(record)
//                                        .then(function() {
//                                            $timeout(angular.noop);
//                                        });
//                                }
//                            }
//                            break;
                case 46: // delete
                    $scope.deleteSelected();
                    break;
                case 65: // A
                    if (e.ctrlKey) {
                        $scope.selectAll();
                    }
                    break;
                case 38: // up arrow
                    moveUp(e);
                    break;
                case 40: // down arrow
                    moveDown(e);
                    break;
                default:
                    return;
            }

            $timeout(angular.noop);

            e.preventDefault();
            e.stopPropagation();
        }

        $document.on('keydown', shortcut);

        $scope.$on('$destroy', function() {
            $document.off('keydown', shortcut);
        });

        // drag and drop events of records and playlist

        // drag selected records
        $scope.$on('dragstart', function(e) {
            $scope.dragging = true;
        });

        $scope.$on('dragend', function(e) {
            $scope.dragging = false;
        });

        $scope.$on('dragenter', function(e) {
            var scope = e.targetScope; // record's or playlist's scope

            $scope.$apply(function() {
                if (scope == $scope) { // dragging over the playlist
                    scope.dragover = true;
                }
                else { // draggin over the record
                    scope.record.dragover = true;
                }
            });


        });

        $scope.$on('dragleave', function(e) {
            var scope = e.targetScope; // record's or playlist's scope

            $scope.$apply(function() {
                if (scope == $scope) { // dragging over the playlist
                    scope.dragover = false;
                }
                else { // draggin over the record
                    scope.record.dragover = false;
                }
            });
        });

        $scope.$on('drop', function(e) {
            var scope = e.targetScope;

            $scope.$apply(function() {
                var insertBefore;

                if ($scope != scope) { // dropped over the record
                    insertBefore = scope.record;
                }

                if ($scope.dragging) { // dragging the records around the playlist
                    playlist.move(playlist.selectedRecords, insertBefore);
                }
                else { // dragging the node from the tree
                    playlist.enqueue(helper.getItemRecords(tree.draggedNode.item), insertBefore);
                }

                if (insertBefore) {
                    insertBefore.dragover = false;
                }
                else { // dropped onto the playlist
                    scope.dragover = false;
                }
            });
        });
    });
