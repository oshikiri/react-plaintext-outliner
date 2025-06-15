import { useRef, useEffect, JSX, MouseEventHandler } from "react";

import { useStore } from "../state";
import BlockEntity from "../BlockEntity";
import {
  getOffset,
  setCursor,
  getTextsAroundCursor,
  getNearestCursorOffset,
} from "../dom";
import { KeyDownEventHandlerGenerator } from "./keyboardevent";

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

  const keyDownHandlerGenerator = new KeyDownEventHandlerGenerator(
    block,
    contentRef,
    getTextsAroundCursor,
    createNextBlock,
    setCursorPosition,
    setBlockById,
  );

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
          onKeyDown={keyDownHandlerGenerator.generate()}
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
