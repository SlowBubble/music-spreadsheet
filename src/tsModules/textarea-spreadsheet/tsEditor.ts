import { evtIsHotkey, evtIsLikelyInput } from "../hotkey-util/hotkeyUtil";
import { COLUMN_DELIMITER, ROW_DELIMITER, TextTable } from "./textTable";
import { TsCursor } from "./tsCursor";

export interface KeydownHandlerOutput {
  rerender: boolean;
  applyBrowserDefault: boolean;
}

export function shouldRerenderAndPreventDefault() {
  return {
    rerender: true,
    applyBrowserDefault: false,
  };
}

export function shouldApplyBrowserDefaultWithoutRerendering() {
  return {
    rerender: false,
    applyBrowserDefault: true,
  };
}

export function shouldPreventDefaultWithoutRerendering() {
  return {
    rerender: false,
    applyBrowserDefault: false,
  };
}

export type KeydownHandler = (evt: KeyboardEvent) => KeydownHandlerOutput;

export class TsEditor {
  constructor(
      // I/O
      public textarea: HTMLTextAreaElement,
      // Model; public to allow for the lowest-level operations
      public textTable = new TextTable(),
      public cursor = new TsCursor(),
      public keydownHandler: KeydownHandler | undefined = undefined,
      public onRenderHandler: Function | undefined = undefined,
  ) {
    this.textarea.onkeydown = evt => this.handleTextareaKeydown(evt)
    this.textarea.onclick = evt => {
      // TODO use the selection range to determine which cell the cursor should be on
    }
  }

  onRender(onRenderHandler: Function) {
    this.onRenderHandler = onRenderHandler;
  }

  render() {
    // console.log('lint + update cursor')
    this.textTable.applyLint();
    this.textarea.value = this.textTable.toString();
    this.updateTextareaSelectionFromCursors();
    if (this.onRenderHandler) {
      this.onRenderHandler();
    }
  }

  updateTextareaSelectionFromCursors() {
    this.textarea.selectionStart = this.inferSelectionStart();
    this.textarea.selectionEnd = this.inferSelectionEnd();
  }

  //// Event processing  ////
  // Allow client to specify custom keydown handler.
  onKeydown(handler: KeydownHandler) {
    this.keydownHandler = handler;
  }

