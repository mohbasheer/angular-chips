(function() {
    angular.module('angular.chips')
        .directive('removeChipButton', RemoveChip);

    function RemoveChip() {
        return {
            restrict: 'A',
            require: '^?chips',
            link: function(scope, iElement, iAttrs, chipsCtrl) {
                function deleteChip() {
                    // don't delete the chip which is loading
                    if (typeof scope.chip !== 'string' && scope.chip.isLoading)
                        return;

                    chipsCtrl.removeChip(scope.chip, scope.$index);
                };

                iElement.on('click', function() {
                    deleteChip();
                });
            }
        }
    }
})();
