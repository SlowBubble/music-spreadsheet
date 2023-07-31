
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

export function noteNumToAbc(noteNum: number): string {
  const possibleStr = modNoteNumToAbc.get(mod(noteNum, 12));
  if (!possibleStr) {
    throw new Error('Invalid noteNum: ' + noteNum);
  }
  const numOctaveAboveMiddleC = Math.floor((noteNum - 60) / 12);
  if (numOctaveAboveMiddleC < 0) {
    return '/'.repeat(-numOctaveAboveMiddleC) + possibleStr;
  }
  return '\\'.repeat(numOctaveAboveMiddleC) + possibleStr;
}

function mod(a: number, b: number) {
  return (a % b + b) % b;
}
