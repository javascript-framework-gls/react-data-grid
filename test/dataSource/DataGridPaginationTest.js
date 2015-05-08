'use strict';

var DataGrid  = require('../DataGrid')
var React     = require('react/addons')
var TestUtils = React.addons.TestUtils

var TABLE_CLASS         = 'z-table'
var ROW_CLASS           = 'z-row'
var CELL_CLASS			= 'z-cell'
var CELL_TEXT_CLASS		= 'z-text'
var REMOTE_DATA			= 'http://5.101.99.47:8090/10'
var REMOTE_DATA_OPTIONS = '?pageSize=20&page=1&skip=0'
var REMOTE_DATA_OPTIONS2 = '?pageSize=1&page=1&skip=0'
var REMOTE_DATA_OPTIONS3 = '?pageSize=1&page=2&skip=1'
var PAGINATION_TOOLBAR  = 'react-datagrid-pagination-toolbar'
var PAGINATION_NEXT		= 'gotoNext'
var PAGINATION_PREV		= 'gotoPrev'

var testUtils = require('../utils')

var render        = testUtils.render
var findWithClass = testUtils.findWithClass
var tryWithClass  = testUtils.tryWithClass

var paginationEnabled
var remoteDataOptions = REMOTE_DATA_OPTIONS

// create mock fetchData

var fetchData = function(url) {
    // check url request is ok
    if(paginationEnabled)
        url.should.be.equal(REMOTE_DATA + remoteDataOptions);
    else
        url.should.be.equal(REMOTE_DATA);

    var data =  {
        data : [
            { id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}
        ],
        count:1
    };

    var promise = new Promise(function(resolve,reject) {

        resolve(data);

    })
    return promise;
};

var columns = [
    { name: 'index', title: '#', width: 50 },
    { name: 'firstName'},
    { name: 'lastName'  },
    { name: 'city' },
    { name: 'email' }
];

describe('DataGrid Test Suite - Pagination', function(){


	it('check pagination toolbar visible when dataSource is remote ',function(done) {


        // flag to test pagination url in fetch
        paginationEnabled = true;

		// table
        var table = render(
            DataGrid({
                idProperty: 'id',
                dataSource: REMOTE_DATA,
                columns   : columns,
                style     : {height:200},
                fetch     : fetchData
            })
        );

        // set time to resolve promise and render table
        setTimeout(function() {
            var paginationToolbar = findWithClass(table,PAGINATION_TOOLBAR);
            paginationToolbar.should.not.be.empty
            done()
        },0)

	})

	it('check pagination toolbar not visible by options ',function(done) {
		

		// flag to test pagination url in fetch
        paginationEnabled = false;

		// table
        var table = render(
            DataGrid({
                idProperty: 'id',
                dataSource: REMOTE_DATA,
                columns   : columns,
                style     : {height:200},
                fetch     : fetchData,
                pagination: false
            })
        );

        // set time to resolve promise and render table
        setTimeout(function() {
            var paginationToolbar = tryWithClass(table,PAGINATION_TOOLBAR);
            paginationToolbar.should.be.empty
            done()
        },0)
	})

	it('check pagination works when dataSource is remote ',function(done) {

        // create dataSource
        var dataSource = function(request) {
            
            var data;

            switch(request.page) {
                case 1 : data = {
                            data : [
                                { id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'},
                                { id: 1, index: 2, firstName: 'Paul', city: 'London', email: 'jon@gmail.com'}
                            ],
                            count:3
                        };
                break;
                case 2 : data = {
                            data : [
                                { id: 2, index: 3, firstName: 'Koustuv', city: 'London', email: 'jon@gmail.com'}
                            ],
                            count:3
                        };
            }

            var promise = new Promise(function(resolve,reject) {
                resolve(data)
            })
            return promise;
        };

        var columns = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName'},
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];

        // flag to test pagination url in fetch
        paginationEnabled = true;
        remoteDataOptions = REMOTE_DATA_OPTIONS2;

		// table first page render
        var table = render(
            DataGrid({
                idProperty		: 'id',
                dataSource 		: dataSource,
                columns   		: columns,
                style     		: {height:200},
                fetch     		: fetchData,
                defaultPageSize : 1
            })
        );

        // set time to resolve promise and render table
        setTimeout(function() {

            var paginationToolbar = tryWithClass(table,PAGINATION_TOOLBAR);
            paginationToolbar.should.not.be.empty;

            var rows = tryWithClass(table,ROW_CLASS);
            
            // check the number of rows
            
            rows.length.should.equal(2);

            // first, navigate to second page

            var nextPageButton = TestUtils.findAllInRenderedTree(table,function(node) {
                return node.props.name == PAGINATION_NEXT; 
	        })[0];

            // click next page button
            TestUtils.Simulate.click(nextPageButton.getDOMNode());

            // set time to resolve promise and render table
            setTimeout(function() {

                // check next page content
            
                rows = tryWithClass(table,ROW_CLASS)
                rows.length.should.equal(1)

                // then navigate back to first page
                
                var prevPageButton = TestUtils.findAllInRenderedTree(table,function(node) {
                    return node.props.name == PAGINATION_PREV; 
                })[0];    
                // click previous page button
                TestUtils.Simulate.click(prevPageButton.getDOMNode())

                // set time to resolve promise and render table
                setTimeout(function() {

                    // check first page content again
            
                    rows = tryWithClass(table,ROW_CLASS)
                	rows.length.should.equal(2)

                    done()

                },0)

            },0)

        },0)

	})
})