import { evtIsHotkey, evtIsLikelyInput } from "../hotkey-util/hotkeyUtil";
import { getTextIdxOnTheLeft, getTextIdxOnTheRight } from "../textarea-spreadsheet/textUtil";
import { KeydownHandlerOutput, TsEditor, shouldApplyBrowserDefaultWithoutRerendering, shouldPreventDefaultWithoutRerendering, shouldRerenderAndPreventDefault } from "../textarea-spreadsheet/tsEditor";
import { mapKeyToNoteNum } from "./keyToNoteNumMapping";
import { noteNumToAbc } from "./noteNumToAbcMapping";

export class MsEditor {
  protected buffer: KeyboardEvent[] = [];
  
  constructor(public tsEditor: TsEditor, public magicMode = true, public numFullBarsPerRow = 4) {
    this.tsEditor.onKeydown(evt => {
      if (this.magicMode) {
        return this.handleKeyDown(evt);
      }
      return this.tsEditor.defaultKeydownHandler(evt);
    });
  }

  handleKeyDown(evt: KeyboardEvent): KeydownHandlerOutput {
    // Need to disable custom behavior to avoid infinite loop.
    this.buffer.push(evt);
    window.setTimeout(() => {
      // Special keys should come before other keys
      this.buffer.sort((evt1, evt2) => {
        const isSpecialKey = evtIsHotkey(evt1, 'tab') || evtIsHotkey(evt1, '`');
        const isSpecialKey2 = evtIsHotkey(evt2, 'tab') || evtIsHotkey(evt2, '`');
        if (!isSpecialKey && isSpecialKey2) {
          return 1;
        }
        return -1;
      });
      let rerender = false;
      this.buffer.forEach(evt => {
        const shouldRerender = this.handleKeyDownAfterOrdering(evt);
        rerender ||= shouldRerender;
      });
      this.buffer = [];
      if (rerender) {
        this.tsEditor.render();
      }
    }, 100);

    // Browser default needs to be explicitly enabled.
    if (evtIsHotkey(evt, 'cmd r')) return shouldApplyBrowserDefaultWithoutRerendering();
    if (evtIsHotkey(evt, 'cmd c')) return shouldApplyBrowserDefaultWithoutRerendering();
    if (evtIsHotkey(evt, 'cmd x')) return shouldApplyBrowserDefaultWithoutRerendering();
  
    // No-op because we will handle it in handleKeyDownAfterOrdering.
    return shouldPreventDefaultWithoutRerendering();
  }

  // Returns whether or not to re-render.
  handleKeyDownAfterOrdering(evt: KeyboardEvent): boolean {
    if (evtIsHotkey(evt, '`')) {
      const numDividersInCell = (this.tsEditor.getCurrCell().text.match(/;/g) || []).length;
      // TODO Use meterDenom - 1 instead of 3.
      const hasEnoughDividers = numDividersInCell === 3;
      if (hasEnoughDividers) {
        this.handleTab();
        return true;
      }
      this.addDivider();
      return true;
    }
    if (evtIsHotkey(evt, 'space')) {
      this.addProtraction();
      return true;
    }
    if (evtIsLikelyInput(evt)) {
      const possNoteNum = mapKeyToNoteNum(evt.key);
      if (possNoteNum) {
        const abc = noteNumToAbc(possNoteNum);
        this.handleTextInputWithPadding(abc);
        return true;
      }
    }
    if (evtIsHotkey(evt, 'tab')) {
      this.handleTab();
      return true;
    }
    if (evtIsHotkey(evt, 'backspace')) {
      const hasChanged = this.tsEditor.removeTextOrMoveBack(true);
      if (!hasChanged) {
        this.moveLeftOrUpRightWhereTextExists(true);
      };
      return true;
    }
    if (evtIsHotkey(evt, 'left')) {
      this.handleLeft();
      return true;
    }
    if (evtIsHotkey(evt, 'right')) {
      this.handleRight();
      return true;
    }
    return false;
  }

