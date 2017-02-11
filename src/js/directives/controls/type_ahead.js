(function () {
    'use strict';

    angular
        .module('angular.chips')
        .directive('typeAhead', TypeAhead);

    TypeAhead.$inject = ['$timeout','$compile'];
    function TypeAhead($timeout, $compile) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: ControllerController,
            controllerAs: 'dropdown',
            link: link,
            restrict: 'A',
            require: ['ngModel', '^chips'],
            scope: {
                optionList: "=typeAhead",
            }
        };
        return directive;

        function link(scope, element, attrs, ctrls) {
            scope.dropdown.chipCtrl = ctrls[1];
            scope.dropdown.$ctrl = ctrls[0];
            scope.dropdown.displayKey = attrs.displayKey;
            scope.dropdown.valueKey = attrs.valueKey;

            var eleParent = $(element).parents('chips');

            function computeDropDownStyle() {
                scope.listStyle = {
                    width: eleParent.width() + 15 + 'px',
                    'margin-left': '-5px',
                    top: eleParent.height() + 10 + 'px'
                }
            }
            $timeout(computeDropDownStyle, 3000);

            var listElemText = '<ul class="typeaheadlist" id="{{$id}}" ng-if="dropdown.showAhead" ng-style="listStyle">' +
                '<li class="list-item" ng-repeat="option in dropdown.optionList | filter: dropdown.$ctrl.$modelValue track by $index" ng-click="dropdown.selectItem(option)">' +
                '{{option[dropdown.displayKey] || option}}</li>' +
                '</li></ul>';

            var ulList = angular.element(listElemText);
            var node = $compile(ulList)(scope);

            eleParent.append(node);

            var currentListItem = null;
            element.on('keydown focus', function (event) {

                if (event.keyCode == 8 && !scope.dropdown.$ctrl.$modelValue) {
                    scope.dropdown.showAhead = false;
                    scope.$apply();
                    return;
                }

                if (event.keyCode == 13) {
                    scope.dropdown.showAhead = false;
                    currentListItem != null ? angular.element('.list-item.active').triggerHandler('click') : "";
                    currentListItem.removeClass('active');
                    currentListItem = null;
                } else if (event.keyCode == 40) {
                    scope.dropdown.showAhead = true;
                    if (currentListItem) {
                        currentListItem.removeClass('active');
                        currentListItem = currentListItem.next().length == 0 ? $('.typeaheadlist .list-item').first() : currentListItem.next();
                        currentListItem.addClass('active');
                    } else {
                        var listItems = $('.typeaheadlist .list-item');
                        listItems.each(function (index) {
                            if ($(this).hasClass('active'))
                                currentListItem = $(this);
                        });
                        if (!currentListItem) {
                            currentListItem = listItems.first();
                            currentListItem.addClass('active');
                        }
                    }
                } else if (event.keyCode == 38 && currentListItem) {
                    currentListItem.removeClass('active');
                    currentListItem = currentListItem.prev().length == 0 ? $('.typeaheadlist .list-item').last() : currentListItem.prev();
                    currentListItem.addClass('active');
                } else {
                    scope.dropdown.showAhead = true;
                }
                scope.$apply();
            });

            function outsideClickHandler(event) {
                if ($(event.target)[0] != $('chips')[0] && $(event.target)[0] != $(element)[0] && $(event.target)[0] != $('#' + scope.$id)[0]) {
                    scope.dropdown.showAhead = false;
                    currentListItem = null;
                    scope.$apply();
                }
            };

            $(document).on('click', outsideClickHandler);

            scope.$on('$destroy', function () {
                $(document).off('click', outsideClickHandler);
            });
        }
    }
    /* @ngInject */
    function ControllerController($scope) {
        this.selectItem = function (data) {
            this.showAhead = false;
            if (this.valueKey != null) {
                var keys = this.valueKey.split(',');
                var obj = {};
                for (var key in keys) {
                    key = keys[key];
                    obj[key] = data[key];
                }
                this.chipCtrl.addChip(obj);
            } else {
                this.chipCtrl.addChip(data);
            }
            //reset fitler text
            this.$ctrl.$setViewValue('');
            this.$ctrl.$render();
        }

    }
})();