'use strict';

var React      = require('react/addons')
var TestUtils  = React.addons.TestUtils
var DataGrid = React.createFactory(require('../../lib'))

var TABLE_CLASS = 'z-table';
var ROW_CLASS = 'z-row';
var CELL_CLASS = 'z-cell';
var CELLTEXT_CLASS = 'z-text';
var COLUMN_HEADER_CLASS = 'z-column-header';
var COL_MENU_BTN = 'z-show-menu';

function render(node){
    return TestUtils.renderIntoDocument(node)
}

function findWithClass(root, cls){
    return TestUtils.findRenderedDOMComponentWithClass(root, cls)
}

function tryWithClass(root, cls){
    return TestUtils.scryRenderedDOMComponentsWithClass(root, cls)
}

describe('DataGrid Test Suite - Columns', function(){

    it('check column visibility by options',function(done) {

        require('../testdom')()

        var data = [{ id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}];

        // defaultVisible : true
        var columns1 = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName', defaultVisible : true },
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];

        // defaultVisible : false
        var columns2 = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName', defaultVisible : false },
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];

        // visible : true
        var columns3 = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName', visible : true },
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];

        // visible : false
        var columns4 = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName', visible : false },
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];    


        // check for column visibility

        var expectedHeadersNotVisible = ['#','Last name','City','Email'];
        var expectedHeadersVisible = ['#','First name','Last name','City','Email'];
        
        checkColVisibility(data,columns1,expectedHeadersVisible,true);
        checkColVisibility(data,columns2,expectedHeadersNotVisible,false);
        checkColVisibility(data,columns3,expectedHeadersVisible,true);
        checkColVisibility(data,columns4,expectedHeadersNotVisible,false);
        done();
    })

    it('check column menu accessibility by options',function(done) {
        require('../testdom')()

        var data = [{ id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}];
        var columns = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName'},
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];

        // table with column menu
        var table_with_menu = render(
            DataGrid({
                idProperty:'id',
                dataSource:data,
                columns:columns,
                withColumnMenu:true    
            })
        );

        var columnMenuBtnArray = tryWithClass(table_with_menu,COL_MENU_BTN);
        columnMenuBtnArray.should.not.be.empty;

        // table without column menu
        var table_without_menu = render(
            DataGrid({
                idProperty:'id',
                dataSource:data,
                columns:columns,
                withColumnMenu:false    
            })
        );

        columnMenuBtnArray = tryWithClass(table_without_menu,COL_MENU_BTN);
        columnMenuBtnArray.should.be.empty;
        done();
    })

    it('check column width set by props',function(done) {
        require('../testdom')()

        var data = [{ id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}];
        var columns = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName'},
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];

        // table with column menu
        var table = render(
            DataGrid({
                idProperty:'id',
                dataSource:data,
                columns:columns    
            })
        );

        var columnHeaderArray = tryWithClass(table,COLUMN_HEADER_CLASS);
        columnHeaderArray.should.not.be.empty;

        // check header width of first row first element
        var header = columnHeaderArray[0];
        (header.getDOMNode().style._values.width).should.equal('50px'); // hack, should be replaced with a better api

        // check cell width of first row first element
        var rowNode = tryWithClass(table,ROW_CLASS);
        var rowCells = tryWithClass(rowNode[0],CELL_CLASS);
        (rowCells[0].getDOMNode().style._values.width).should.equal('50px');
        done();
    })

})

function checkColVisibility(data,columns,expectedHeaders,visible) {

    var table = render(
        DataGrid({
            idProperty:'id',
            dataSource:data,
            columns:columns    
        })
    );

    var headers = [];

    tryWithClass(table,COLUMN_HEADER_CLASS)
        .map(function(header) {
            headers.push(header.getDOMNode().textContent);
        });

    headers.should.eql(expectedHeaders);

    var tableDom = findWithClass(table,TABLE_CLASS);    
    if(visible) {

    }
    var cellTexts = tryWithClass(tableDom,CELLTEXT_CLASS);
    var cellContents = [];
    cellTexts.map(function(cell) {
        cellContents.push(cell.getDOMNode().textContent);
    });

    if(visible) {
        cellContents.should.containEql('John');
    } else {
        cellContents.should.not.containEql('John');
    }
}