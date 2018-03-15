'use strict';

describe('Directive chips : Basic flow', function() {

    beforeEach(module('angular.chips'));

    var element, scope, compile, template, isolateScope, timeout;

    /*** Basic flow ***/

    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();
        scope.samples = ['Apple', 'Cisco', 'Verizon', 'Microsoft'];
        compile = $injector.get('$compile');
        template = '<chips ng-model="samples">' +
            '<chip-tmpl>' +
            '<div class="default-chip">{{chip}}<span class="glyphicon glyphicon-remove" remove-chip></span></div>' +
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

    it('pressing Comma key (,) on INPUT element should add the chip',function(){
        var inputEle = element.find('INPUT')[0];
        inputEle.value = 'Italy';
        var event = new Event('keypress');
        event.keyCode = 44;
        inputEle.dispatchEvent(event);
        expect(scope.samples[scope.samples.length-1]).toBe('Italy');
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
        var event = {
            keyCode: 8,
            preventDefault: angular.noop,
            target: { nodeName: 'INPUT', value: '' }
        };
        var chipTmpls = element.find('chip-tmpl');
        var lastchipTmpl = chipTmpls[chipTmpls.length - 1];
        spyOn(lastchipTmpl, 'focus');
        isolateScope.chips.handleKeyDown(event);
        expect(lastchipTmpl.focus).toHaveBeenCalled();
    });

    it('keep pressing backspace should delete chip one by one and focus last one', function() {

        var mockEvent = {
            keyCode: 8,
            preventDefault: angular.noop,
            target: { nodeName: 'INPUT', value: '' }
        };
        //set focus on last inddex chip which is Microsoft
        isolateScope.chips.handleKeyDown(mockEvent);

        var event = new Event('keydown', { bubbles: true });
        event.keyCode = 8;
        //will invoke chip_tmpl keydown handler
        var microsoftChip = getChipTmpl(element);
        microsoftChip.dispatchEvent(event);
        //checking is Microsoft removed
        expect(angular.element(getChipTmpl(element)).html()).not.toContain('Microsoft')
        expect(angular.element(getChipTmpl(element)).html()).toContain('Verizon')

        mockEvent.target = microsoftChip;
        spyOn(getChipTmpl(element), 'focus');
        //set focus on last index chip which is Verizon
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element).focus).toHaveBeenCalled()

        //focus on chip by pressing left arrow
        mockEvent.keyCode = 37;
        spyOn(getChipTmpl(element, 1), 'focus');
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element, 1).focus).toHaveBeenCalled();
    });

    it('pressing left and right arrow should focus on chips respectivly',function(){
        //['Apple', 'Cisco', 'Verizon', 'Microsoft'];
        //should focus on last chip when pressing left arrow
        var mockEvent = {keyCode: 37, target: element.find('INPUT')[0]}
        spyOn(getChipTmpl(element),'focus');
        //should focus on Microsoft
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element).focus).toHaveBeenCalled();

        //checking right arrow selection
        //should focus on Verizon
        isolateScope.chips.handleKeyDown(mockEvent);
        //should focus on Cisco
        isolateScope.chips.handleKeyDown(mockEvent);
        mockEvent.keyCode = 39
        spyOn(getChipTmpl(element,2),'focus');
        //shuld focus on Verizon again
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element,2).focus).toHaveBeenCalled();

        //keep pressing left arrow
        mockEvent.keyCode = 37;
        spyOn(getChipTmpl(element,1),'focus');
        //focus on Cisco
        isolateScope.chips.handleKeyDown(mockEvent);
        //focus on Apple
        isolateScope.chips.handleKeyDown(mockEvent);
        //focus on Microsoft
        isolateScope.chips.handleKeyDown(mockEvent);
        //focus on Verizon
        isolateScope.chips.handleKeyDown(mockEvent);
        //focus on Cisco
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element,1).focus).toHaveBeenCalled();        


        //keep pressing right arrow
        mockEvent.keyCode = 39;
        spyOn(getChipTmpl(element,0),'focus');
        //focus on Verizon
        isolateScope.chips.handleKeyDown(mockEvent);
        //focus on Microsoft
        isolateScope.chips.handleKeyDown(mockEvent);
        //focus on Apple
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element,0).focus).toHaveBeenCalled();

    });

    it('check chip selection using left and right arrow key after mouse click',function(){
        spyOn(getChipTmpl(element,2),'focus');
        var mockEvent = {keyCode: 37, target: getChipTmpl(element,2)}
        isolateScope.chips.handleKeyDown(mockEvent);
        expect(getChipTmpl(element,2).focus).toHaveBeenCalled();
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

    it('preventDefault should happen only if target is either INPUT or CHIP-TMPL',function(){
        var event = {target: {}, preventDefault:angular.noop}
        spyOn(event,'preventDefault');
        isolateScope.chips.handleKeyDown({target:{}})
        expect(event.preventDefault).not.toHaveBeenCalled();
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
