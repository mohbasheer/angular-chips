(function() {
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
            scope: {
                addOnBlur: '&?'
            },
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

            if (scope.addOnBlur && event.target.value !== '' && chipsCtrl.addChip(event.target.value)) {
              event.target.value = '';
            }
        });
    };
})();
