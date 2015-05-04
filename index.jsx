'use strict';

require('./index.styl')

var Guid = require('guid')
var sorty = require('sorty')
var React = require('react')
var DataGrid = require('./src')
var faker = window.faker = require('faker');
var preventDefault = require('./src/utils/preventDefault')

var gen = (function(){

    var cache = {}

    return function(len){

        if (cache[len]){
            // return cache[len]
        }

        var arr = []

        for (var i = 0; i < len; i++){
            arr.push({
                index       : i + 1,
                id       : i,
                // id: Guid.create(),
                grade      : Math.round(Math.random() * 10),
                email    : faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName : faker.name.lastName(),
                birthDate: faker.date.past(),
                country  : faker.address.country(),
                city  : faker.address.city()
            })
        }

        cache[len] = arr

        return arr
    }
})()

var RELOAD = true
var columns = [
    { name: 'index', title: '#', width: 350 },
    { name: 'firstName', width: 350 },
    { name: 'lastName', width: 350  },
    { name: 'email', title: 'Email', width: 300},
    { name: 'country', width: 200},
    { name: 'catchPhrase', width: 500}
]

var ROW_HEIGHT = 31
var LEN = 2000
var SORT_INFO = []//[ { name: 'id', dir: 'asc'} ]
var sort = sorty(SORT_INFO)
var data = gen(LEN)
var origData = [].concat(data)

var App = React.createClass({
    onColumnResize: function(firstCol, firstSize, secondCol, secondSize){
        firstCol.width = firstSize
        this.setState({})
    },
    render: function(){
        return <DataGrid
            idProperty='id'
            dataSource={data}
            columns={columns}
            style={{height: 400}}
            onColumnResize={this.onColumnResize}
        />
    }
})

React.render((
    <App />
), document.getElementById('content'))