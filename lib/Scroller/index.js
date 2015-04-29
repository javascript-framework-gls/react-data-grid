'use strict'

var React     = require('react')
var LoadMask  = require('react-load-mask')
var assign    = require('object-assign')
var normalize = require('react-style-normalizer')
var hasTouch  = require('has-touch')
var raf       = require('raf')

function preventDefault(event){
	event.preventDefault()
}

function emptyFn(){}

var LoadMaskFactory = React.createFactory(LoadMask)

function signum(x){
    return x < 0? -1: 1
}

var horizontalScrollbarStyle = {}

var IS_MAC
if (global && global.navigator && global.navigator.appVersion.indexOf("Mac") != -1){
    IS_MAC = true
    //on a MAC
    horizontalScrollbarStyle.position = 'absolute'
    horizontalScrollbarStyle.height = 20
}

var PT = React.PropTypes
var DISPLAY_NAME = 'ReactDataGrid.Scroller'

/**
 * The scroller can have a load mask (loadMask prop is true by default),
 * you just need to specify loading=true to see it in action
 *
 * <Scroller loading={true} />
 *
 * If you don't want a load mask, specify
 *
 * <Scroller loadMask={false} />
 *
 * Or if you want to customize the loadMask factory, specify
 *
 * function mask(props) { return aMaskFactory(props) }
 * <Scroller loading={true} loadMask={mask}
 *
 */
module.exports = React.createClass({

	displayName: DISPLAY_NAME,

	propTypes: {
		loadMask: PT.oneOfType([
			PT.bool,
			PT.func
		]),
		loading : PT.bool,

		scrollWidth : PT.number.isRequired,
		scrollHeight: PT.number.isRequired,
		height: PT.number,
		scrollTop: PT.number,
		virtualRendering: PT.oneOf([true])
	},

	getDefaultProps: function(){
		return {
			'data-display-name': DISPLAY_NAME,
			loadMask: true,

			virtualRendering: true, //FOR NOW, only true is supported
			scrollbarSize: 20,

			scrollStep: 10,
			scrollTop : 0
		}
	},

	render: function(){
		var props = this.p = this.prepareProps(this.props)

		var loadMask            = this.renderLoadMask(props)
		var horizontalScrollbar = this.renderHorizontalScrollbar(props)
		var verticalScrollbar   = this.renderVerticalScrollbar(props)

		var events = {}

		if (!hasTouch){
		    events.onWheel = this.handleWheel
		} else {
		    events.onTouchStart = this.handleTouchStart
		}

		return React.createElement("div", React.__spread({},  props), 
			loadMask, 

			React.createElement("div", React.__spread({className: "z-content-wrapper"},  events), 
				props.children, 
				verticalScrollbar
			), 

			horizontalScrollbar
		)
	},

	handleWheel: function(event){

	    var delta = event.deltaY

	    if (delta && Math.abs(delta) < 40){
	        delta = signum(delta) * 40
	    }

	    if (event.shiftKey){
	    	//HORIZONTAL SCROLL
	        if (!delta){
	            delta = event.deltaX
	        }

			var horizScrollbar = this.refs.horizScrollbar
			var domNode        = React.findDOMNode(horizScrollbar)
			var pos            = domNode.scrollLeft

	        if (delta < 0 && pos == 0){
	            //no need to prevent default
	            //we allow the event to continue so the browser
	            //scrolls parent dom elements if needed
	            return
	        }

	        domNode.scrollLeft = pos + delta

	        preventDefault(event)

	        return
	    }

	    //VERTICAL SCROLL
		var deltaY     = delta
		var props      = this.props
		var virtual    = props.virtualRendering
		var scrollTop  = props.scrollTop
		var scrollStep = props.scrollStep

	    if (virtual && deltaY < 0 && -deltaY < scrollStep){
	        //when scrolling to go up, account for the case where abs(deltaY)
	        //is less than the scrollStep, as this results in no scrolling
	        //so make sure it's at least deltaY
	        deltaY = -scrollStep
	    }

	    if (virtual && props.scrollBy){
	        deltaY = signum(deltaY) * props.scrollBy * scrollStep
	    }

	    scrollTop += deltaY

	    this.mouseWheelScroll = true
	    this.syncVerticalScrollbar(scrollTop, event)
	    raf(function(){
	        this.mouseWheelScroll = false
	    }.bind(this))
	},

	syncVerticalScrollbar: function(scrollTop, event){

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

	onVerticalScroll: function(pos){
	    ;(this.props.onScrollTop || emptyFn)(pos)
	},

	handleVerticalScroll: function(event){

		var target    = event.target
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
	////////////////////////////////////////////////
	//
	// RENDER METHODS
	//
	////////////////////////////////////////////////
	renderVerticalScrollbar: function(props) {
		var height = props.scrollHeight
		var verticalScrollbarStyle = {
			width: props.scrollbarSize
		}

		var onScroll = this.handleVerticalScroll

		return React.createElement("div", {className: "z-vertical-scrollbar", style: verticalScrollbarStyle}, 
		    React.createElement("div", {
		    	ref: "verticalScrollbar", 
		    	onScroll: onScroll, 
		    	style: {overflow: 'auto', width: '100%', height: '100%'}
		    }, 
		        React.createElement("div", {className: "z-vertical-scroller", style: {height: height}})
		    )
		)
	},

	renderHorizontalScrollbar: function(props) {
		var scrollbar
		var onScroll = this.handleHorizontalScroll
		var style    = horizontalScrollbarStyle
		var minWidth = props.scrollWidth

		var scroller = React.createElement("div", {className: "z-horizontal-scroller", style: {width: minWidth}})

		if (IS_MAC){
		    //needed for mac safari
		    scrollbar = React.createElement("div", {
		    			style: style, 
		    			className: "z-horizontal-scrollbar mac-fix"
		    		}, 
				        React.createElement("div", {
				        	ref: "horizScrollbar", 
				        	onScroll: onScroll, 
				        	className: "z-horizontal-scrollbar-fix"
				        }, 
				            scroller
				        )
		    		)
		} else {
		    scrollbar = React.createElement("div", {
		    		style: style, 
		    		className: "z-horizontal-scrollbar", 
		    		ref: "horizScrollbar", 
		    		onScroll: onScroll
		    	}, 
		        scroller
		    )
		}

		return scrollbar
	},

	renderLoadMask: function(props) {
		if (props.loadMask){
			var loadMaskProps = assign({ visible: props.loading }, props.loadMaskProps)

			var defaultFactory = LoadMaskFactory
			var factory = typeof props.loadMask == 'function'?
							props.loadMask:
							defaultFactory

			var mask = factory(loadMaskProps)

			if (mask === undefined){
				//allow the specified factory to just modify props
				//and then leave the rendering to the defaultFactory
				mask = defaultFactory(loadMaskProps)
			}

			return mask
		}
	},

	////////////////////////////////////////////////
	//
	// PREPARE PROPS METHODS
	//
	////////////////////////////////////////////////
	prepareProps: function(thisProps) {
		var props = assign({}, thisProps)

		props.className = this.prepareClassName(props)
		props.style     = this.prepareStyle(props)

		return props
	},

	prepareStyle: function(props) {
		var style = assign({}, props.style)

		if (props.height != null){
			style.height = props.height
		}

		if (props.normalizeStyles){
			style = normalize(style)
		}

		return style
	},

	prepareClassName: function(props) {
		var className = props.className || ''

		className += ' z-scroller'

		return className
	}
})