
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

  moveToRightCell() {
    this.colIdx++;
    this.inTextMode = false;
  }
  moveToLeftCell() {
    this.colIdx--;
    this.inTextMode = false;
  }
}
  

