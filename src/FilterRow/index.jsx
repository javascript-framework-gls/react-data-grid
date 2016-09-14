'use strict';

var React       = require('react')
var Region      = require('region')
var assign      = require('object-assign')
var normalize = require('react-style-normalizer')
var Cell        = require('../Cell')
var CellFactory = React.createFactory(Cell)
var ReactMenu = require('react-menus')
var ReactMenuFactory = React.createFactory(ReactMenu)

module.exports = React.createClass({

  displayName: 'ReactDataGrid.FilterRow',

  propTypes: {
    data   : React.PropTypes.object,
    columns: React.PropTypes.array,
    index  : React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      defaultStyle: {}
    }
  },

  getInitialState: function() {
    return {
      mouseOver: false
    }
  },

  render: function() {
    var props = this.prepareProps(this.props)
    var cells = props.columns
                      .map(this.renderCell.bind(this, this.props))

    return <div {...props}>{cells}</div>
  },

  prepareProps: function(thisProps){
    var props = assign({}, thisProps)

    props.className = this.prepareClassName(props, this.state)
    props.style = this.prepareStyle(props)

    delete props.data
    delete props.cellPadding

    return props
  },

  renderCell: function(props, column, index){

    var text = props.data[column.name]
    var columns = props.columns

    var cellProps = {
      style      : column.style,
      className  : column.className,

      key        : column.name,
      name       : column.name,

      data       : props.data,
      columns    : columns,
      index      : index,
      rowIndex   : props.index,
      textPadding: props.cellPadding,
      renderCell : props.renderCell,
      renderText : props.renderText
    }

    if (typeof column.render == 'function'){
        text = column.render(text, props.data, cellProps)
    }

    cellProps.text = text

    var result

    if (props.cellFactory){
      result = props.cellFactory(cellProps)
    }

    if (result === undefined){
      result = CellFactory(cellProps)
    }

    return result
  },

  prepareClassName: function(props, state){
      var className = props.className || ''
      className += ' z-filter-row'
      return className
  },

  prepareStyle: function(props) {
    var style = assign({}, props.defaultStyle, props.style)
    style.height   = props.rowHeight
    style.minWidth = props.minWidth
    return style
  }
})
