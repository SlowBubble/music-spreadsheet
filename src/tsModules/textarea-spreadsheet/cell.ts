
export class Cell {
  constructor(public text: string = '') { }
  isEmpty() {
    return this.text.trim() === '';
  }
}