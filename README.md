# Goal

- Build a spreadsheet editor inside a textarea HTML element.
- It should be a UI component that another more complex editor can use

# TODO
## MsEditor

- Backspace: customMoveLeftOrUpAndRight

- Notes input
  - all 3 octaves
- Transpile and add a link

- When cursor is in text mode, cursor should move to the right of next white space
  - or exit text mode and go to next cell.
- arrow: in text mode, select entire token and the space following it



## TsEditor
- Implement backspace in the left-most cell (moveLeftOrUpAndRight)
- On click: use the selection range to determine which cell the cursor should be on.

# Done

## MsEditor
- added a layer to reorder events smartly

## TsEditor
- Tab: go right until 4 non-pickup bars is reached, and then go to next line's non-pickup
- Implement arrow only moving cell if at the end of the text
  - In text mode, set cursor correctly based on the textIdx.
- Display cell mode by selecting the whole cell
- handle Enter by moving to the leftmost cell in the row below
  - To not change column, use arrow keys.
- handle Tab by moving to the cell to the right
  - create a new cell if not already present
  - For clients, they can override this by using `evt.preventDefault()` and `evtIsHotkey(evt, 'tab')`
- handle input key normally