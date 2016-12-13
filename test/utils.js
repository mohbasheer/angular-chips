function getChipScope(element, index) {
    var elements = element.find('chip-item');
    index = index > 0 ? index : (index < 0 ? elements.length - 1 : 0)
    return angular.element(elements[index]).scope();
}

function getChipTmpl(element, index) {
    var chipTmpls = element.find('chip-item');
    return chipTmpls[index === undefined ? chipTmpls.length - 1 : index];
}
