'use strict';

angular.module('Tree', [])
    .directive('tree', function(Session) {
        return {
            restrict: 'E',
            scope: { },
            controller: function($scope, $element) {
                $scope.player = Session.player;

                $scope.toggleDir = function(node) {
                    node.collapsed = !node.collapsed;
                    return node.getChildren().then(function(nodes) {
                        return nodes;
                    });
                };

                $scope.mousedown = function($event, node) {
                    if (Session.selectedNode)
                        Session.selectedNode.selected = false;

                    Session.selectedNode = node;

                    node.selected = !node.selected;
                };

                $scope.dblclick = function ($event, node) {
                    $scope.player.playNode(node)
                };

                $scope.root = Session.root;
                $scope.loading = true;

                $scope.root.getChildren().then(function(nodes) {
                    $scope.loading = false;
                    return nodes;
                })
                    .then(function(nodes) {
                        if (nodes[0].collapsed)
                            $scope.toggleDir(nodes[0]);
                    });
            },
            link: function(scope, element, attrs) {

            },
            templateUrl: 'tmpl/tree.html'
        };
    })
    .directive('draggable', function(Session) {
        return {
            link: function(scope, element, attrs) {
                var node = scope.node;

                element.attr('draggable', true);

                element[0].addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/html', ''); // needed for FF.
                    Session.draggedNode = node;
                });

                element[0].addEventListener('dragend', function() {
                    delete Session.draggedNode;
                });
            }
        };
    })
    .factory('TreeNode', function($q, DataService) {
        function Ctor(item) {
            this.item = item;
        }

        Ctor.prototype = {
            collapsed: true,
            selected: false,
            loading: false,
            children: undefined,
            getChildren: function() {
                var self = this;
                if (!this.children)
                    this.loading = true;
                return $q.when(this.children || DataService.loadItems(this.item.id).then(function(items) {
                    self.children = items.map(function(item){
                        return new Ctor(item);
                    });
                    self.loading = false;
                    return self.children;
                }));
            },
            // get directory children recursively
            getAllChildren: function() {
                var self = this;
                return this.getChildren().then(function(nodes) {
                    var children = [];
                    var dirs = [];

                    nodes.forEach(function(node, index) {
                        children.push(node);
                        if (node.item.isDir)
                            dirs.push(node);
                    });

                    var result = $q.when(children);

                    dirs.forEach(function(node) {
                        result = result.then(function() {
                            return node.getAllChildren().then(function(nodes) {
                                Array.prototype.splice.apply(children, [children.indexOf(node), 1].concat(nodes));
                                return children;
                            });
                        });
                    });

                    return result;
                });
            }
        };

        return Ctor;
    });