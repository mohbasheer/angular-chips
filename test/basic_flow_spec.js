'use strict';

describe('Directive chips : Basic flow', function() {

    beforeEach(module('angular.chips'));

    var element, scope, compile, template, isolateScope, timeout;
    var input;

    /*** Basic flow ***/

    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();
        scope.samples = ['Apple', 'Cisco', 'Verizon', 'Microsoft'];
        compile = $injector.get('$compile');
        template = '<chips ng-model="samples">' +
            '<chip-tmpl>' +
            '<chip-item class="default-chip">{{chip}}<span class="glyphicon glyphicon-remove" remove-chip-button></span></chip-item>' +
            '</chip-tmpl>' +
            '<input chip-control></input>' +
            '</chips>';
        element = angular.element(template);
        compile(element)(scope);
        scope.$digest();
        isolateScope = element.isolateScope();
	input = element.find('input')[0];
    }));

    it('check chips.list values', function() {
        expect(scope.samples).toEqual(isolateScope.chips.list);
    });

    it('check adding chip by passing string', function() {
        isolateScope.chips.addChip('Pramati');
        expect(scope.samples.indexOf('Pramati')).not.toBe(-1);
    });

    it('pressing Enter key on INPUT element should add the chip',function(){
        var inputEle = element.find('INPUT')[0];
        inputEle.value = 'Spain';
        var event = new Event('keypress');
        event.keyCode = 13;
        inputEle.dispatchEvent(event);
        expect(scope.samples[scope.samples.length-1]).toBe('Spain');
    });

    it('check deleting chip by passing string', function() {
        isolateScope.chips.deleteChip(scope.samples.indexOf('Pramati'));
        expect(scope.samples.indexOf('Pramati')).toBe(-1);
    });

    it('keydown on chips should focus on input', function() {
        spyOn(element.find('input')[0], 'focus');
        element[0].click();
        expect(element.find('input')[0].focus).toHaveBeenCalled()
    });

    it('pressing backspace should focus on last chip', function() {
	input.value = "";
        var event = {
            keyCode: 8,
            preventDefault: angular.noop,
            target: input
        };
	input.focus();

        var chipTmpls = element.find('chip-item');
        var lastchipTmpl = chipTmpls[chipTmpls.length - 1];
        spyOn(lastchipTmpl, 'focus');
        isolateScope.chips.handleKeyDown(event);
        expect(lastchipTmpl.focus).toHaveBeenCalled();
    });

    it('pressing escape will delete the item and focus on previous one', function() {
        spyOn(getChipTmpl(element, 2), 'focus');

	//delete Microsoft chip
	isolateScope.chips.handleKeyDown({
		keyCode: 8,
		preventDefault: angular.noop,
		target: getChipTmpl(element)
	});

        //checking is Microsoft removed
        expect(angular.element(getChipTmpl(element)).html()).not.toContain('Microsoft')
        expect(angular.element(getChipTmpl(element)).html()).toContain('Verizon')

        expect(getChipTmpl(element, 2).focus).toHaveBeenCalled()
    });

    it('pressing left arrow focuses the last item while input was focused',function(){
	input.focus()
        spyOn(getChipTmpl(element),'focus');

	isolateScope.chips.handleKeyDown({
		keyCode: 37,
		target: input
	});

        expect(getChipTmpl(element).focus).toHaveBeenCalled();
    });

    it('pressing right arrow focuses input while last item is focused', function() {
	spyOn(input, 'focus');
	var last = getChipTmpl(element);
	last.focus();

	isolateScope.chips.handleKeyDown({
		keyCode: 39,
		target: last
	});

	expect(input.focus).toHaveBeenCalled();
    });

    it('pressing left arrow focuses previous chip', function() {
        spyOn(getChipTmpl(element, 1),'focus');

	isolateScope.chips.handleKeyDown({
		keyCode: 37,
		target: getChipTmpl(element, 2)
	});

	expect(getChipTmpl(element, 1).focus).toHaveBeenCalled();
    });

    it('pressing right arrow focuses next chip', function() {
        spyOn(getChipTmpl(element,2),'focus');

	isolateScope.chips.handleKeyDown({
		keyCode: 39,
		target: getChipTmpl(element, 1)
	});

	expect(getChipTmpl(element, 2).focus).toHaveBeenCalled();
    });

    it('pressing left arrow does nothing if on first chip', function() {
        spyOn(getChipTmpl(element, 0),'blur');

	isolateScope.chips.handleKeyDown({
		keyCode: 37,
		target: getChipTmpl(element, 0)
	});

	isolateScope.chips.handleKeyDown({
		keyCode: 37,
		target: getChipTmpl(element, 0)
	});

	expect(getChipTmpl(element, 0).blur).not.toHaveBeenCalled();
    });

    it('check focus and blur on INPUT element ',function(){
        var focusEvent = new Event('focus')
        expect(element.hasClass('chip-out-focus')).toBe(true);
        element.find('INPUT')[0].dispatchEvent(focusEvent);
        expect(element.hasClass('chip-in-focus')).toBe(true);

        var blurEvent = new Event('blur');
        element.find('INPUT')[0].dispatchEvent(blurEvent);
        expect(element.hasClass('chip-out-focus')).toBe(true);
    });

    it('clicking on delete icon should delete chip',function(){
        var chip = getChipTmpl(element);
        angular.element(chip).find('SPAN')[0].click();
        expect(scope.samples.length).toBe(3);
    });

    it('missing chip-tmpl should get error', function() {
        var str = '<chips ng-model="samples">' +
            '<div class="default-chip">{{chip}}<span class="glyphicon glyphicon-remove" remove-chip></span></div>' +
            '<input chip-control></input>' +
            '</chips>';
        var fun = function() { compile(angular.element(str))(scope) };
        expect(fun).toThrow('should have chip-tmpl');
    });

    it('having more then one chip-tmpl should get error', function() {
        var str = '<chips ng-model="samples">' +
            '<chip-tmpl><div></div></chip-tmpl>'+
            '<chip-tmpl>'+
            '<div class="default-chip">{{chip}}<span class="glyphicon glyphicon-remove" remove-chip></span></div>' +
            '</chip-tmpl>'+
            '<input chip-control></input>' +
            '</chips>';
        var fun = function() { compile(angular.element(str))(scope) };
        expect(fun).toThrow('should have only one chip-tmpl');
    });

});
