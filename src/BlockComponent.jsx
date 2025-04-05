import { useRef, useEffect } from "react";

import { useStore } from "./state";
import BlockEntity from "./BlockEntity";
import { indent, outdent } from "./edit";
import {
  getOffset,
  setCursor,
  getTextsAroundCursor,
  getNearestCursorOffset,
} from "./dom";

export default function BlockComponent({ block }) {
  const cursorPosition = useStore((state) => state.cursorPosition);
  const setCursorPosition = useStore((state) => state.setCursorPosition);
  const createNextBlock = useStore((state) => state.createNextBlock);
  const setBlockById = useStore((state) => state.setBlockById);

  const contentRef = useRef(null);

  const isEditing = block.id === cursorPosition?.blockId;
  useEffect(() => {
    if (isEditing) {
      contentRef.current.focus();

      const offset = getOffset(contentRef.current, cursorPosition.startOffset);
      const textNode = contentRef.current.childNodes[0];
      if (textNode) {
        setCursor(textNode, offset);
      }
    }
  }, [isEditing]);

  const onBlur = () => {
    setCursorPosition(null);
    block.content = contentRef.current?.innerText;
    setBlockById(block.id, block);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const { beforeCursor, afterCursor } = getTextsAroundCursor();
      const newBlock = createNextBlock(block.id, beforeCursor, afterCursor);
      setCursorPosition(newBlock.id, 0);
    } else if (event.key === "Tab") {
      event.preventDefault();
      block.content = contentRef.current?.innerText || "";
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
        setBlockById(parent.id, parent);
      }

      const { startOffset } = getTextsAroundCursor();
      setCursorPosition(block.id, startOffset);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextBlock = block.getNextBlock();
      if (nextBlock) {
        block.content = contentRef.current?.innerText || "";
        setBlockById(block.id, block);

        const { startOffset } = getTextsAroundCursor();
        setCursorPosition(nextBlock.id, startOffset);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevBlock = block.getPrevBlock();
      if (prevBlock) {
        block.content = contentRef.current?.innerText || "";
        setBlockById(block.id, block);

        const { startOffset } = getTextsAroundCursor();
        setCursorPosition(prevBlock.id, startOffset);
      }
    }
  };

  const onClick = (event) => {
    const startOffset = getNearestCursorOffset(event.clientX, event.clientY);
    setCursorPosition(block.id, startOffset);
    event.stopPropagation();
    return;
  };

  return (
    <div key={block.id}>
      <div
        className="before:content-['・'] mr-5"
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
  );
}

function createNext(block, beforeCursor, afterCursor) {
  console.log("createNext", { beforeCursor, afterCursor });
  block.content = beforeCursor;

  if (block.children.length > 0) {
    const newBlock = new BlockEntity(afterCursor, []).withParent(block);
    block.children.splice(0, 0, newBlock);
    return { block, newBlock };
  }

  const newBlock = new BlockEntity(afterCursor, []).withParent(block.parent);
  const [_parent, idx] = block.getParentAndIdx();
  block.parent.children.splice(idx + 1, 0, newBlock);
  return { block, newBlock };
}

export { createNext };
