import { evtIsHotkey, evtIsLikelyInput } from "../hotkey-util/hotkeyUtil";
import { KeydownHandlerOutput, TsEditor, shouldApplyBrowserDefaultWithoutRerendering, shouldPreventDefaultWithoutRerendering, shouldRerenderAndPreventDefault } from "../textarea-spreadsheet/tsEditor";

export class MsEditor {
  protected buffer: KeyboardEvent[] = [];
  
  constructor(public tsEditor: TsEditor, public numFullBarsPerRow = 4) {
    this.tsEditor.onKeydown(evt => this.handleKeyDown(evt));
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
        rerender = rerender || this.handleKeyDownAfterOrdering(evt);
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
      if (this.tsEditor.cursor.colIdx < this.numFullBarsPerRow) {
        this.tsEditor.moveToRightCell();
        return true;
      }
      this.tsEditor.moveDownToLeftmostColumn();
      // Move right before the left-most cell is the pick-up bar.
      this.tsEditor.moveToRightCell();
      return true;
    }
    if (evtIsHotkey(evt, 'backspace')) {
      const hasChanged = this.tsEditor.removeTextOrMoveBack(true);
      if (!hasChanged) {
        this.moveLeftOrUpAndRight();
      };
    }
    return false;
  }

  customMoveLeftOrUpAndRight(removeCurrCellIfNoCellToRight=false) {

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

const keyToNoteNum: Map<string, number> = new Map([
  ['1', 60],
  ['2', 62],
  ['3', 64],
  ['4', 65],
  ['5', 67],
  ['6', 69],
  ['7', 71],
  ['8', 72],
  ['9', 74],
  ['0', 76],
]);

function mapKeyToNoteNum(key: string) {
  return keyToNoteNum.get(key);
}

const modNoteNumToAbc = new Map([
  [0, 'C'],
  [1, 'C#'],
  [2, 'D'],
  [3, 'Eb'],
  [4, 'E'],
  [5, 'F'],
  [6, 'F#'],
  [7, 'G'],
  [8, 'G#'],
  [9, 'A'],
  [10, 'Bb'],
  [11, 'B'],
]);

function noteNumToAbc(noteNum: number): string {
  const possibleStr = modNoteNumToAbc.get(mod(noteNum, 12));
  if (!possibleStr) {
    throw new Error('Invalid noteNum: ' + noteNum);
  }
  return possibleStr;
}

function mod(a: number, b: number) {
  return (a % b + b) % b;
}