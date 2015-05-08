'use strict';

//ensure DOM environment
require('../testdom')()

var React     = require('react/addons')
var TestUtils = React.addons.TestUtils
var DataGrid  = require('../DataGrid')

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

describe('DataGrid Test Suite - DataSource', function(){

	var fetchData;
	var columns;
	var paginationEnabled;
	var remoteDataOptions = REMOTE_DATA_OPTIONS;

    // data segments
        
    var data_page1of1 =  {
        data : [
            { id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}
        ],
        count:1
    };

    var data_page1of2 = {
        data : [
            { id: 0, index: 1, firstName: 'John', city: 'London', email: 'jon@gmail.com'}
        ],
        count:2
    };

    var data_page2of2 = {
        data : [
            { id: 1, index: 2, firstName: 'Koustuv', city: 'Kolkata', email: 'ks@gmail.com'}
        ],
        count:2
    };

	beforeEach(function() {

		// create mock fetchData

        fetchData = function(url) {
            // check url request is ok
            if(paginationEnabled)
            	url.should.be.equal(REMOTE_DATA + remoteDataOptions);
          	else
          		url.should.be.equal(REMOTE_DATA);

            var promise = new Promise(function(resolve,reject) {

                if(!remoteDataOptions) {
                    resolve(data_page1of1)
                }
                else {
                    if(remoteDataOptions === REMOTE_DATA_OPTIONS2) {
                        resolve(data_page1of2)
                    }
                    if(remoteDataOptions === REMOTE_DATA_OPTIONS3) {
                        resolve(data_page2of2)
                    }
                }

            })
            return promise;
        }

		columns = [
            { name: 'index', title: '#', width: 50 },
            { name: 'firstName'},
            { name: 'lastName'  },
            { name: 'city' },
            { name: 'email' }
        ];
	})

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

        // flag to test pagination url in fetch
        paginationEnabled = true;
        remoteDataOptions = REMOTE_DATA_OPTIONS2;

		// table first page render
        var table = render(
            DataGrid({
                idProperty		: 'id',
                dataSource 		: REMOTE_DATA,
                columns   		: columns,
                style     		: {height:200},
                fetch     		: fetchData,
                defaultPageSize : 1
            })
        );

        // set time to resolve promise and render table
        setTimeout(function() {
        	
            var paginationToolbar = tryWithClass(table,PAGINATION_TOOLBAR);
            paginationToolbar.should.not.be.empty

            var nextPageButton = TestUtils.findAllInRenderedTree(table,function(node) {
            	return node.props.name == PAGINATION_NEXT; 
            })[0];

            var prevPageButton = TestUtils.findAllInRenderedTree(table,function(node) {
            	return node.props.name == PAGINATION_PREV; 
            })[0];

            var firstRow = tryWithClass(table,ROW_CLASS)
            var firstName = tryWithClass(firstRow[0],CELL_CLASS)[1].getDOMNode().textContent;
            firstName.should.equal('John')

            // first, navigate to second page

            // set second page remote data url
            remoteDataOptions = REMOTE_DATA_OPTIONS3;

            // click next page button
            TestUtils.Simulate.click(nextPageButton.getDOMNode())

            // set time to resolve promise and render table
            setTimeout(function() {

                // check next page content
            
                firstRow = tryWithClass(table,ROW_CLASS)
                firstName = tryWithClass(firstRow[0],CELL_CLASS)[1].getDOMNode().textContent;
                firstName.should.equal('Koustuv')

                // then navigate back to first page
                // set first page remote data url

                remoteDataOptions = REMOTE_DATA_OPTIONS2;

                // click previous page button
                TestUtils.Simulate.click(prevPageButton.getDOMNode())

                // set time to resolve promise and render table
                setTimeout(function() {

                    // check first page content again
            
                    firstRow = tryWithClass(table,ROW_CLASS)
                    firstName = tryWithClass(firstRow[0],CELL_CLASS)[1].getDOMNode().textContent;
                    firstName.should.equal('John')

                    done()

                },0)

            },0)

        },0)

	})
})