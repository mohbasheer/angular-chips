'use strict';

describe('Directive chips : Using promise with list of Object', function() {

    beforeEach(module('angular.chips'));

    var element, scope, compile, template, isolateScope, timeout;

    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();
        timeout = $injector.get('$timeout');
        scope.usingPromiseObj = {};
        scope.usingPromiseObj.samples = [{ name: 'India', fl: 'I' }, { name: 'China', fl: 'C' }, { name: 'America', fl: 'A' }];

        scope.usingPromiseObj.render = function(val) {
            var promise = timeout(handleRender, 100);

            function handleRender() {
                if (val === 'India') {
                    timeout.cancel(promise);
                } else {
                    return { name: val, fl: val.charAt(0) };
                }
            }
            return promise;
        };

        compile = $injector.get('$compile');

        template = [
            '<chips defer ng-model="usingPromiseObj.samples" render="usingPromiseObj.render(data)">',
                        '<chip-tmpl>',
                            '<chip-item class="default-chip">',
                                '{{chip.isLoading ? chip.defer : chip.defer.name}}',

                                '<span ng-hide="chip.isLoading">({{chip.defer.fl}})</span>',
                                '<remove-button class="glyphicon glyphicon-remove" remove-chip-button></remove-button>',
                                '<div class="loader-container" ng-show="chip.isLoading">',
                                '<i class="fa fa-spinner fa-spin fa-lg loader"></i>',
                                '</div>',
                            '</chip-item>',
                        '</chip-tmpl>',
                        '<input chip-control></input>',
             '</chips>'
        ].join("\n");

        element = angular.element(template);
        compile(element)(scope);
        scope.$digest();
        isolateScope = element.isolateScope();
    }));

    it('check chips.list values', function() {
        expect(scope.usingPromiseObj.samples.length).toEqual(isolateScope.chips.list.length);
    });

    it('check adding chip by passing string', function() {
        isolateScope.chips.addChip('Swedan');
        timeout.flush()
        expect(scope.usingPromiseObj.samples[scope.usingPromiseObj.samples.length - 1].name).toBe('Swedan');
    });

    it('check deleting chip while loading', function() {
        isolateScope.chips.addChip('Canada');
        var lengthBeforeDelete = element.find('chip-item').length;

        angular.element(getChipTmpl(element)).find("remove-button")[0].click();

        expect(lengthBeforeDelete).toEqual(element.find('chip-item').length);
    });

    it('check deleting rejected chip', function() {
        isolateScope.chips.addChip('India');

        expect(scope.usingPromiseObj.samples.length).toBe(3)

        timeout.flush();

        var duplicateChipScope = getChipScope(element,-1);
        expect(duplicateChipScope.chip.isFailed).toBe(true);
        var chipTmpls = element.find('chip-item');

        angular.element(getChipTmpl(element)).find("remove-button")[0].click();

        // rejected chip should get deleted from view
        expect(chipTmpls.length - 1).toEqual(element.find('chip-item').length);
    });

});
