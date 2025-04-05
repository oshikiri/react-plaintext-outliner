import { create } from "zustand";

import { createNext } from "./BlockComponent";
import { createBlock } from "./BlockEntity";
import { initialPage } from "./data";

const rootBlockKey = "rootBlock";
const rootBlock = JSON.parse(localStorage.getItem(rootBlockKey)) || initialPage;

export const useStore = create((set, get) => ({
  rootBlock: createBlock(rootBlock),
  setRootBlock: (block) => set({ rootBlock: block }),
  getBlockById: (id) => get().rootBlock.getBlockById(id),
  setBlockById: (id, block) => {
    const root = createBlock(get().rootBlock);
    const updatedRoot = root.updateBlockById(id, block);
    set({ rootBlock: createBlock(updatedRoot) });
  },
  createNextBlock: (id, beforeCursor, afterCursor) => {
    const block = get().rootBlock.getBlockById(id);
    const { newBlock } = createNext(block, beforeCursor, afterCursor);
    get().setBlockById(newBlock.id, newBlock);
    return newBlock;
  },
  cursorPosition: null,
  setCursorPosition: (blockId, startOffset) =>
    set({ cursorPosition: { blockId, startOffset } }),
}));

export function setToLocalStorage(rootBlock) {
  localStorage.setItem(rootBlockKey, JSON.stringify(rootBlock.toJson()));
}
export function clearLocalStorage() {
  localStorage.removeItem(rootBlockKey);
}
