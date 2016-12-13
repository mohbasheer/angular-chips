(function() {
    angular.module('angular.chips')
        .directive('chipTmpl', ChipTmpl);

    function ChipTmpl() {
        return {
            require: '^^chips',
            transclude: true,
            link: function(scope, iElement, iAttrs, chipsCtrl, transcludefn) {
                transcludefn(scope, function(clonedTranscludedContent) {
                    var html = '';
                    angular.forEach(clonedTranscludedContent, function(it) {
                            html += it.outerHTML || '';
                    });

                    chipsCtrl.registerChild(html)
                    iElement.remove();
                });
            }
        }
    }
})();
