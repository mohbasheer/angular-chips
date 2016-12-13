'use strict';

describe('Directive chips : callbacks', function() {

    beforeEach(module('angular.chips'));

    var element, scope, compile, template, isolateScope, timeout;
    var input;

    /*** Basic flow ***/

    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();

        scope.samples = ['Apple', 'Cisco', 'Verizon', 'Microsoft'];

        scope.addCallback = function(x, y) {};

        scope.removeCallback = function(x, y) {};

        compile = $injector.get('$compile');
        template = [
            '<chips ng-model="samples" on-add="addCallback(\'a string\', $chip)"',
                    'on-remove="removeCallback(\'another string\', $chip)">',
                '<chip-tmpl>',
                    '<chip-item>{{chip}}</chip-item>',
                '</chip-tmpl>',
                '<input chip-control></input>',
            '</chips>'
        ].join("\n");

        element = angular.element(template);
        compile(element)(scope);
        scope.$digest();
        isolateScope = element.isolateScope();
        input = element.find('input')[0];
    }));

    it('calls on-add callback when new chip is added', function() {
        spyOn(scope, 'addCallback');

        isolateScope.chips.addChip('new-chip-value');

        expect(scope.addCallback).toHaveBeenCalledWith('a string', 'new-chip-value');
    });

    it('calls on-remove callback when a chip is removed', function() {
        spyOn(scope, 'removeCallback');

        isolateScope.chips.deleteChip(2);

        expect(scope.removeCallback).toHaveBeenCalledWith('another string', 'Verizon');
    });
});
