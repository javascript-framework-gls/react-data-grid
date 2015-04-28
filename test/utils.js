'use strict';

var React     = require('react/addons')
var TestUtils = React.addons.TestUtils

function render(node){
    return TestUtils.renderIntoDocument(node)
}

function findWithClass(root, cls){
    return TestUtils.findRenderedDOMComponentWithClass(root, cls)
}

function tryWithClass(root, cls){
    return TestUtils.scryRenderedDOMComponentsWithClass(root, cls)
}

module.exports = {
	render       : render,
	findWithClass: findWithClass,
	tryWithClass : tryWithClass
}