(function() {
    angular.module('angular.chips', [])
        .directive('chips', Chips)
        .controller('chipsController', ChipsController);

    function isPromiseLike(obj) {
        return obj && angular.isFunction(obj.then);
    }

    var KEYS = {
            BACKSPACE: 8,
            LEFT: 37,
            RIGHT: 39
    }

    /*
     * update values to ngModel reference
     */
    function ngModel(modelCtrl) {
        return {
            add: function(val) {
                var modelCopy = angular.copy(modelCtrl.$modelValue) || [];
                modelCopy.push(val)
                modelCtrl.$setViewValue(modelCopy);
            },
            delete: function(index) {
                var modelCopy = angular.copy(modelCtrl.$modelValue);
                modelCopy.splice(index, 1);
                modelCtrl.$setViewValue(modelCopy);
            },
            deleteByValue: function(val) {
                var index, resultIndex;
                for (index = 0; index < modelCtrl.$modelValue.length; index++) {
                    if (angular.equals(modelCtrl.$modelValue[index], val)) {
                        resultIndex = index;
                        break;
                    }

                }
                if (resultIndex !== undefined)
                    this.delete(resultIndex)
            }
        }
    }

    function DeferChip(data, promise) {
        var self = this;
        this.type = 'defer';
        this.defer = data;
        this.isLoading = false;
        this.isFailed = false;

        if (promise) {
            self.isLoading = true;
            promise.then(function(data) {
                self.defer = data;
                self.isLoading = false;
            }, function(data) {
                self.defer = data;
                self.isLoading = false;
                self.isFailed = true;
            });
        }
    }

    /*
     * get function param key
     * example: 'render(data)' data is the key here
     * getParamKey('render(data)') will return data
     */
    function getParamKey(funStr) {
        if (funStr === undefined)
            return;
        var openParenthesisIndex, closeParenthesisIndex;
        openParenthesisIndex = funStr.indexOf('(') + 1;
        closeParenthesisIndex = funStr.indexOf(')');
        return funStr.substr(openParenthesisIndex, closeParenthesisIndex - openParenthesisIndex);
    }
    /*@ngInject*/
    function Chips($compile, $timeout, DomUtil) {
        /*@ngInject*/
        function linkFun(scope, iElement, iAttrs, ngModelCtrl, transcludefn) {
            if (! scope.chipTemplate) {
                throw "should have chip-tmpl";
            }

            var model = ngModel(ngModelCtrl);
            var isDeferFlow = iAttrs.hasOwnProperty('defer');
            var functionParam = getParamKey(iAttrs.render);
            var rootDiv;
            var inputElement = iElement.find('input')[0];

            /*
             *  @scope.chips.addChip should be called by chipControl directive or custom XXXcontrol directive developed by end user
             *  @scope.chips.deleteChip will also be called by removeChipButton directive
             *
             */

            /*
             * ngModel values are copies here
             */
            //scope.chips.list;

            scope.chips.addChip = function(data) {
                var updatedData, paramObj;

                if (scope.render !== undefined && functionParam !== '') {
                    paramObj = {};
                    paramObj[functionParam] = data;
                    updatedData = scope.render(paramObj)
                } else { updatedData = data }

                if (isPromiseLike(updatedData)) {
                    updatedData.then(function(response) {
                        model.add(response);
                    });
                    scope.chips.list.push(new DeferChip(data, updatedData));
                    scope.$apply();
                } else {
                    update(updatedData);
                }

                function update(data) {
                    scope.chips.list.push(data);
                    model.add(data);
                }

                if (scope.onAdd) {
                    scope.onAdd({$chip: data});
                }
            };

            scope.chips.deleteChip = function(index) {
                if (index < 0 || index >= scope.chips.list.length) {
                    return;
                }

                var deletedChip = scope.chips.list[index];
                if (scope.removeChip && !scope.removeChip({"$chip": deletedChip})) {
                    return;
                }

                scope.chips.list.splice(index, 1);
                if (deletedChip.isFailed) {
                    scope.$apply();
                    return;
                }

                if (deletedChip instanceof DeferChip) {
                    model.deleteByValue(deletedChip.defer);
                } else {
                    model.delete(index);
                }

                if (scope.onRemove) {
                    scope.onRemove({$chip: deletedChip});
                }

                return true;
            }

            /*
             * ngModel values are copied when it's updated outside
             */
            ngModelCtrl.$render = function() {
                if (isDeferFlow && ngModelCtrl.$modelValue) {
                    var index, list = [];
                    for (index = 0; index < ngModelCtrl.$modelValue.length; index++) {
                        // list.push(ngModelCtrl.$modelValue[index]);
                        list.push(new DeferChip(ngModelCtrl.$modelValue[index]))
                    }
                    scope.chips.list = list;
                } else {
                    scope.chips.list = angular.copy(ngModelCtrl.$modelValue) || [];
                }

            }

            /*Extract the chip-tmpl and compile inside the chips directive scope*/
            rootDiv = angular.element('<div></div>');
            var tmpl = angular.element(scope.chipTemplate);
            var chipTextNode, chipBindedData, chipBindedDataSuffix;
            tmpl.attr('ng-repeat', 'chip in chips.list track by $index');
            tmpl.attr('ng-class', '{\'chip-failed\':chip.isFailed}')
            tmpl.attr('tabindex', '-1')
            tmpl.attr('index', '{{$index}}')
            rootDiv.append(tmpl);
            var node = $compile(rootDiv)(scope);
            iElement.prepend(node);


            /*clicking on chips element should set the focus on INPUT*/
            iElement.on('click', function(event) {
                if (event.target.nodeName === 'CHIPS')
                    inputElement.focus();
            });
            /*this method will handle 'delete or Backspace' and left, right key press*/
            scope.chips.handleKeyDown = function(event) {
                if (event.target === inputElement && inputElement.value.length > 0) {
                    return;
                }

                var chipElements = rootDiv.children();

                function focusOnChip(direction) {
                    var index;
                    var attrIndex = parseInt(event.target.getAttribute("index"));

                    if (attrIndex >= 0) {
                        index = attrIndex;
                    } else {
                        index = chipElements.length;
                    }

                    var nextIndex = index + direction;

                    if (nextIndex < 0) {
                        if (scope.chips.list.length === 0) {
                            inputElement.focus();
                        }
                    } else if (nextIndex >= chipElements.length) {
                        inputElement.focus();
                    } else {
                        chipElements[nextIndex].focus();
                    }
                }

                if (event.keyCode === KEYS.BACKSPACE) {
                    var index = parseInt(event.target.getAttribute("index"));

                    if (event.target === inputElement && event.target.value === '') {
                        focusOnChip(-1);
                    } else if (event.target.parentElement === rootDiv[0]) {
                        if (scope.chips.deleteChip(index)) {
                            focusOnChip(-1);
                        }
                    }
                    event.preventDefault();

                } else if (event.keyCode === KEYS.LEFT) {
                    focusOnChip(-1);
                } else if (event.keyCode === KEYS.RIGHT) {
                    focusOnChip(+1);
                }
            };

            iElement.on('keydown', scope.chips.handleKeyDown);

            DomUtil(iElement).addClass('chip-out-focus');
        }

        return {
            restrict: 'E',
            scope: {
                /*
                 * optional callback, this will be called before rendering the data,
                 * user can modify the data before it's rendered
                 */
                render: '&?',
                /*
                     *  optional callback, this will be triggered before chips are removed
                *  remove-chip="callback($chip)"
                     *  Call back method should return true to remove or false for nothing
                */
                removeChip: '&?',
                onAdd: '&?',
                onRemove: '&?'
            },
            transclude: true,
            require: 'ngModel',
            link: linkFun,
            controller: 'chipsController',
            controllerAs: 'chips',
            template: '<div ng-transclude></div>'
        }


    };
    /*@ngInject*/
    function ChipsController($scope, $element, DomUtil) {
        this.registerChild = function(html) {
                if ($scope.chipTemplate) {
                        throw 'should have only one chip-tmpl';
                }

                $scope.chipTemplate = html;
        };

        /*toggling input controller focus*/
        this.setFocus = function(flag) {
            if (flag) {
                DomUtil($element).removeClass('chip-out-focus').addClass('chip-in-focus');
            } else {
                DomUtil($element).removeClass('chip-in-focus').addClass('chip-out-focus');
            }
        }
        this.removeChip = function(data, index) {
            $scope.chips.deleteChip(index);
        }
    }
})();
