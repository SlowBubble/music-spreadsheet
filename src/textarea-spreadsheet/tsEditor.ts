import { evtIsHotkey, evtIsLikelyInput } from "../hotkey-util/hotkeyUtil";
import { TextTable } from "./textTable";
import { TsCursor } from "./tsCursor";

export type KeydownHandler = (evt: KeyboardEvent) => void;

export class TsEditor {
  constructor(
      // I/O
      public textarea: HTMLTextAreaElement,
      // Model; public to allow for the lowest-level operations
      public textTable = new TextTable(),
      public cursor = new TsCursor(),
      public manualMode = false,
      protected customKeydownHandler: KeydownHandler | undefined = undefined,
  ) {
    this.textarea.onkeydown = evt => {
      this.handleTextareaKeydown(evt);
      this.render();
    }
  }

  render() {
    this.textTable.applyLint();
    this.textarea.value = this.textTable.toString();
    this.updateTextareaSelectionFromCursors();
  }

  updateTextareaSelectionFromCursors() {
  }

  //// Event processing  ////
  // Allow client to specify custom keydown handler.
  onKeydown(handler: KeydownHandler) {
    this.customKeydownHandler = handler;
  }

  protected handleTextareaKeydown(evt: KeyboardEvent) {
    if (this.manualMode) {
      return;
    }
    if (this.customKeydownHandler) {
      this.customKeydownHandler(evt);
    }
    if (evt.defaultPrevented) {
      return;
    }
    this.defaultWayToHandleKeydown(evt);
    evt.preventDefault();
  }

  protected defaultWayToHandleKeydown(evt: KeyboardEvent) {
    console.log('Default TextareaSpreadsheet keydown handler');
    if (evtIsLikelyInput(evt)) {
      const currCell = this.textTable.getCellAndInsertIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
      if (!this.cursor.inTextMode) {
        currCell.text = evt.key;
        this.cursor.inTextMode = true;
        return;
      }
      if (!this.cursor.inTextSelectionMode) {
        currCell.text += evt.key;
        return;
      }
      // TODO: handle text selection mode
      return;
    }
    if (evtIsHotkey(evt, 'tab')) {
      this.cursor.moveToRightCell();
      this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
    }
  }

  //// Write helpers ////
  setCell(rowIdx: number, colIdx: number, value: string) {
    // TODO insert rows and columns if necessary
    // this.rows[rowIdx][colIdx] = value;
  }
  insertNewRow(rowIdx: number) {
    // this.rows.splice(rowIdx, 0, []);
  }
  insertNewColumn(colIdx: number) {
    // for (let row of this.rows) {
    //   row.splice(colIdx, 0, '');
    // }
  }

  //// Navigation helpers  ////
  enterPlainTextMode() {
  }
  enterCellMode() {
  }
  moveToRightCell() {
  }
  moveToLeftCell() {
  }
  moveToAboveCell() {
  }
  moveToBelowCell() {
  }

}