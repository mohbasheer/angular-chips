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
            scope: {
                /*
                 * optional to indicate that hitting space will also try to add the text as chip
                 */
                addOnSpace: '&?'
            },
            require: '^chips',
            link: ChipControlLinkFun,
        }
    };
    /*@ngInject*/
    function ChipControlLinkFun(scope, iElement, iAttrs, chipsCtrl) {
        iElement.on('keypress', function(event) {
            var eatSpace = event.keyCode === 32 && scope.addOnSpace;
            if ((event.keyCode === 13 || eatSpace) && event.target.value !== '') {
                if (chipsCtrl.addChip(event.target.value)) {
                  event.target.value = "";
                }
                event.preventDefault();
            } else if (eatSpace) {
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
