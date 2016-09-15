'use strict';

var React       = require('react')
var Region      = require('region')
var assign      = require('object-assign')
var normalize = require('react-style-normalizer')

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
                      .map(this.renderCell.bind(this, this.props));
    console.log(this.props.scrollbarSize);

    var headerStyle = normalize({
      paddingRight: this.props.scrollbarSize
    });

    return (
      <div className="z-table" style={headerStyle}>
        <div {...props} style={{ background: 'linear-gradient(to bottom, #f7f7f7 0%,#efefef 13%,#e6e6e6 100%)' }}>
          {cells}
        </div>
      </div>
    )
  },

  prepareProps: function(thisProps){
    var props = assign({}, thisProps)

    props.className = this.prepareClassName(props, this.state)
    props.style = this.prepareStyle(props)

    delete props.data
    delete props.cellPadding

    return props
  },

  renderCell: function(props, column, index) {

    var text = props.data[column.name]

    return (
      <div
        className="z-cell"
        style={this.prepareColumnStyle(column)}
      >
        <input
          type="text"
          style={{ width: '95%', margin: 'auto', height: '80%' }}
          defaultValue={text}
          onChange={this.onFilterChange.bind(this, column)}
          onKeyUp={this.onFilterKeyUp.bind(this, column)}
        />
      </div>
    );
  },

  onFilterKeyUp: function(column, event){
      if (event.key == 'Enter'){
          this.onFilterClick(column, event)
      }
  },

  onFilterChange: function(column, eventOrValue){

      var value = eventOrValue

      if (eventOrValue && eventOrValue.target){
          value = eventOrValue.target.value
      }

      this.filterValues = this.filterValues || {}
      this.filterValues[column.name] = value

      if (this.props.liveFilter){
          this.filterBy(column, value)
      }
  },

  prepareClassName: function(props, state){
      var className = props.className || ''
      className += ' z-row'
      return className
  },

  prepareStyle: function(props) {
    var style = assign({}, props.defaultStyle, props.style)
    style.height   = props.rowHeight
    style.minWidth = props.minWidth
    return style
  },

  prepareColumnStyle: function(column) {
    return assign({}, column.sizeStyle, { height: 40 });
  }
})
