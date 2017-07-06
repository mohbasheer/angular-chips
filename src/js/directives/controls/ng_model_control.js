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

                scope.onSelect = function (item,model,label,event) {
                    if(ngModelCtrl.$modelValue === item)
                        ngModelCtrl.$render()
                }
                
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
