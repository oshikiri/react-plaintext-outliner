import {
  useRef,
  useEffect,
  JSX,
  MouseEventHandler,
  KeyboardEventHandler,
} from "react";

import { useStore } from "./state";
import BlockEntity from "./BlockEntity";
import { indent, outdent } from "./edit";
import {
  getOffset,
  setCursor,
  getTextsAroundCursor,
  getNearestCursorOffset,
  isCaretAtLastLine,
  isCaretAtFirstLine,
  getOffsetFromLineStart,
  getCursorPositionInBlock,
} from "./dom";
import { getNewlineRangeset } from "./Range";

export default function BlockComponent({
  block,
}: {
  block: BlockEntity;
}): JSX.Element {
  const cursorPosition = useStore((state: any) => state.cursorPosition);
  const setCursorPosition = useStore((state: any) => state.setCursorPosition);
  const createNextBlock = useStore((state: any) => state.createNextBlock);
  const setBlockById = useStore((state: any) => state.setBlockById);

  const contentRef = useRef<HTMLDivElement>(null);

  const isEditing = block.id === cursorPosition?.blockId;
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();

      const offset = getOffset(contentRef.current, cursorPosition.startOffset);
      const textNode = contentRef.current.childNodes[0] as HTMLElement;
      if (textNode) {
        setCursor(textNode, offset);
      }
    }
  }, [cursorPosition]);

  const onBlur = () => {
    setCursorPosition(null);
    block.content = contentRef.current?.innerText || "";
    setBlockById(block.id, block);
  };

  const onKeyDown: KeyboardEventHandler = (event) => {
    const currentElement = contentRef.current;
    const currentInnerText: string = currentElement?.innerText || "";

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const { beforeCursor, afterCursor } = getTextsAroundCursor();
      const newBlock = createNextBlock(block.id, beforeCursor, afterCursor);
      setCursorPosition(newBlock.id, 0);
    } else if (event.key === "Tab") {
      event.preventDefault();
      block.content = currentInnerText;
      setBlockById(block.id, block);

      if (event.shiftKey) {
        const { parent, grandParent } = outdent(block);
        if (parent) {
          setBlockById(parent.id, parent);
        }
        if (grandParent) {
          setBlockById(grandParent.id, grandParent);
        }
      } else {
        const parent = indent(block);
        if (parent) {
          setBlockById(parent.id, parent);
        }
      }

      const { startOffset } = getTextsAroundCursor();
      setCursorPosition(block.id, startOffset);
    } else if (event.key === "ArrowDown") {
      if (!currentElement || !isCaretAtLastLine(block.content)) {
        return;
      }

      event.preventDefault();
      const nextBlock = block.getNextBlock();
      if (!nextBlock) {
        return;
      }

      // Save the current block's content before moving.
      block.content = currentInnerText;
      setBlockById(block.id, block);

      const caretOffset = getOffsetFromLineStart(currentElement);
      const lastRange = getNewlineRangeset(block.content).getLastRange();
      const nextCaretOffset = lastRange
        ? Math.max(0, caretOffset - lastRange.l - 1)
        : 0;
      setCursorPosition(nextBlock.id, nextCaretOffset);
    } else if (event.key === "ArrowUp") {
      // If the caret is not at the first line, do nothing
      if (!currentElement || !isCaretAtFirstLine()) {
        return;
      }

      // If the caret is at the first line, move to the previous block.
      event.preventDefault();
      const prevBlock = block.getPrevBlock();
      if (!prevBlock) {
        return;
      }

      // If you edit the current block and then move to above, save its content.
      block.content = currentInnerText;
      setBlockById(block.id, block);

      const offsetAtPrev = getOffsetFromLineStart(currentElement);
      const lastRange = getNewlineRangeset(prevBlock.content).getLastRange();
      const nextCaretOffset = lastRange
        ? Math.min(lastRange.l + offsetAtPrev + 1, lastRange.r)
        : 0;
      setCursorPosition(prevBlock.id, nextCaretOffset);
    } else if (event.key === "a" && event.ctrlKey) {
      event.preventDefault();

      const pos = getCursorPositionInBlock(window.getSelection());
      const newlineBeforeCaret = pos?.newlines?.findLast((newline) => {
        return newline.index < pos.anchorOffset;
      });
      if (newlineBeforeCaret) {
        const newlineIndex = newlineBeforeCaret.index;
        setCursorPosition(block.id, newlineIndex + 1);
      } else {
        setCursorPosition(block.id, 0);
      }
    } else if (event.key === "e" && event.ctrlKey) {
      event.preventDefault();

      const pos = getCursorPositionInBlock(window.getSelection());
      const newlineAfterCaret = pos?.newlines?.find((newline) => {
        return newline.index >= pos.anchorOffset;
      });
      if (newlineAfterCaret) {
        const newlineIndex = newlineAfterCaret.index;
        setCursorPosition(block.id, newlineIndex);
      } else {
        setCursorPosition(block.id, currentInnerText.length);
      }
    }
  };

  const onClick: MouseEventHandler = (event) => {
    const startOffset = getNearestCursorOffset(event.clientX, event.clientY);
    setCursorPosition(block.id, startOffset);
    event.stopPropagation();
    return;
  };

  return (
    <div key={block.id} className="flex">
      <div>・</div>
      <div className="flex-grow">
        <div
          // Set px-2 for visibility when the cursor is at the beginning of the line.
          className="whitespace-pre-wrap break-all px-2 empty:after:content-['\00a0']"
          key={block.id + "-content"}
          ref={contentRef}
          contentEditable={isEditing || undefined}
          suppressContentEditableWarning={isEditing || undefined}
          onClick={onClick}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        >
          {block.content}
        </div>
        <div className="ml-20" key={block.id + "-children"}>
          {block.children?.map((child) => (
            <BlockComponent key={child.id} block={child} />
          ))}
        </div>
      </div>
    </div>
  );
}

function createNext(
  block: BlockEntity,
  beforeCursor: string,
  afterCursor: string,
) {
  console.log("createNext", { beforeCursor, afterCursor });
  block.content = beforeCursor;

  if (block.children.length > 0) {
    const newBlock = new BlockEntity(afterCursor, []).withParent(block);
    block.children.splice(0, 0, newBlock);
    return { block, newBlock };
  }

  const newBlock = new BlockEntity(afterCursor, []).withParent(block.parent);
  const [_parent, idx] = block.getParentAndIdx();
  block.parent?.children.splice(idx + 1, 0, newBlock);
  return { block, newBlock };
}

export { createNext };
