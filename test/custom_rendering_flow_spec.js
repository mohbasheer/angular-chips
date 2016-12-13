'use strict';

describe('Directive chips : Custom Rendering', function() {

    beforeEach(module('angular.chips'));

    var element, scope, compile, template, isolateScope, timeout;

    /*** Custom Rendering ***/

    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();
        scope.samples = [{ name: 'India', fl: 'I' }, { name: 'China', fl: 'C' }, { name: 'America', fl: 'A' }];
        scope.cutomize = function(val) {
            return { name: val, fl: val.charAt(0) }
        };
        scope.deleteChip = function(obj) {
            return obj.name === 'India' ? false : true;
        };
        compile = $injector.get('$compile');
        template = '<chips ng-model="samples" render="cutomize(val)" remove-chip="deleteChip($chip)">' +
            '<chip-tmpl>' +
            '<div class="default-chip">{{chip.name}} , {{chip.fl}}</div>' +
            '</chip-tmpl>' +
            '<input chip-control></input>' +
            '</chips>';
        element = angular.element(template);
        compile(element)(scope);
        scope.$digest();
        isolateScope = element.isolateScope();
    }));

    it('check chips.list values', function() {
        expect(scope.samples).toEqual(isolateScope.chips.list);
    });

    it('check adding chip by passing string', function() {
        isolateScope.chips.addChip('Japan');
        expect(scope.samples[scope.samples.length - 1].name).toBe('Japan');
    });

    it('check chip delete restriction', function() {
	isolateScope.chips.deleteChip(0);

        expect(scope.samples[0].name).toBe('India');
    });

});
