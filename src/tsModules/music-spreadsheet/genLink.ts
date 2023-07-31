import { TextTable } from "../textarea-spreadsheet/textTable";

export function genLink(textTable: TextTable) {
  const json = textTableToArrOfArrs(textTable);
  const jsonStr = JSON.stringify(json);
  return jsonStringToLink(jsonStr);
}

function textTableToArrOfArrs(textTable: TextTable) {
  const res = [
    ['', 'Key: C'],
    ['', 'Meter: 4/4'],
    ['', 'Tempo: 180'],
    ['', 'Part: A'],
    ['', '_'],
    ['', 'Voice: A'],
  ];
  const arrOfArrs = textTable.cells.map(row => row.map(cell => {
    const text = cell.text.trim();
    return text.replace(/;/g, '|');
  }));
  return res.concat(arrOfArrs);
}

function jsonStringToLink(jsonStr: string) {
  const baseLink = 'https://slowbubble.github.io/MidiChordSheet/';
  const title = 'untitled';
  return `${baseLink}#displayNotes=1&title=${title}&data=${encodeURIComponent(jsonStr)}`
}
