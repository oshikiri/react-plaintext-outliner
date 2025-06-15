import { KeyboardEvent } from "react";
import React from "react";
import BlockEntity from "./../BlockEntity";
import * as dom from "./../dom";
import {
  getCursorPositionInBlock,
  isCaretAtFirstLine,
  isCaretAtLastLine,
  getOffsetFromLineStart,
} from "../dom";
import { getNewlineRangeset } from "../Range";

export class KeyDownEventHandlerGenerator {
  constructor(
    private block: BlockEntity,
    private contentRef: React.RefObject<HTMLElement | null>,
    private getTextsAroundCursor: () => {
      beforeCursor: string | undefined;
      afterCursor: string | undefined;
      startOffset: number;
    },
    private createNextBlock: (
      blockId: string,
      beforeCursor: string,
      afterCursor: string,
    ) => BlockEntity,
    private setCursorPosition: (blockId: string, offset: number) => void,
    private setBlockById: (blockId: string, block: BlockEntity) => void,
  ) {}

  public generate() {
    return (event: KeyboardEvent) => {
      const currentElement = this.contentRef.current;
      const currentInnerText: string = currentElement?.innerText || "";

      if (event.key === "Enter" && !event.shiftKey) {
        this.handleEnter(event, currentInnerText);
      } else if (event.key === "Tab") {
        this.handleTab(event, currentInnerText);
      } else if (event.key === "ArrowDown") {
        this.handleArrowDown(event, currentElement, currentInnerText);
      } else if (event.key === "ArrowUp") {
        this.handleArrowUp(event, currentElement, currentInnerText);
      } else if (event.key === "ArrowLeft") {
        this.handlerArrowLeft(event);
      } else if (event.key === "ArrowRight") {
        this.handlerArrowRight(event);
      } else if (event.key === "a" && event.ctrlKey) {
        this.goToLineStart(event);
      } else if (event.key === "e" && event.ctrlKey) {
        this.goToLineEnd(event, currentInnerText);
      } else if (event.key === "Backspace") {
        this.handleBackspace(event, currentInnerText);
      }
    };
  }

  private handleEnter(event: KeyboardEvent, currentInnerText: string) {
    event.preventDefault();
    const { beforeCursor, afterCursor } = this.getTextsAroundCursor();
    const newBlock = this.createNextBlock(
      this.block.id,
      beforeCursor || "",
      afterCursor || "",
    );
    this.setCursorPosition(newBlock.id, 0);
  }

  private handleTab(event: KeyboardEvent, currentInnerText: string) {
    event.preventDefault();
    this.block.content = currentInnerText;
    this.setBlockById(this.block.id, this.block);

    if (event.shiftKey) {
      const { parent, grandParent } = this.block.outdent();
      if (parent) {
        this.setBlockById(parent.id, parent);
      }
      if (grandParent) {
        this.setBlockById(grandParent.id, grandParent);
      }
    } else {
      const parent = this.block.indent();
      if (parent) {
        this.setBlockById(parent.id, parent);
      }
    }

    const { startOffset } = this.getTextsAroundCursor();
    this.setCursorPosition(this.block.id, startOffset);
  }

  private handleArrowDown(
    event: KeyboardEvent,
    currentElement: HTMLElement | null,
    currentInnerText: string,
  ) {
    if (!currentElement || !isCaretAtLastLine(this.block.content)) {
      return;
    }

    event.preventDefault();
    const nextBlock = this.block.getNextBlock();
    if (!nextBlock) {
      return;
    }

    this.block.content = currentInnerText;
    this.setBlockById(this.block.id, this.block);

    const caretOffset = getOffsetFromLineStart(currentElement);
    const lastRange = getNewlineRangeset(this.block.content).getLastRange();
    const nextCaretOffset = lastRange
      ? Math.max(0, caretOffset - lastRange.l - 1)
      : 0;
    this.setCursorPosition(nextBlock.id, nextCaretOffset);
  }

  private handleArrowUp(
    event: KeyboardEvent,
    currentElement: HTMLElement | null,
    currentInnerText: string,
  ) {
    if (!currentElement || !isCaretAtFirstLine()) {
      return;
    }

    event.preventDefault();
    const prevBlock = this.block.getPrevBlock();
    if (!prevBlock) {
      return;
    }

    this.block.content = currentInnerText;
    this.setBlockById(this.block.id, this.block);

    const offsetAtPrev = getOffsetFromLineStart(currentElement);
    const lastRange = getNewlineRangeset(prevBlock.content).getLastRange();
    const nextCaretOffset = lastRange
      ? Math.min(lastRange.l + offsetAtPrev + 1, lastRange.r)
      : 0;
    this.setCursorPosition(prevBlock.id, nextCaretOffset);
  }

  private goToLineStart(event: KeyboardEvent) {
    event.preventDefault();

    const pos = getCursorPositionInBlock(window.getSelection());
    const newlineBeforeCaret = pos?.newlines?.findLast((newline) => {
      return newline.index < pos.anchorOffset;
    });
    if (newlineBeforeCaret) {
      const newlineIndex = newlineBeforeCaret.index;
      this.setCursorPosition(this.block.id, newlineIndex + 1);
    } else {
      this.setCursorPosition(this.block.id, 0);
    }
  }

  private goToLineEnd(event: KeyboardEvent, currentInnerText: string) {
    event.preventDefault();

    const pos = getCursorPositionInBlock(window.getSelection());
    const newlineAfterCaret = pos?.newlines?.find((newline) => {
      return newline.index >= pos.anchorOffset;
    });
    if (newlineAfterCaret) {
      const newlineIndex = newlineAfterCaret.index;
      this.setCursorPosition(this.block.id, newlineIndex);
    } else {
      this.setCursorPosition(this.block.id, currentInnerText.length);
    }
  }

  private handleBackspace(event: KeyboardEvent, currentInnerText: string) {
    this.block.content = currentInnerText;

    if (this.block.children.length > 0 || !dom.caretIsAtHeadOfBlock()) {
      return;
    }

    const prevBlock = this.block.getPrevBlock();
    if (!prevBlock) {
      return;
    }

    event.preventDefault();
    const prevContentLength = prevBlock.content.length;
    prevBlock.content += this.block.content;
    const [parent, idx] = this.block.getParentAndIdx();
    parent?.children.splice(idx, 1);
    this.setCursorPosition(prevBlock.id, prevContentLength);
  }

  private handlerArrowLeft(event: KeyboardEvent) {
    if (!dom.caretIsAtHeadOfBlock()) {
      return;
    }

    event.preventDefault();
    const prevBlock = this.block.getPrevBlock();
    if (!prevBlock) {
      return;
    }

    this.setCursorPosition(prevBlock.id, prevBlock.content.length);
  }

  private handlerArrowRight(event: KeyboardEvent) {
    const position = dom.getCursorPositionInBlock(window.getSelection());
    if (position.anchorOffset != position?.wholeText?.length) {
      return;
    }

    event.preventDefault();
    const nextBlock = this.block.getNextBlock();
    if (!nextBlock) {
      return;
    }

    this.setCursorPosition(nextBlock.id, 0);
  }
}
