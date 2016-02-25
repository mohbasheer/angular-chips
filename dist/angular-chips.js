(function() {
    angular.module('angular.chips', [])
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
                    if (event.code === 'Backspace') {
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
        .directive('chips', Chips)
        .controller('chipsController', ChipsController);

    function isPromiseLike(obj) {
        return obj && angular.isFunction(obj.then);
    }

    function Chips($compile, $timeout, DomUtil) {
        function linkFun(scope, iElement, iAttrs, ngModelCtrl, transcludefn) {
            if ((error = validation(iElement)) !== undefined) {
                throw error;
            }
            /*
             *  @scope.chips.addChip should be called by chipControl directive or custom XXXcontrol directive developed by end user
             *  @scope.chips.deleteChip will be called by removeChip directive
             *
             */
            scope.chips.addChip = function(data) {
                var updatedData;
                scope.render !== undefined ? updatedData = scope.render({ data: data }) : updatedData = data;
                isPromiseLike(updatedData) ? updatedData.then(update) : update();

                function update() {
                    scope.chips.list.push(updatedData);
                    ngModelCtrl.$setViewValue(scope.chips.list);
                }
            };

            scope.chips.deleteChip = function(index) {
                scope.chips.list.splice(index, 1);
                ngModelCtrl.$setViewValue(scope.chips.list);
            }

            ngModelCtrl.$render = function() {
                scope.chips.list = angular.copy(ngModelCtrl.$modelValue);
            }

            var chipNavigate = null;
            /*
             * @index selected chip index
             * @return function, which will return the chip index based on left or right arrow pressed
             */
            function chipNavigator(index) {
                return function(direction) {
                    direction === 'ArrowLeft' ? index-- : index++;
                    index = index < 0 ? scope.chips.list.length - 1 : index > scope.chips.list.length - 1 ? 0 : index;
                    return index;
                }
            }
            /*Below code will extract the chip-tmpl and compile inside the chips directive scope*/
            var rootDiv = angular.element('<div></div>');
            var tmpl = iElement.find('chip-tmpl').remove();
            tmpl.attr('ng-repeat', 'chip in chips.list track by $index');
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
            iElement.find('input').on('focusin', function() {
                chipNavigate = null;
            });
            /*this method will handle 'delete or Backspace' and left, right key press*/
            iElement.on('keydown', function(event) {
                if (event.target.nodeName !== 'INPUT' && event.target.nodeName !== 'CHIP-TMPL' || (iElement.find('chip-tmpl').length === 0 && event.target.value === ''))
                    return;

                var chipTmpls;

                function focusOnChip() {
                    chipTmpls = iElement.find('chip-tmpl');
                    chipTmpls[chipTmpls.length - 1].focus();
                    chipNavigate = chipNavigator(chipTmpls.length - 1);
                }

                if (event.code === 'Backspace') {
                    if (event.target.nodeName === 'INPUT' && event.target.value === '') {
                        focusOnChip();
                    } else if (event.target.nodeName === 'CHIP-TMPL') {
                        /*
                         * This block will be called during chip deletion using delete or Backspace key
                         * Below code will set the focus of the next available chip
                         */
                        var chipTemplates = iElement.find('chip-tmpl');
                        if (chipTemplates.length > 0 && parseInt(event.target.getAttribute('index')) - 1 === chipTemplates.length)
                            iElement.find('chip-tmpl')[chipNavigate('ArrowLeft')].focus();
                    }
                } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                    chipNavigate === null ? focusOnChip() : iElement.find('chip-tmpl')[chipNavigate(event.code)].focus();
                }
            });

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
        var error;
        if (element.find('chip-tmpl').length === 0) {
            error = 'should have chip-tmpl';
        } else {
            if (element.children().length > 1) {
                error = 'should have only one chip-tmpl';
            } else if (element.children().length < 1) {
                error = 'should have one chip-tmpl';
            }
        }
        return error;
    }

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

        utilObj.attr = function(attrName) {
            function hasAttribute(element, attrName) {
                var result = element.attr(attrName)
                if (result !== undefined)
                    return result

                if (element.children().length > 0) {
                    return hasAttribute(element.children(), attrName);
                } else {
                    return result;
                }
            }

            return angular.extend([hasAttribute(element, attrName)], utilObj);
        };

        return utilObj;
    }
})();

(function() {
    angular.module('angular.chips')
        .directive('removeChip', RemoveChip);

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

                function findScope(scope, prop) {
                    if (!scope.hasOwnProperty(prop.split('.')[0])) {
                        return findScope(scope.$parent, prop)
                    }
                    return scope;
                };

                function deleteChip() {
                    var callBack, deleteIt = true;
                    if (iAttrs.hasOwnProperty('removeChip')) {
                        callBack = getCallBack(findScope(scope, iAttrs.removeChip), iAttrs.removeChip);
                    }
                    deleteIt = callBack(scope.chip);
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
        .directive('chipControl', ChipControl);

    function ChipControl() {
        return {
            restrict: 'A',
            require: '^chips',
            link: ChipControlLinkFun,
        }
    };

    function ChipControlLinkFun(scope, iElement, iAttrs, chipsCtrl) {
        iElement.on('keypress', function(event) {
            if (event.keyIdentifier === 'Enter') {
                chipsCtrl.addChip(event.target.value);
                event.target.value = "";
            }
        });
        iElement.on('focusin', function() {
            chipsCtrl.setFocus(true);
        });
        iElement.on('focusout', function() {
            chipsCtrl.setFocus(false);
        });
    };
})();

(function(module) {
try { module = angular.module("angular.chips"); }
catch(err) { module = angular.module("angular.chips", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("src/templates/chip.tmpl.html",
    "<!-- <div ng-transclude ng-repeat=\"name in chips.list\"> -->\n" +
    "<div ng-transclude>\n" +
    "</div>");
}]);
})();