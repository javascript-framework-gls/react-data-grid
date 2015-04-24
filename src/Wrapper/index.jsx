'use strict';

var React      = require('react')
var assign     = require('object-assign')
var LoadMask   = require('react-load-mask')
var hasTouch   = require('has-touch')
var DragHelper = require('drag-helper')
var buffer     = require('buffer-function')
var raf        = require('raf')

var tableStyle     = require('../render/tableStyle')
var preventDefault = require('../utils/preventDefault')
var horizontalScrollbarStyle = {}

var IS_MAC
if (global && global.navigator && global.navigator.appVersion.indexOf("Mac") != -1){
    IS_MAC = true
    //on a MAC
    horizontalScrollbarStyle.position = 'absolute'
    horizontalScrollbarStyle.height = 20
}

function signum(x){
    return x < 0? -1: 1
}

function getProtectScrollConfig(){
    //THIS
    var tableWrapper = this.refs.tableWrapper.getDOMNode()
    var horizScrollbar = this.refs.horizScrollbar.getDOMNode()

    var tableHeight   = this.getTableScrollHeight()
    var wrapperHeight = tableWrapper.offsetHeight - horizScrollbar.offsetHeight
    var wrapperWidth  = tableWrapper.offsetWidth

    return {
        tableHeight  : tableHeight,
        wrapperHeight: wrapperHeight,
        wrapperWidth : wrapperWidth
    }
}


function protectScrollTop(scrollTop, config){
    //THIS
    config = config || getProtectScrollConfig.call(this)

    var tableHeight   = config.tableHeight
    var wrapperHeight = config.wrapperHeight

    if (scrollTop + wrapperHeight > tableHeight){
        scrollTop = tableHeight - wrapperHeight
    }
    if (scrollTop < 0){
        scrollTop = 0
    }

    return scrollTop
}

function protectScrollLeft(scrollLeft, config){
    //THIS
    config = config || getProtectScrollConfig.call(this)

    var maxWidth   = this.props.totalColumnWidth
    var wrapperWidth = config.wrapperWidth

    if (scrollLeft + wrapperWidth > maxWidth){
        scrollLeft = maxWidth - wrapperWidth
    }
    if (scrollLeft < 0){
        scrollLeft = 0
    }

    return scrollLeft
}

