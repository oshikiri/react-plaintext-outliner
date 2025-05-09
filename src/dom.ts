function getTextsAroundCursor() {
  const selection: Selection | null = window.getSelection();
  if (!selection) {
    return { beforeCursor: "", afterCursor: "", startOffset: 0 };
  }

  const range = selection.getRangeAt(0);
  const text = range.startContainer.textContent;
  const beforeCursor = text?.substring(0, range.startOffset);
  const afterCursor = text?.substring(range.endOffset);
  return { beforeCursor, afterCursor, startOffset: range.startOffset };
}

function getOffset(node: HTMLElement, startOffset: number) {
  const nextInnerText = node.innerText || "";
  if (startOffset >= nextInnerText.length) {
    return nextInnerText.length;
  }
  return startOffset;
}

export function isCaretAtLastLine(element: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);

  const clientRects = range.getClientRects();
  if (clientRects.length === 0) {
    return true;
  }

  const lastRect = clientRects[clientRects.length - 1];
  const elementRect = element.getBoundingClientRect();

  const tolerance = 5;
  const isAtBottom =
    lastRect.bottom >= elementRect.bottom - tolerance &&
    lastRect.top <= elementRect.bottom + tolerance;

  return isAtBottom;
}

export function isCaretAtFirstLine(element: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);

  const clientRects = range.getClientRects();
  if (clientRects.length === 0) {
    return true;
  }

  const firstRect = clientRects[0];
  const elementRect = element.getBoundingClientRect();

  const tolerance = 5;
  const isAtTop =
    firstRect.top <= elementRect.top + tolerance &&
    firstRect.bottom >= elementRect.top - tolerance;

  return isAtTop;
}

/**
 * Get the offset of the cursor from the start of the line in a div.
 *
 * It considers the case where there are multiple lines due to text wrapping.
 */
export function getOffsetFromLineStart(element: HTMLElement): number {
  const selection: Selection | null = window.getSelection();
  if (!selection) {
    return 0;
  }

  const range = selection.getRangeAt(0);

  const clientRects = range.getClientRects();
  if (clientRects.length === 0) {
    return 0;
  }

  const caretRect = clientRects[clientRects.length - 1];

  const elementRect = element.getBoundingClientRect();

  const caretX = caretRect.left - elementRect.left;

  // FIXME: Assuming 8px is the width of a character
  return Math.floor(caretX / 8);
}

function setCursor(node: HTMLElement, offset: number) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset);

  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

function getNearestCursorOffset(x: number, y: number) {
  const caretPosition = document.caretPositionFromPoint(x, y);
  return caretPosition?.offset;
}

export { getOffset, setCursor, getTextsAroundCursor, getNearestCursorOffset };
