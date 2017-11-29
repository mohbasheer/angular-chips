(function() {
    Chips.$inject = ["$q", "$compile", "$timeout", "DomUtil"];
    ChipsController.$inject = ["$scope", "$element", "DomUtil"];
    angular.module('angular.chips', [])
        .directive('chips', Chips)
        .controller('chipsController', ChipsController);

    function isPromiseLike(obj) {
        return obj && angular.isFunction(obj.then);
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
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
    function Chips($q, $compile, $timeout, DomUtil) {
        /*@ngInject*/
        linkFun.$inject = ["scope", "iElement", "iAttrs", "ngModelCtrl", "transcludefn"];
        function linkFun(scope, iElement, iAttrs, ngModelCtrl, transcludefn) {
            if ((error = validation(iElement)) !== '') {
                throw error;
            }

            var model = ngModel(ngModelCtrl);
            var isDeferFlow = iAttrs.hasOwnProperty('defer');
            var functionParam = getParamKey(iAttrs.render);

            /*
             *  @scope.chips.addChip should be called by chipControl directive or custom XXXcontrol directive developed by end user
             *  @scope.chips.deleteChip will be called by removeChip directive
             *
             */

            /*
             * ngModel values are copies here
             */
            scope.chips.list;

            scope.chips.addChip = function(data) {
                var updatedData, paramObj;

                if (scope.render !== undefined && functionParam !== '') {
                    paramObj = {};
                    paramObj[functionParam] = data;
                    updatedData = scope.render(paramObj);
                } else { updatedData = data }

                if (!updatedData) {
                    return false;
                }

                if (isPromiseLike(updatedData)) {
                    updatedData = updatedData.then(function(response) {
                        if (response == null || (isArray(response) && !response.length)) {
                            throw data; // got no data
                        }
                        var arr = isArray(response) ? response : [response];
                        var first = arr.shift(); // get first element, it will be populated to DeferChip
                        update(arr, true); // add all other elements, if any
                        model.add(first);
                        return first;
                    })
                    scope.chips.list.push(new DeferChip(data, updatedData));
                    scope.$apply();
                } else {
                    update(updatedData);
                }

                function update(data, defer) {
                    var arr = isArray(data) ? data : [data];
                    for (var i = 0; i < arr.length; i++) {
                        scope.chips.list.push(defer ? new DeferChip(arr[i], $q.when(arr[i])) : arr[i]);
                        model.add(arr[i]);
                    }
                }

                return true;
            };

            scope.chips.deleteChip = function(index) {
                var deletedChip = scope.chips.list.splice(index, 1)[0];
                if (deletedChip.isFailed) {
                    scope.$apply();
                    return;
                }

                deletedChip instanceof DeferChip ? model.deleteByValue(deletedChip.defer) : model.delete(index);
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

            var chipNavigate = null;
            /*
             * @index selected chip index
             * @return function, which will return the chip index based on left or right arrow pressed
             */
            function chipNavigator(index) {
                return function(direction) {
                    direction === 37 ? index-- : index++;
                    index = index < 0 ? scope.chips.list.length - 1 : index > scope.chips.list.length - 1 ? 0 : index;
                    return index;
                }
            }

            /*Extract the chip-tmpl and compile inside the chips directive scope*/
            var rootDiv = angular.element('<div></div>');
            var tmplStr = iElement.html();
            tmplStr = tmplStr.substr(tmplStr.indexOf('<chip-tmpl'),tmplStr.indexOf('</chip-tmpl>')-('</chip-tmpl>').length);
            iElement.find('chip-tmpl').remove();
            var tmpl = angular.element(tmplStr);
            var chipTextNode, chipBindedData, chipBindedDataSuffix;
            tmpl.attr('ng-repeat', 'chip in chips.list track by $index');
            tmpl.attr('ng-class', '{\'chip-failed\':chip.isFailed}')
            tmpl.attr('tabindex', '-1')
            tmpl.attr('index', '{{$index+1}}')
            rootDiv.append(tmpl);
            var node = $compile(rootDiv)(scope);
            iElement.prepend(node);


            /*clicking on chips element should set the focus on INPUT*/
            iElement.on('click', function(event) {
                if (event.target.nodeName === 'CHIPS')
                    iElement.find('input')[0].focus();
            });
            /*on every focus we need to nullify the chipNavigate*/
            iElement.find('input').on('focus', function() {
                chipNavigate = null;
            });
            /*this method will handle 'delete or Backspace' and left, right key press*/
            scope.chips.handleKeyDown = function(event) {
                if (event.target.nodeName !== 'INPUT' && event.target.nodeName !== 'CHIP-TMPL' || (iElement.find('chip-tmpl').length === 0 && event.target.value === ''))
                    return;

                var chipTmpls;

                function focusOnChip() {
                    var index = parseInt(document.activeElement.getAttribute('index')) || (chipTmpls = iElement.find('chip-tmpl')).length;
                    chipTmpls = iElement.find('chip-tmpl');
                    chipTmpls[index - 1].focus();
                    chipNavigate = chipNavigator(index-1);
                    if(event.target.nodeName !== 'INPUT')
                        chipTmpls[chipNavigate(event.keyCode)].focus();
                }

                if (event.keyCode === 8) {
                    if (event.target.nodeName === 'INPUT' && event.target.value === '') {
                        focusOnChip();
                        event.preventDefault();
                    } else if (event.target.nodeName === 'CHIP-TMPL') {
                        /*
                         * This block will be called during chip deletion using delete or Backspace key
                         * Below code will set the focus of the next available chip
                         */
                        var chipTemplates = iElement.find('chip-tmpl');
                        if (chipTemplates.length > 0 && parseInt(event.target.getAttribute('index')) - 1 === chipTemplates.length)
                            iElement.find('chip-tmpl')[chipNavigate(37)].focus();
                    }

                } else if (event.keyCode === 37 || event.keyCode === 39) {
                    chipNavigate === null ? focusOnChip() : iElement.find('chip-tmpl')[chipNavigate(event.keyCode)].focus();
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
                render: '&?'
            },
            transclude: true,
            require: 'ngModel',
            link: linkFun,
            controller: 'chipsController',
            controllerAs: 'chips',
            template: '<div ng-transclude></div>'
        }


    };
    /* <chip-tmpl> tag is mandatory added validation to confirm that*/
    function validation(element) {
        return element.find('chip-tmpl').length === 0 ? 'should have chip-tmpl' : element.find('chip-tmpl').length > 1 ? 'should have only one chip-tmpl' : '';
    }
    /*@ngInject*/
    function ChipsController($scope, $element, DomUtil) {
        /*toggling input controller focus*/
        this.setFocus = function(flag) {
            if (flag) {
                DomUtil($element).removeClass('chip-out-focus').addClass('chip-in-focus');
            } else {
                DomUtil($element).removeClass('chip-in-focus').addClass('chip-out-focus');
            }
        }
        this.removeChip = function(data, index) {
            this.deleteChip(index);
        }
    }
})();

(function() {
    angular.module('angular.chips')
        .directive('chipTmpl', ChipTmpl);

    function ChipTmpl() {
        return {
            restrict: 'E',
            transclude: true,
            link: function(scope, iElement, iAttrs, contrl, transcludefn) {
                transcludefn(scope, function(clonedTranscludedContent) {
                    iElement.append(clonedTranscludedContent);
                });
                iElement.on('keydown', function(event) {
                    if (event.keyCode === 8) {
                        scope.$broadcast('chip:delete');
                        event.preventDefault();
                    }
                });
            }
        }
    }
})();

(function() {
    angular.module('angular.chips')
        .directive('removeChip', RemoveChip);
    /*
     *  Will remove the chip
     *  remove-chip="callback(chip)"> call back will be triggered before remove
     *  Call back method should return true to remove or false for nothing
     */
    function RemoveChip() {
        return {
            restrict: 'A',
            require: '^?chips',
            link: function(scope, iElement, iAttrs, chipsCtrl) {

                function getCallBack(scope, prop) {
                    var target;
                    if (prop.search('\\(') > 0) {
                        prop = prop.substr(0, prop.search('\\('));
                    }
                    if (prop !== undefined) {
                        if (prop.split('.').length > 1) {
                            var levels = prop.split('.');
                            target = scope;
                            for (var index = 0; index < levels.length; index++) {
                                target = target[levels[index]];
                            }
                        } else {
                            target = scope[prop];
                        }
                    }
                    return target;
                };

                /*
                 * traverse scope hierarchy and find the scope
                 */
                function findScope(scope, prop) {
                    var funStr = prop.indexOf('.') !== -1 ? prop.split('.')[0] : prop.split('(')[0];
                    if (!scope.hasOwnProperty(funStr)) {
                        return findScope(scope.$parent, prop)
                    }
                    return scope;
                };

                function deleteChip() {
                    // don't delete the chip which is loading
                    if (typeof scope.chip !== 'string' && scope.chip.isLoading)
                        return;
                    var callBack, deleteIt = true;
                    if (iAttrs.hasOwnProperty('removeChip') && iAttrs.removeChip !== '') {
                        callBack = getCallBack(findScope(scope, iAttrs.removeChip), iAttrs.removeChip);
                        deleteIt = callBack(scope.chip);
                    }
                    if (deleteIt)
                        chipsCtrl.removeChip(scope.chip, scope.$index);
                };

                iElement.on('click', function() {
                    deleteChip();
                });

                scope.$on('chip:delete', function() {
                    deleteChip();
                });

            }
        }
    }
})();

(function() {
    angular.module('angular.chips')
        .factory('DomUtil', function() {
            return DomUtil;
        });
    /*Dom related functionality*/
    function DomUtil(element) {
        /*
         * addclass will append class to the given element
         * ng-class will do the same functionality, in our case
         * we don't have access to scope so we are using this util methods
         */
        var utilObj = {};

        utilObj.addClass = function(className) {
            utilObj.removeClass(element, className);
            element.attr('class', element.attr('class') + ' ' + className);
            return utilObj;
        };

        utilObj.removeClass = function(className) {
            var classes = element.attr('class').split(' ');
            var classIndex = classes.indexOf(className);
            if (classIndex !== -1) {
                classes.splice(classIndex, 1);
            }
            element.attr('class', classes.join(' '));
            return utilObj;
        };

        return utilObj;
    }
})();

(function() {
    ChipControlLinkFun.$inject = ["scope", "iElement", "iAttrs", "chipsCtrl"];
    angular.module('angular.chips')
        .directive('chipControl', ChipControl);

    /*
     * It's for normal input element
     * It send the value to chips directive when press the enter button
     */
    function ChipControl() {
        return {
            restrict: 'A',
            require: '^chips',
            link: ChipControlLinkFun,
        }
    };
    /*@ngInject*/
    function ChipControlLinkFun(scope, iElement, iAttrs, chipsCtrl) {
        iElement.on('keypress', function(event) {
            if (event.keyCode === 13) {
                if (event.target.value !== '' && chipsCtrl.addChip(event.target.value)) {
                  event.target.value = "";
                }
                event.preventDefault();
            }
        });

        iElement.on('focus', function() {
            chipsCtrl.setFocus(true);
        });
        iElement.on('blur', function() {
            chipsCtrl.setFocus(false);
        });
    };
})();

(function() {
    angular.module('angular.chips')
        .directive('ngModelControl', NGModelControl);

    /*
     * It's for input element which uses ng-model directive
     * example: bootstrap typeahead component
     */
    function NGModelControl() {
        return {
            restrict: 'A',
            require: ['ngModel', '^chips'],
            link: function(scope, iElement, iAttrs, controller) {
                var ngModelCtrl = controller[0],
                    chipsCtrl = controller[1];
                ngModelCtrl.$render = function(event) {
                    if (!ngModelCtrl.$modelValue)
                        return;
                    if (chipsCtrl.addChip(ngModelCtrl.$modelValue)) {
                      iElement.val('');
                    }
                }

                iElement.on('focus', function() {
                    chipsCtrl.setFocus(true);
                });
                iElement.on('blur', function() {
                    chipsCtrl.setFocus(false);
                });
            }
        }
    }
})();
