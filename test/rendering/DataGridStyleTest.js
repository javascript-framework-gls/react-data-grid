'use strict';

var DataGrid  = require('../DataGrid')
var React     = require('react/addons')
var TestUtils = React.addons.TestUtils

var TABLE_CLASS         = 'z-table'
var ROW_CLASS           = 'z-row'
var CELL_CLASS			= 'z-cell'
var CELL_TEXT_CLASS		= 'z-text'
var ALIGN_RIGHT_CLASS	= 'z-align-right'

var testUtils = require('../utils')

var render        = testUtils.render
var findWithClass = testUtils.findWithClass
var tryWithClass  = testUtils.tryWithClass
var generateMockData = testUtils.generateMockData

var columns = [
    { name: 'index', title: '#', width: 50 },
    { name: 'firstName'},
    { name: 'lastName'  },
    { name: 'city' },
    { name: 'email' }
];

describe('DataGrid Test Suite -  Row Style',function() {

	it('check rowStyle as object works',function() {

		var ROW_COLOR = 'blue'
		var data = generateMockData({type : 'local', len : 3})
		
		var rowStyle = {color : ROW_COLOR}

		// table
        var table = render(
            DataGrid({
                idProperty: 'id',
                dataSource: data,
                columns   : columns,
                style     : {height:400},
                rowStyle  : rowStyle
            })
        );

        var rows = tryWithClass(table,ROW_CLASS)
		rows.forEach(function(row) {
			window.getComputedStyle(row.getDOMNode()).getPropertyValue('color').should.equal(ROW_COLOR)
        })

	})

	it('check rowStyle as function works',function() {
		
		var ROW_COLOR = 'blue'
		var ROW_COLOR_INDEX = 4
		var data = generateMockData({type : 'local', len : 10})

		var rowStyle = function(data, props){
			var style = {}
			if (props.index % ROW_COLOR_INDEX == 0){
				style.color = ROW_COLOR
			}
			return style
		}

		// table
        var table = render(
            DataGrid({
                idProperty: 'id',
                dataSource: data,
                columns   : columns,
                style     : {height:400},
                rowStyle  : rowStyle
            })
        );

        var rows = tryWithClass(table,ROW_CLASS)
		rows.forEach(function(row,index) {
			if(index % ROW_COLOR_INDEX == 0)
				window.getComputedStyle(row.getDOMNode()).getPropertyValue('color').should.equal(ROW_COLOR)
        })

	})

	it('check column style works',function() {

		var COL_COLOR = 'blue'
		var COL_COLOR_INDEX = 4
		var data = generateMockData({type : 'local', len : 10})

		columns = [
		    { name: 'index', title: '#', width: 50 },
		    { name: 'firstName'},
		    { name: 'lastName'  },
		    { name: 'city' },
		    { name: 'email', style : { color : COL_COLOR } }
		]

		// table
        var table = render(
            DataGrid({
                idProperty: 'id',
                dataSource: data,
                columns   : columns,
                style     : {height:400}
            })
        );

        var rows = tryWithClass(table,ROW_CLASS)
		rows.forEach(function(row) {
			var cells = tryWithClass(row,CELL_CLASS)
			cells.forEach(function(cell,index) {
				if(index == COL_COLOR_INDEX)
					window.getComputedStyle(cell.getDOMNode()).getPropertyValue('color').should.equal(COL_COLOR)
			})	
        })

	})

	it('check column textAlign works',function() {

		var TEXT_ALIGN = 'right'
		var COL_ALIGN_INDEX = 2
		var data = generateMockData({type : 'local', len : 10})

		columns = [
		    { name: 'index', title: '#', width: 50 },
		    { name: 'firstName'},
		    { name: 'lastName' , textAlign : TEXT_ALIGN },
		    { name: 'city' },
		    { name: 'email'}
		]

		// table
        var table = render(
            DataGrid({
                idProperty: 'id',
                dataSource: data,
                columns   : columns,
                style     : {height:400}
            })
        );

		var rows = tryWithClass(table,ROW_CLASS)
		rows.forEach(function(row) {
			var cells = tryWithClass(row,CELL_CLASS)
			cells.forEach(function(cell,index) {
				if(index == COL_ALIGN_INDEX)
					cell.props.className.should.containEql(ALIGN_RIGHT_CLASS)
			})	
        })

	})

})