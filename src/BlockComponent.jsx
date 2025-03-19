import { useRef, useEffect } from "react";

import { useStore } from "./state";
import BlockEntity from "./BlockEntity";
import { indent, outdent } from "./edit";

export default function BlockComponent({ block }) {
  const editingBlockId = useStore((state) => state.editingBlockId);
  const setEditingBlockId = useStore((state) => state.setEditingBlockId);
  const createNextBlock = useStore((state) => state.createNextBlock);
  const setBlockById = useStore((state) => state.setBlockById);

  const contentRef = useRef(null);

  const isEditing = block.id === editingBlockId;
  useEffect(() => {
    if (isEditing) {
      contentRef.current.focus();
    }
  }, [isEditing]);

  const onBlur = () => {
    setEditingBlockId(null);
    block.content = contentRef.current?.innerText;
    setBlockById(block.id, block);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const { beforeCursor, afterCursor } = getTextsAroundCursor();
      const newBlock = createNextBlock(block.id, beforeCursor, afterCursor);
      setEditingBlockId(newBlock.id);
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
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextBlock = block.getNextBlock();
      if (nextBlock) {
        block.content = contentRef.current?.innerText || "";
        setBlockById(block.id, block);
        setEditingBlockId(nextBlock.id);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevBlock = block.getPrevBlock();
      if (prevBlock) {
        block.content = contentRef.current?.innerText || "";
        setBlockById(block.id, block);
        setEditingBlockId(prevBlock.id);
      }
    }
  };

  const onClick = (event) => {
    setEditingBlockId(block.id);
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

function getTextsAroundCursor() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const text = range.startContainer.textContent;
  const beforeCursor = text.substring(0, range.startOffset);
  const afterCursor = text.substring(range.endOffset);
  return { beforeCursor, afterCursor };
}

export { createNext };
