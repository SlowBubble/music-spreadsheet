import { Cell } from "./cell";

export const COLUMN_DELIMITER = ' | ';
export const ROW_DELIMITER = '\n';

export class TextTable {
  constructor(public cells: Cell[][] = [[new Cell()]], public columnDelimiter = COLUMN_DELIMITER) {
  }
  static fromString(str: string, columnDelimiter = COLUMN_DELIMITER): TextTable {
    return new TextTable(stringToCells(str), columnDelimiter);
  }
  toString(): string {
    return this.cells.map(row => row.map(cell => cell.text).join(this.columnDelimiter)).join(ROW_DELIMITER);
  }
  getCellsInArray() {
    return this.cells.flatMap(row => row);
  }
  applyLint() {  
    // Remove consecutive spaces
    this.getCellsInArray().forEach(cell => stripConsecutiveSpaces(cell.text));

    // Make each column have the same number of spaces
    const rowDimensions = this.cells.map(row => row.length);
    const tranposedCells = getTransposedCells(this.cells);
    const paddedCells = getTransposedCells(tranposedCells.map(colOfCells => genColOfPaddedCells(colOfCells)));
    this.cells = getSubCells(paddedCells, rowDimensions);
  }

  getCellAndInsertIfAbsent(row: number, col: number) {
    if (!this.isWithinBound(row, col)) {
      this.insertEmptyCellIfAbsent(row, col);
    }
    return this.cells[row][col];
  }

  insertEmptyCellIfAbsent(row: number, col: number) {
    while (row >= this.cells.length) {
      this.cells.push([]);
    }
    while (col >= this.cells[row].length) {
      this.cells[row].push(new Cell());
    }
  }
  isWithinBound(row: number, col: number) {
    if (row < 0 || row >= this.cells.length) {
      return false;
    }
    if (col < 0 || col >= this.cells[row].length) {
      return false;
    }
    return true;
  }
}

////// Functional functions (i.e. no mutation)

function getSubCells(cells: Cell[][], rowDimensions: number[]) {
  return cells.map((row, i) => rowDimensions[i] > 0 ? row.slice(0, rowDimensions[i]) : []);
}
// Take into account that each row may have a different number of columns
// by filling in empty cells with empty strings (which will change the overall dims)
function getTransposedCells(cells: Cell[][]): Cell[][] {
  const transposedCells = [];
  const numOfColsByRow = cells.map(row => row.length);
  const maxNumOfCols = Math.max(...numOfColsByRow);
  for (let i = 0; i < maxNumOfCols; i++) {
    transposedCells.push(getColumnsOfCells(cells, i));
  }
  return transposedCells;
}
function stripConsecutiveSpaces(str: string) {
  return str.replace(/\s+/g, ' ');
}

function stringToCells(str: string, columnDelimiter = COLUMN_DELIMITER): Cell[][] {
  return str.split(ROW_DELIMITER).map(
    row => row.split(columnDelimiter).map(text => new Cell(text)));
}

function getColumnsOfCells(cells: Cell[][], columnIdx: number): Cell[] {
  return cells.map(row => columnIdx < row.length ? row[columnIdx] : new Cell(''));
}

function genColOfPaddedCells(colsOfCells: Cell[]): Cell[] {
  const maxWidth = Math.max(...colsOfCells.map(c => c.text.length));
  return colsOfCells
    .map(c => c.text + ' '.repeat(maxWidth - c.text.length))
    .map(text => new Cell(text));
}