  // Move left if there is text in any cells in the left.
  // Otherwise, move up one row to the right-most cell with content
  moveLeftOrUpRightWhereTextExists(removeCurrCellIfNonEssential=false) {
    const oldRowIdx = this.tsEditor.cursor.rowIdx;
    const oldColIdx = this.tsEditor.cursor.colIdx;
    const currRow = this.tsEditor.textTable.cells[oldRowIdx];
    const textExistsInTheLeft = currRow.slice(0, oldColIdx).some(cell => !cell.isEmpty());
    if (oldColIdx > 1 || textExistsInTheLeft) {
      this.tsEditor.moveToLeftCell();
      if (removeCurrCellIfNonEssential) {
        // Remove the cells to the right of the cursor.
        const hasThingsToTheRight = currRow.slice(oldColIdx).some(cell => !cell.isEmpty());
        if (!hasThingsToTheRight) {
          this.tsEditor.textTable.cells[oldRowIdx] = currRow.slice(0, oldColIdx);
        }
      }
      return;
    }
    if (this.tsEditor.cursor.rowIdx === 0) {
      return;
    }
    this.tsEditor.cursor.rowIdx -= 1;
    if (removeCurrCellIfNonEssential) {
      // Remove the entire row if nothing is below it.
      const rowsBelow =this.tsEditor.textTable.cells.slice(oldRowIdx);
      const hasStuffBelow =rowsBelow.some(row => row.some(cell => !cell.isEmpty()));
      console.log(rowsBelow);
      console.log(hasStuffBelow)
      if (!hasStuffBelow) {
        this.tsEditor.textTable.cells = this.tsEditor.textTable.cells.slice(0, oldRowIdx);
      }
    }
    this.tsEditor.cursor.colIdx = this.numFullBarsPerRow;
    // const newRow = this.tsEditor.textTable.cells[this.tsEditor.cursor.rowIdx];
    // for (let idx = newRow.length - 1; idx >= 0; idx--) {
    //   if (!newRow[idx].isEmpty()) {
    //     this.tsEditor.cursor.colIdx = idx;
    //     return;
    //   }
    // }
    // this.tsEditor.cursor.colIdx = 0;
  }
  
  handleLeft() {
    if (this.tsEditor.cursor.inTextMode && this.tsEditor.cursor.textIdx > 0) {
      this.tsEditor.cursor.textIdx = getTextIdxOnTheLeft(
        this.tsEditor.getCurrCell().text, this.tsEditor.cursor.textIdx);;
      return;
    }
    this.tsEditor.moveToLeftCell();
  }
  handleRight() {
    const text = this.tsEditor.getCurrCell().text;
    if (this.tsEditor.cursor.inTextMode && this.tsEditor.cursor.textIdx < text.length) {
      this.tsEditor.cursor.textIdx = getTextIdxOnTheRight(
        text, this.tsEditor.cursor.textIdx);
      return;
    }
    if (this.tsEditor.cursor.colIdx === this.numFullBarsPerRow) {
      return;
    }
    this.tsEditor.moveToRightCell();
  }
  handleTab() {
    if (this.tsEditor.cursor.colIdx < this.numFullBarsPerRow) {
      this.tsEditor.moveToRightCell();
      return;
    }
    this.tsEditor.moveDownToLeftmostColumn();
    // Move right before the left-most cell is the pick-up bar.
    this.tsEditor.moveToRightCell();
  }
  addDivider() {
    this.handleTextInputWithPadding(';');
  }
  addProtraction() {
    this.handleTextInputWithPadding('_');
  }

  handleTextInputWithPadding(text: string) {
    const cursor = this.tsEditor.cursor;
    let paddedText = ` ${text} `;
    if (!cursor.inTextMode || cursor.textIdx === 0) {
      paddedText = `${text} `;
    } else if (this.tsEditor.getCurrCell().text.slice(cursor.textIdx - 1, cursor.textIdx) === ' ') {
      paddedText = `${text} `;
    }
    this.tsEditor.handleTextInput(paddedText);
  }

}
