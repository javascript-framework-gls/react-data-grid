'use strict';

var React   = require('react')
var Region  = require('region')
var ReactMenu = React.createFactory(require('react-menus'))
var assign  = require('object-assign')
var clone   = require('clone')
var asArray = require('../utils/asArray')
var findIndexBy = require('../utils/findIndexBy')
var findIndexByName = require('../utils/findIndexByName')
var Cell    = require('../Cell')
var setupColumnDrag   = require('./setupColumnDrag')
var setupColumnResize = require('./setupColumnResize')

function emptyFn(){}

function getColumnSortInfo(column, sortInfo){

    sortInfo = asArray(sortInfo)

    var index = findIndexBy(sortInfo, function(info){
        return info.name === column.name
    })

    return sortInfo[index]
}

function removeColumnSort(column, sortInfo){
    sortInfo = asArray(sortInfo)

    var index = findIndexBy(sortInfo, function(info){
        return info.name === column.name
    })

    if (~index){
        sortInfo.splice(index, 1)
    }

    return sortInfo
}

function getDropState(){
    return {
        dragLeft  : null,
        dragColumn: null,
        dragColumnIndex: null,
        dragging  : false,
        dropIndex : null,

        shiftIndexes: null,
        shiftSize: null
    }
}

module.exports = React.createClass({

    displayName: 'ReactDataGrid.Header',

    propTypes: {
        columns: React.PropTypes.array
    },

    onDrop: function(){
        var dragIndex = this.state.dragColumnIndex
        var dropIndex = this.state.dropIndex

        if (dropIndex != null){

            //since we need the indexes in the array of all columns
            //not only in the array of the visible columns
            //we need to search them and make this transform
            var dragColumn = this.props.columns[dragIndex]
            var dropColumn = this.props.columns[dropIndex]

            dragIndex = findIndexByName(this.props.allColumns, dragColumn.name)
            dropIndex = findIndexByName(this.props.allColumns, dropColumn.name)

            this.props.onDropColumn(dragIndex, dropIndex)
        }


        this.setState(getDropState())
    },

    getDefaultProps: function(){
        return {
            defaultClassName : 'z-header-wrapper',
            draggingClassName: 'z-dragging',
            cellClassName    : 'z-column-header',
            defaultStyle    : {},
            sortInfo        : null,
            scrollLeft      : 0,
            scrollTop       : 0
        }
    },

    getInitialState: function(){

        return {
            mouseOver : true,
            dragging  : false,

            shiftSize : null,
            dragColumn: null,
            shiftIndexes: null
        }
    },

    render: function() {

        var props = this.prepareProps(this.props)

        var cells = props.columns
                        .map(this.renderCell.bind(this, props, this.state))

        var headerStyle = {
            paddingRight: props.scrollbarSize,
            transform   : 'translate3d(' + -props.scrollLeft + 'px, ' + -props.scrollTop + 'px, 0px)'
        }

        return (
            <div style={props.style} className={props.className}>
                <div className='z-header' style={headerStyle}>
                    {cells}
                </div>
            </div>
        )
    },

    renderCell: function(props, state, column, index){

        var resizing  = props.resizing
        var text      = column.title
        var className = props.cellClassName || ''
        var style     = {
            left: 0
        }

        var menu = this.renderColumnMenu(props, state, column, index)

        if (state.dragColumn && state.shiftIndexes && state.shiftIndexes[index]){
            style.left = state.shiftSize
        }

        if (state.dragColumn === column){
            className += ' z-drag z-over'
            style.zIndex = 1
            style.left = state.dragLeft || 0
        }

        var filter  = column.filterable?
                        <div className="z-show-filter" onClick={this.handleFilterClick.bind(this, column)}/>:
                        null

        var resizer = column.resizable?
                        <span className="z-column-resize" onMouseDown={this.handleResizeMouseDown.bind(this, column)} />:
                        null

        if (column.sortable){
            text = <span>{text}<span className="z-icon-sort-info" /></span>

            var sortInfo = getColumnSortInfo(column, props.sortInfo)

            if (sortInfo && sortInfo.dir){
                className += (sortInfo.dir === -1 || sortInfo.dir === 'desc'?
                                ' z-desc':
                                ' z-asc')
            }

            className += ' z-sortable'
        }

        if (filter){
            className += ' z-filterable'
        }

        if (state.mouseOver === column.name && !resizing){
            className += ' z-over'
        }

        if (props.menuColumn === column.name){
            className += ' z-active'
        }

        className += ' z-unselectable'

        return (
            <Cell
                key={column.name}
                textPadding={props.cellPadding}
                columns={props.columns}
                index={index}
                className={className}
                style={style}
                text={text}
                onMouseOver={this.handleMouseOver.bind(this, column)}
                onMouseOut={this.handleMouseOut.bind(this, column)}
                onMouseDown={this.handleMouseDown.bind(this, column)}
                onClick={this.handleClick.bind(this, column)}
            >
                {filter}
                {menu}
                {resizer}
            </Cell>
        )
    },

    toggleSort: function(column){
        var sortInfo       = asArray(clone(this.props.sortInfo))
        var columnSortInfo = getColumnSortInfo(column, sortInfo)

        if (!columnSortInfo){
            columnSortInfo = {
                name: column.name,
                type: column.type,
                fn  : column.sortFn
            }

            sortInfo.push(columnSortInfo)
        }

        if (typeof column.toggleSort === 'function'){
            column.toggleSort(columnSortInfo, sortInfo)
        } else {

            var dir     = columnSortInfo.dir
            var dirSign = dir === 'asc'? 1 : dir === 'desc'? -1: dir
            var newDir  = dirSign === 1? -1: dirSign === -1?  0: 1

            columnSortInfo.dir = newDir

            if (!newDir){
                sortInfo = removeColumnSort(column, sortInfo)
            }
        }

        ;(this.props.onSortChange || emptyFn)(sortInfo)
    },

    renderColumnMenu: function(props, state, column, index){
        if (!props.withColumnMenu){
            return
        }

        return <div className="z-show-menu" onClick={this.handleShowMenuClick.bind(this, props, column, index)} />
    },

    handleShowMenuClick: function(props, column, index, event){
        event.stopPropagation()

        var dom = this.getDOMNode()
        var domRegion    = Region.from(dom)
        var targetRegion = Region.from(event.target)
        var offset = event.pageX - targetRegion.left

        var menuOffset = {
            left: event.pageX - domRegion.left - offset
        }

        if (index === props.columns.length - 1){
            offset = targetRegion.right - event.pageX
            menuOffset = {
                right: domRegion.right - event.pageX - offset
            }
        }

        this.showMenu(column, menuOffset, event)
    },

    showMenu: function(column, offset){

        var callback = function(column){
            return function(){
                this.toggleColumn(column)
            }
        }

        var menuItem = function(column){
            return {
                cls  : column.hidden? '': ' z-selected',
                label: column.title,
                fn   : callback(column).bind(this)
            }
        }.bind(this)

        function menu(props){

            props.items = this.props.allColumns.map(menuItem)

            return ReactMenu(props)
        }

        this.props.showColumnMenu(menu.bind(this), column.name, offset)
    },

    toggleColumn: function(column){
        this.props.toggleColumn(column)
    },

    hideMenu: function(){
        this.props.showColumnMenu(null, null)
    },

    handleResizeMouseDown: function(column, event){

        setupColumnResize(this, this.props, column, event)

    },

    handleFilterClick: function(column, event){
        event.stopPropagation()
    },

    handleClick: function(column){
        if (column.sortable){
            this.toggleSort(column)
        }
    },

    handleMouseOut: function(column){
        this.setState({
            mouseOver: false
        })
    },

    handleMouseOver: function(column){
        this.setState({
            mouseOver: column.name
        })
    },

    handleMouseDown: function(column, event){
        // debugger
        setupColumnDrag(this, this.props, column, event)
    },

    onResizeDragStart: function(config){
        this.props.onColumnResizeDragStart(config)
    },

    onResizeDrag: function(config){
        this.props.onColumnResizeDrag(config)
    },

    onResizeDrop: function(config, resizeInfo){
        this.props.onColumnResizeDrop(config, resizeInfo)
    },

    prepareProps: function(thisProps){
        var props = {}

        assign(props, thisProps)

        this.prepareClassName(props)
        this.prepareStyle(props)

        return props
    },

    prepareClassName: function(props){
        props.className = props.className || ''
        props.className += ' ' + props.defaultClassName

        if (this.state.dragging){
            props.className += ' ' + props.draggingClassName
        }
    },

    prepareStyle: function(props){
        var style = props.style = {}

        assign(style, props.defaultStyle)
    }
})
