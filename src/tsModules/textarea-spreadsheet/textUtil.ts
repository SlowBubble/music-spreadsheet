
// The text index will be on the right of any spaces
export function getTextIdxOnTheLeft(text: string, currTextIdx: number) {
  const tokenInfos = getTokenInfos(text);
  const idx = getTokenInfosContainingCurrTextIdx(tokenInfos, currTextIdx);
  if (idx <= 0) {
    return 0;
  }
  return tokenInfos[idx].startIdx;
}

// The text index will be on the right of any spaces
export function getTextIdxOnTheRight(text: string, currTextIdx: number) {
  const tokenInfos = getTokenInfos(text);
  const idx = getTokenInfosContainingCurrTextIdx(tokenInfos, currTextIdx);
  if (tokenInfos.length === 0) {
    return 0;
  }
  return tokenInfos[idx + 1].endIdx;
}

interface TokenInfo {
  string: string;
  startIdx: number;
  endIdx: number;
}

function getTokenInfos(text: string) {
  let idx = 0;
  // Split so that 'A B C ' becomes ['A ', 'B ', 'C ']
  return text.split(/(?!\s+)/).map(token => {
    const oldIdx = idx;
    idx += token.length;
    return {
      string: token,
      startIdx: oldIdx,
      endIdx: idx,
    }
  });
}
// (---](--](--x--] --> tokenInfosIdxContainingCurrTextIdx is 2
function getTokenInfosContainingCurrTextIdx(tokenInfos: TokenInfo[], currTextIdx: number) {
  for (let tokenInfoIdx = 0; tokenInfoIdx < tokenInfos.length; tokenInfoIdx++) {
    const tokenStartingIdx = tokenInfos[tokenInfoIdx].startIdx;
    if (currTextIdx <= tokenStartingIdx) {
      return tokenInfoIdx - 1;
    }
  }
  return tokenInfos.length - 1;
}

