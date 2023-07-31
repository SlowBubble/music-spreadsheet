# Goal

- Build a spreadsheet editor inside a textarea HTML element.
- It should be a UI component that another more complex editor can use

# TODO

## MsEditor

- enharmonic
  - Unfortunately, this will not be reflected in the sheet music, just the textarea.
- up/down arrow
- adding headers
- adding chords
- Delete: remove token to the right in the same cell.
- Think of shortcuts to add a row or remove a row
  - push things to the next cell (snake-push and snake-pull)

### P2

- Tab or enter: add _ for the cell it is exiting
  - Requires understanding which part we are in
- When cursor is in text mode, cursor should move to the right of next white space
  - or exit text mode and go to next cell.

## MidiChordSheet

- Handle cells with nothing
- Handle song with only voice and no chords (i.e. part)

## TsEditor
- Implement backspace in the left-most cell (moveLeftOrUpAndRight)
- On click: use the selection range to determine which cell the cursor should be on.
- applyLint when not in text mode, should remove redundant spaces for each column.

# Done

## MsEditor

## TsEditor