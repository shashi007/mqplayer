'use strict';

angular.module('Playlist', ['ui.slider'])
    .directive('playlist', function($document, $timeout, session) {
        return {
            restrict: 'E',
            scope: {},
            controller: function($scope, $element) {
                console.log('playlist directive controller');

                var player = session.player,
                    playlist = session.playlist;



                $scope.player = player;
                $scope.playlist = playlist;

                var lastClickedRecord;

                var deleteSelected = function() {
                    if (playlist.selectedRecords.length == playlist.records.length) {
                        playlist.records.empty();
                    }
                    else {
                        playlist.selectedRecords.forEach(function(record) {
                            var i = playlist.records.indexOf(record);
                            playlist.records.splice(i, 1);
                        });
                    }
                    playlist.selectedRecords.empty();
                };

                var selectAll = function() {
                    playlist.selectedRecords.empty();
                    playlist.records.forEach(function(record) {
                        record.selected = true;
                        playlist.selectedRecords.push(record);
                    });
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
                    player.playRecord(record);
                };

                $scope.mousedown = function(e, record) {
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
                        playlist.selectedRecords.forEach(function(record) {
                            record.selected = false;
                        });
                        playlist.selectedRecords.empty();

                        record.selected = !record.selected;

                        if (record.selected)
                            playlist.selectedRecords.push(record);
                    }

                    lastClickedRecord = record;

                    e.preventDefault(); // no selection on double click
                };

                $scope.playlistClick = function(e, record) {
                    if (!record)
                        selectNone();

                    e.stopPropagation();
                };

                $document.on('keydown', function(e) {
                    switch (e.keyCode) {
                        case 46: // delete
                            deleteSelected();
                            $scope.$apply();
                            break;
                        case 65: // A
                            if (e.ctrlKey) {
                                e.preventDefault();
                                selectAll();
                                $scope.$apply();
                            }
                            break;
                        case 38: // up arrow
                            moveUp(e);
                            $scope.$apply();
                            break;
                        case 40: // down arrow
                            moveDown(e);
                            $scope.$apply();
                            break;
                        default:
                            break;
                    }
                });
            },
            templateUrl: 'tmpl/playlist.html',
            link: function(scope, element, attrs) {
                var tree = session.tree,
                    playlist = session.playlist;

                element[0].addEventListener('dragover', function(e) {
                    e.preventDefault(); // allow drop
                });

                element[0].addEventListener('dragenter', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    scope.$apply(function() {
                        scope.dragover = true;
                    });
                });

                element[0].addEventListener('dragleave', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $timeout(function() {
                        scope.dragover = false;
                    });
                });

                element[0].addEventListener('drop', function(e) {
                    scope.$apply(function() {
                        scope.dragover = false;
                    });

                    playlist.enqueue(tree.draggedNode);
                });
            }
        };
    })
    .directive('droppableItem', function($timeout, session) {
        return {
            link: function(scope, element, attrs) {
                var tree = session.tree,
                    playlist = session.playlist;

                element[0].addEventListener('dragover', function(e) {
                    e.preventDefault(); // allow drop
                });

                element[0].addEventListener('dragenter', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    scope.$apply(function() {
                        scope.record.dragover = true;
                    });
                });

                element[0].addEventListener('dragleave', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $timeout(function() {
                        scope.record.dragover = false;
                    });
                });

                element[0].addEventListener('drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    playlist.enqueue(tree.draggedNode, scope.record);

                    $timeout(function() {
                        scope.record.dragover = false;
                    });
                });
            }
        }
    });