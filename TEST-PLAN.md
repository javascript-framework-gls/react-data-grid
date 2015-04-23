# Testing Plan

There are a number of features that need to be tested. They follow.

## Columns

  1. Make sure the headers are rendered for each column
  2. Column visibility. By default, columns have `defaultVisible: true`. We need to test explicitly they are rendered or not in all cases:
    * defaultVisible: true
    * defaultVisible: false
    * visible: true
    * visible: false
    
    Then we need to make sure that when a column is hidden/shown from the column menu (by user interaction), it also gets hidden/displayed in the DOM. (both controlled and uncontrolled behavior).
    For controlled behavior, we have to make sure `onColumnVisibilityChange` is called.
  
  3. Make sure `withColumnMenu` is working correctly and column menu is accessible or not depending on this flag.
  4. Column sizes - we need to make sure width and flex props work properly. Check both column header and cells have the specified width
  
## DataRendering

  1. The first thing we should check, since we are doing virtual rendering, is that both the first and the end rows in the grid are rendered when they are in view.
  This means when scrollTop is 0 on the vertical scrollbar, the first record is in the DOM, and when scrollTop is maximum, the last record is in the DOM.
  
  PLEASE do not work on this yet, since we're currently working on pagination, and change the scrolling elements.