module.exports = React.createClass({

    displayName: 'ReactDataGrid.Wrapper',

    propTypes: {
        scrollLeft      : React.PropTypes.number,
        scrollTop       : React.PropTypes.number,
        scrollbarSize   : React.PropTypes.number,
        totalColumnWidth: React.PropTypes.number,
        cellPadding     : React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        rowHeight       : React.PropTypes.any,

        data            : React.PropTypes.array,
        columns         : React.PropTypes.array,
        idProperty      : React.PropTypes.string.isRequired,

        rowFactory      : React.PropTypes.func
    },

    getProtectScrollConfig: function(){
        return getProtectScrollConfig.apply(this, arguments)
    },

    protectScrollTop: function(){
        return protectScrollTop.apply(this, arguments)
    },

    protectScrollLeft: function(){
        return protectScrollLeft.apply(this, arguments)
    },

    getDefaultProps: function(){

        return {
            scrollLeft: 0,
            scrollTop : 0
        }
    },

    syncVerticalScroller: function(scrollTop, event){

        if (scrollTop === undefined){
            scrollTop = this.props.scrollTop + (this.props.topOffset || 0)
        }

        this.lockVerticalScroll = true

        var domNode = this.refs.verticalScrollbar.getDOMNode()

        domNode.scrollTop = scrollTop

        var newScrollTop = domNode.scrollTop

        if (newScrollTop != scrollTop){
            //overflowing either to top, or to bottom
            this.props.onScrollOverflow && this.props.onScrollOverflow(signum(scrollTop), newScrollTop)
        } else {
            preventDefault(event)
        }
    },

    render: function() {

        var props     = this.prepareProps(this.props)
        var rowsCount = props.renderCount

        var tableProps = props.tableProps

        var groupsCount = 0
        var table = props.table

        if (props.groupData){
            groupsCount = props.groupData.groupsCount
        }

        if (props.virtualRendering){
            rowsCount += groupsCount
        }

        this.groupsCount = groupsCount

        // var loadersSize          = props.loadersSize
        var verticalScrollerSize = (props.totalLength + groupsCount) * props.rowHeight// + loadersSize

        var events = {}

        if (!hasTouch){
            events.onWheel = this.handleWheel
        } else {
            events.onTouchStart = this.handleTouchStart
        }

        var wrapperStyle = {
            // paddingRight: props.empty? 0: props.scrollbarSize
        }

        if (props.empty){
            assign(wrapperStyle, props.emptyWrapperStyle)
        }

        var emptyText

        if (props.empty){
            emptyText = <div className="z-empty-text" style={props.emptyTextStyle}>{props.emptyText}</div>
        }

        var loadMask

        if (!props.loadMaskOverHeader){
            loadMask = <LoadMask visible={props.loading} />
        }

        var content = props.empty?
            emptyText:
            //extra div needed for SAFARI V SCROLL
            //maxWidth needed for FF - see
            //http://stackoverflow.com/questions/27424831/firefox-flexbox-overflow
            //http://stackoverflow.com/questions/27472595/firefox-34-ignoring-max-width-for-flexbox
            <div className="z-table-wrapper-fix" style={{maxWidth: 'calc(100% - ' + props.scrollbarSize + 'px)'}}>
                <div {...tableProps} ref="table"/>
            </div>

        var horizScrollbar

        if (IS_MAC){
            //needed for mac safari
            horizScrollbar = <div style={horizontalScrollbarStyle} className="z-horizontal-scrollbar mac-fix">
                <div ref="horizScrollbar" onScroll={this.handleHorizontalScroll} className="z-horizontal-scrollbar-fix">
                    <div className="z-horizontal-scroller" style={{width: props.minRowWidth}} />
                </div>
            </div>
        } else {
            horizScrollbar = <div ref="horizScrollbar" onScroll={this.handleHorizontalScroll} style={horizontalScrollbarStyle} className="z-horizontal-scrollbar">
                <div className="z-horizontal-scroller" style={{width: props.minRowWidth}} />
            </div>
        }

        var verticalScrollbarStyle = {
            width: props.scrollbarSize
        }

        return (
            <div className="z-wrapper" style={{height: rowsCount * props.rowHeight, overflow: 'auto', position: 'relative'}}>


                {loadMask}

                <div ref="tableWrapper" className="z-table-wrapper" style={wrapperStyle} {...events}>
                    {content}

                    <div className="z-vertical-scrollbar" style={verticalScrollbarStyle}>
                        <div ref="verticalScrollbar" onScroll={this.handleVerticalScroll} style={{overflow: 'auto', width: '100%', height: '100%'}}>
                            <div className="z-vertical-scroller" style={{height: verticalScrollerSize}} />
                        </div>

                    </div>
                </div>

                {horizScrollbar}
            </div>
        )


    },

    handleTouchStart: function(event) {

        var props = this.props
        var table = this.refs.table.getDOMNode()

        var scroll = {
            top : props.scrollTop,
            left: props.scrollLeft
        }

        var protectScrollConfig = this.getProtectScrollConfig()

        var newScrollPos

        var side

        DragHelper(event, {
            scope: this,
            onDrag: buffer(function(event, config) {

                var diffTop = config.diff.top
                var diffLeft = config.diff.top

                var diff

                if (diffTop == 0 && diffLeft == 0){
                    return
                }

                if (!side){
                    side = Math.abs(config.diff.top) > Math.abs(config.diff.left)? 'top': 'left'
                }

                diff = config.diff[side]

                newScrollPos = scroll[side] - diff

                if (side == 'top'){
                    newScrollPos = this.protectScrollTop(newScrollPos, protectScrollConfig)
                } else {
                    newScrollPos = this.protectScrollLeft(newScrollPos, protectScrollConfig)
                }

                if (props.virtualRendering && side == 'top'){
                    this.verticalScrollAt(newScrollPos, event)
                    return
                }

                if (side == 'left'){
                    this.horizontalScrollAt(newScrollPos)
                    return
                }

                var tableStyleProps = {
                    virtualRendering: props.virtualRendering,
                    scrollLeft      : scroll.left,
                    scrollTop       : scroll.top
                }

                if (side == 'top'){
                    tableStyleProps.scrollTop = newScrollPos
                } else {
                    tableStyleProps.scrollLeft = newScrollPos
                }

                var style = tableStyle(tableStyleProps)

                Object.keys(style).forEach(function(k){
                    var value = style[k]
                    table.style[k] = value
                })

            }, -1),
            onDrop: function(event){

                if (!side){
                    return
                }

                if (side == 'left'){
                    return
                }

                if (!props.virtualRendering){
                    props.onScrollTop(newScrollPos)
                } else {
                    this.verticalScrollAt(newScrollPos, event)
                }
            }
        })

        event.stopPropagation()
        event.preventDefault()
    },

    horizontalScrollAt: function(scrollLeft) {
        this.props.onScrollLeft(scrollLeft)
    },

    handleWheel: function(event){

        var delta = event.deltaY

        if (delta && Math.abs(delta) < 40){
            delta = signum(delta) * 40
        }

        if (event.shiftKey){

            if (!delta){
                delta = event.deltaX
            }

            var horizScrollbar = this.refs.horizScrollbar
            var domNode             = horizScrollbar.getDOMNode()
            var pos                 = domNode.scrollLeft

            if (delta < 0 && pos == 0){
                //no need to prevent default
                //we allow the event to continue so the browser
                //scrolls parent dom elements if needed
                return
            }

            domNode.scrollLeft = pos + delta

            // if (delta > 0 && domNode.scrollLeft == pos){
            //     //the grid was not scrolled
            //     this.refs.tableWrapper.getDOMNode().scrollLeft = 0
            //     return
            // }

            preventDefault(event)

            return
        }

        this.addMouseWheelDelta(delta, event)
    },


    getTableScrollHeight: function(){
        var props  = this.props
        var result = props.virtualRendering?
        (props.totalLength + this.groupsCount || 0) * props.rowHeight:
            this.refs.table.getDOMNode().offsetHeight

        return result
    },

    addMouseWheelDelta: function(deltaY, event){

        var props     = this.props
        var virtual   = props.virtualRendering
        var scrollTop = props.scrollTop

        if (virtual && deltaY < 0 && -deltaY < props.rowHeight){
            //when scrolling to go up, account for the case where abs(deltaY)
            //is less than the rowHeight, as this results in no scrolling
            //so make sure it's at least deltaY
            deltaY = -props.rowHeight
        }

        if (virtual && props.scrollBy){
            deltaY = signum(deltaY) * props.scrollBy * props.rowHeight
        }

        scrollTop += deltaY
        this.verticalScrollAt(scrollTop, event)
    },
    verticalScrollAt: function(scrollTop, event){
        this.mouseWheelScroll = true
        this.syncVerticalScroller(scrollTop, event)
        raf(function(){
            this.mouseWheelScroll = false
        }.bind(this))
    },
    handleHorizontalScroll: function(event){
        this.props.onScrollLeft(event.target.scrollLeft)
    },
    handleVerticalScroll: function(event){

        var target = event.target
        var scrollTop = target.scrollTop

        if (!this.mouseWheelScroll && this.props.onScrollOverflow){
            if (scrollTop == 0){
                this.props.onScrollOverflow(-1, scrollTop)
            } else if (scrollTop + target.clientHeight >= target.scrollHeight){
                this.props.onScrollOverflow(1, scrollTop)
            }
        }

        this.onVerticalScroll(scrollTop)
    },
    onVerticalScroll: function(pos){
        this.props.onScrollTop(pos)
    },
    prepareProps: function(thisProps){
        var props = {}

        assign(props, thisProps)

        return props
    }
})
