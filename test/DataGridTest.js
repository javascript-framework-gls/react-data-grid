'use strict';

var React      = require('react/addons')
var TestUtils  = React.addons.TestUtils
var DataGrid = React.createFactory(require('../lib'))

var TABLE_CLASS = 'z-table';
var ROW_CLASS = 'z-row';
var CELL_CLASS = 'z-cell';
var CELLTEXT_CLASS = 'z-text';

function render(node){
    return TestUtils.renderIntoDocument(node)
}

function findWithClass(root, cls){
    return TestUtils.findRenderedDOMComponentWithClass(root, cls)
}

function tryWithClass(root, cls){
    return TestUtils.scryRenderedDOMComponentsWithClass(root, cls)
}

describe('DataGrid Test Suite', function(){

	it('renders basic grid', function(){

        require('./testdom')()

        var data = [{ id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}];

        var columns = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName' },
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];    

		var table = render(
			DataGrid({
				idProperty:'id',
                data:data,
                columns:columns    
			})
		);

        // check whether one row is populated

        tryWithClass(table, ROW_CLASS)
            .length
            .should
            .equal(1);

        // check the contents of the row

        var tableDom = findWithClass(table,TABLE_CLASS);    
        
        var cellTexts = tryWithClass(tableDom,CELLTEXT_CLASS);
        
        cellTexts[0].getDOMNode()
            .textContent
            .should.equal('1')
                
	})

})