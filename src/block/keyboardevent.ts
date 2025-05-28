import { KeyboardEvent } from "react";
import BlockEntity from "./../BlockEntity";
import * as dom from "./../dom";

export function handlerArrowLeft(
  event: KeyboardEvent,
  setCursorPosition: any,
  block: BlockEntity,
) {
  if (!dom.caretIsAtHeadOfBlock()) {
    return;
  }

  event.preventDefault();
  const prevBlock = block.getPrevBlock();
  if (!prevBlock) {
    return;
  }

  setCursorPosition(prevBlock.id, prevBlock.content.length);
}

export function handlerArrowRight(
  event: KeyboardEvent,
  setCursorPosition: any,
  block: BlockEntity,
) {
  const position = dom.getCursorPositionInBlock(window.getSelection());
  if (position.anchorOffset != position?.wholeText?.length) {
    return;
  }

  event.preventDefault();
  const nextBlock = block.getNextBlock();
  if (!nextBlock) {
    return;
  }

  setCursorPosition(nextBlock.id, 0);
}