  handleTextareaKeydown(evt: KeyboardEvent) {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (this.keydownHandler) {
        return this.keydownHandler(evt);
      }
      return this.defaultKeydownHandler(evt);
    }
    const handlerOutput = handleKeyDown(evt);
    if (!handlerOutput.applyBrowserDefault) {
      evt.preventDefault();
    }
    if (handlerOutput.rerender) {
      this.render();
    }
  }

  handleTextInput(str: string) {
    const currCell = this.getCurrCell();
    if (!this.cursor.inTextMode) {
      currCell.text = str;
      this.cursor.inTextMode = true;
      this.cursor.textIdx = str.length;
      return;
    }
    if (!this.cursor.inTextSelectionMode) {
      // TODO splice based on textIdx
      const oldText = currCell.text;
      currCell.text = oldText.slice(0, this.cursor.textIdx) + str + oldText.slice(this.cursor.textIdx);
      this.cursor.textIdx += str.length;
      return;
    }
    // TODO: handle textSelectionMode
  }
  defaultKeydownHandler(evt: KeyboardEvent): KeydownHandlerOutput {
    if (evtIsLikelyInput(evt)) {
      this.handleTextInput(evt.key);
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'tab')) {
      this.moveToRightCell();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'shift tab')) {
      this.moveLeftOrUpAndRight();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'enter')) {
      if (!this.cursor.inTextMode) {
        this.enterTextMode();
        return shouldRerenderAndPreventDefault();
      }
      this.moveDownToLeftmostColumn();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'left')) {
      this.moveLeft();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'right')) {
      this.moveRight();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'up')) {
      this.moveUp();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'down')) {
      this.moveDown();
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'backspace')) {
      const hasChanged = this.removeTextOrMoveBack();
      if (!hasChanged) {
        this.moveLeftOrUpAndRight();
      };
      return shouldRerenderAndPreventDefault();
    }
    if (evtIsHotkey(evt, 'cmd backspace')) {
      const hasChanged = this.removeTextOrMoveBack(true);
      if (!hasChanged) {
        this.moveLeftOrUpAndRight();
      };
      return shouldRerenderAndPreventDefault();
    }
    return shouldApplyBrowserDefaultWithoutRerendering();
  }

  //removeEntireWord: removes until a space is encountered.
  // Returns whether or not there is anything removed.
  removeTextOrMoveBack(removeEntireWord = false) {
    const currCell = this.getCurrCell();
    if (this.cursor.inTextMode) {
      if (this.cursor.textIdx === 0) {
        return false;
      }
      if (!removeEntireWord) {
        currCell.text = currCell.text.slice(0, this.cursor.textIdx - 1) + currCell.text.slice(this.cursor.textIdx);
        this.cursor.textIdx -= 1;
        return true;
      }
      const tokens = currCell.text.slice(0, this.cursor.textIdx).trimEnd().split(/(\s+)/);
      const resultingSubstr = tokens.slice(0, tokens.length - 1).join('');
      currCell.text = resultingSubstr + currCell.text.slice(this.cursor.textIdx);
      this.cursor.textIdx = resultingSubstr.length;
      return true;
    }
    if (!currCell.isEmpty()) {
      currCell.text = '';
      return true;
    }
    return false;
  }
  moveLeftOrUpAndRight(removeCurrCellIfNoCellToRight=false) {
    // TODO remove the current cell there is if no more cell to the right.
    // TODO If at left boundary, move up to right most cell
    this.moveToLeftCell();
  }

  getCurrCell() {
    return this.textTable.getCellAndInsertIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
  }
  moveRight() {
    if (this.cursor.inTextMode && this.cursor.textIdx < this.getCurrCell().text.trimEnd().length) {
      this.cursor.textIdx += 1;
      return;
    }
    this.moveToRightCell();
  }
  moveToRightCell() {
    this.cursor.moveToRightCell();
    this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
  }
  moveLeft() {
    if (this.cursor.inTextMode && this.cursor.textIdx > 0) {
      this.cursor.textIdx -= 1;
      return;
    }
    this.moveToLeftCell();
  }
  moveToLeftCell() {
    this.cursor.moveToLeftCell();
    this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
  }
  moveUp() {
    this.cursor.moveToAboveCell();
    this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
  }
  moveDown() {
    this.cursor.moveToBelowCell();
    this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
  }

  moveDownToLeftmostColumn() {
    this.cursor.moveToBelowCell();
    this.cursor.colIdx = 0;
    this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
  }

  enterTextMode() {
    this.cursor.inTextMode = true;
    const currCell = this.textTable.getCellAndInsertIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
    this.cursor.textIdx = currCell.text.trimEnd().length;
  }
  // Helpers
  inferSelectionStart() {
    let idx = 0;
    const text = this.textarea.value;
    text.split(ROW_DELIMITER).forEach((line, i) => {
      if (i > this.cursor.rowIdx) {
        return;
      }
      if (i === this.cursor.rowIdx) {
        line.split(COLUMN_DELIMITER).forEach((cellText, j) => {
          if (j > this.cursor.colIdx) {
            return;
          }
          if (j === this.cursor.colIdx) {
            if (this.cursor.inTextMode) {
              idx += this.cursor.textIdx;
            }
            return;
          }
          idx += cellText.length + COLUMN_DELIMITER.length;
        });
        return;
      };
      idx += line.length + ROW_DELIMITER.length;
    });

    return idx;
  }

  inferSelectionEnd() {
    let idx = this.inferSelectionStart();
    if (this.cursor.inTextMode) {
      if (this.cursor.inTextSelectionMode) {
        return idx + this.cursor.textEndIdx;
      }
      return idx;
    }
    const currCell = this.textTable.cells[this.cursor.rowIdx][this.cursor.colIdx];
    // add one so that for zero length text, user can still see the cell selected.
    const textLength = currCell.text.trimEnd().length;
    if (textLength === 0) {
      return idx + 1;
    }
    return idx + textLength;
  }
}
