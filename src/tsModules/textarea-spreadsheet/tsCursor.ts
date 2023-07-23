
export class TsCursor {
  constructor(
    public rowIdx = 0,
    public colIdx = 0,
    public inTextMode = false,

    // Relevant only in text mode
    public textIdx = 0,
    public inTextSelectionMode = false,
    // Relevant only in text selection mode
    public textEndIdx = 0,
  ) { }

  // Note that the cursor is not aware of being out-of-bound.
  // It's the responsibility of the editor to ensure that.
  moveToRightCell() {
    this.colIdx++;
    this.inTextMode = false;
  }
  moveToLeftCell() {
    this.colIdx--;
    if (this.colIdx < 0) {
      this.colIdx = 0;
    }
    this.inTextMode = false;
  }
  moveToBelowCell() {
    this.rowIdx++;
    this.inTextMode = false;
  }
  moveToAboveCell() {
    this.rowIdx--;
    if (this.rowIdx < 0) {
      this.rowIdx = 0;
    }
    this.inTextMode = false;
  }
}
  

