function getTextsAroundCursor() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const text = range.startContainer.textContent;
  const beforeCursor = text.substring(0, range.startOffset);
  const afterCursor = text.substring(range.endOffset);
  return { beforeCursor, afterCursor, startOffset: range.startOffset };
}

function getOffset(node, startOffset) {
  const nextInnerText = node.innerText || "";
  if (startOffset >= nextInnerText.length) {
    return nextInnerText.length;
  }
  return startOffset;
}

function setCursor(node, offset) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function getNearestCursorOffset(x, y) {
  const caretPosition = document.caretPositionFromPoint(x, y);
  return caretPosition.offset;
}

export { getOffset, setCursor, getTextsAroundCursor, getNearestCursorOffset };
