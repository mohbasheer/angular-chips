'use strict';

describe('Directive chips : Using promise with list of string', function() {

    beforeEach(module('angular.chips'));

    var element, scope, compile, template, isolateScope, timeout;

    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();
        timeout = $injector.get('$timeout');
        scope.samples = ['orange', 'apple', 'grapes'];

        scope.render = function(val) {
            var promise = timeout(function() {
                return scope.samples.indexOf(val) === -1 ? val : timeout.cancel(promise)
            }, 100);
            return promise;
        };

        scope.deleteChip = function(obj) {
            return true;
        };

        compile = $injector.get('$compile');

        template = '<chips defer ng-model="samples" render="render(data)">' +
            '<chip-tmpl>' +
            '<div class="default-chip">' +
            '{{chip.defer}}' +
            '<span class="glyphicon glyphicon-remove" remove-chip="deleteChip(data)"></span>' +
            '<div class="loader-container" ng-show="chip.isLoading">' +
            '<i class="fa fa-spinner fa-spin fa-lg loader"></i>' +
            '</div>' +
            '</div>' +
            '</chip-tmpl>' +
            '<input chip-control></input>' +
            '</chips>';
        element = angular.element(template);
        compile(element)(scope);
        scope.$digest();
        isolateScope = element.isolateScope();
    }));

    it('check chips.list values', function() {
        expect(scope.samples.length).toEqual(isolateScope.chips.list.length);
    });

    it('check adding chip by passing string', function() {
        isolateScope.chips.addChip('Banana');
        timeout.flush()
        expect(scope.samples[scope.samples.length - 1]).toBe('Banana');
    });

    /*as per render logic above, adding existing string should reject the promise*/
    it('check adding existing chip, as per the logic adding existing string should reject the promise', function() {
        isolateScope.chips.addChip('orange');
        timeout.flush()
        expect(scope.samples[scope.samples.length - 1]).not.toBe('orange');
    });
});
