import { create } from "zustand";

import { createNext } from "./block/BlockComponent";
import BlockEntity, { createBlock } from "./BlockEntity";
import { initialPage } from "./data";

const rootBlockKey = "rootBlock";
const rootBlockFromLocalStorage = localStorage.getItem(rootBlockKey);
const rootBlock = rootBlockFromLocalStorage
  ? JSON.parse(rootBlockFromLocalStorage)
  : initialPage;

export const useStore = create((set, get: any) => ({
  rootBlock: createBlock(rootBlock),
  setRootBlock: (block: BlockEntity) => set({ rootBlock: block }),
  getBlockById: (id: string) => get().rootBlock.getBlockById(id),
  setBlockById: (id: string, block: BlockEntity) => {
    const root = createBlock(get().rootBlock);
    const updatedRoot = root.updateBlockById(id, block);
    set({ rootBlock: createBlock(updatedRoot) });
  },
  createNextBlock: (id: string, beforeCursor: string, afterCursor: string) => {
    const block = get().rootBlock.getBlockById(id);
    const { newBlock } = createNext(block, beforeCursor, afterCursor);
    get().setBlockById(newBlock.id, newBlock);
    return newBlock;
  },
  cursorPosition: null,
  setCursorPosition: (blockId: string, startOffset: number) =>
    set({ cursorPosition: { blockId, startOffset } }),
}));

export function setToLocalStorage(rootBlock: BlockEntity) {
  localStorage.setItem(rootBlockKey, JSON.stringify(rootBlock.toJson()));
}
export function clearLocalStorage() {
  localStorage.removeItem(rootBlockKey);
}
