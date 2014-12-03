'use strict';

var React = require('react')

var Row         = require('../Row')
var Cell        = require('../Cell')
var CellFactory = React.createFactory(Cell)

var renderRow   = require('./renderRow')
var renderTable = require('./renderTable')

var slice = require('./slice')

function renderData(props, data, depth){

    return data.map(function(data, index){

        return renderRow(props, data, index, function(config){
            config.cellFactory = function(cellProps){
                if (cellProps.index === 0){
                    cellProps.innerStyle = {
                        paddingLeft: depth * props.groupNestingWidth
                    }
                }

                return CellFactory(cellProps)
            }

            config.className += ' z-grouped'

            return config
        })
    })
}

function renderGroupRow(props, groupData){

    var style = {
        paddingLeft: (groupData.depth - 1)* props.groupNestingWidth
    }

    var cellStyle = {
        minWidth: props.totalColumnWidth,
        maxWidth: props.totalColumnWidth
    }

    return <Row className='z-group-row' key={groupData.valuePath} rowHeight={props.rowHeight}>
        <Cell
            className='z-group-cell'
            textPadding={props.cellPadding}
            innerStyle={style}
            text={groupData.value}
            style={cellStyle}
        />
    </Row>
}

function renderGroup(props, groupData){

    var result = [renderGroupRow(props, groupData)]

    if (groupData && groupData.leaf){
        result.push.apply(result, renderData(props, groupData.data, groupData.depth))
    } else {
        groupData.keys.forEach(function(key){
            var items = renderGroup(props, groupData.data[key])
            result.push.apply(result, items)
        })
    }

    return result
}

function renderGroups(props, groupsData){
    var result = []

    groupsData.keys.map(function(key){
        result.push.apply(result, renderGroup(props, groupsData.data[key]))
    })

    return result
}

module.exports = function(props){
    var rows = renderGroups(props, props.groupData)

    rows = slice(rows, props)

    return renderTable(props, rows)
}