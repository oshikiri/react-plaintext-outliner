export default class Block {
  parent: Block | null = null;
  id: string = crypto.randomUUID();

  constructor(
    public content: string,
    public children: Block[] = [],
  ) {
    this.content = content;
    children.forEach((child) => child.withParent(this));
    this.children = children;
  }

  withParent(parent: Block | null) {
    this.parent = parent;
    return this;
  }

  /**
   * Retrieve the next block in a pre-order depth-first tree traversal.
   *
   * cf. Tree traversal - Wikipedia https://en.wikipedia.org/wiki/Tree_traversal
   */
  getNextBlock() {
    // case 1: the current block has children
    //   Return the first child
    if (this.children.length > 0) {
      return this.children[0];
    }

    // case 2: the current block has no children
    //   Go up the tree until we find a parent that has a closest next sibling
    let current: Block | null = this;
    while (current?.parent) {
      const [parent, currentIdx]: any = current.getParentAndIdx();
      if (!parent || currentIdx === -1) {
        console.debug("no parent at getNextBlock");
        return null;
      }
      // if a closest next sibling exists
      if (currentIdx < parent.children.length - 1) {
        return parent.children[currentIdx + 1];
      }
      current = parent;
    }
    console.debug("no parent at getNextBlock");
    return null;
  }

  /**
   * Retrieve the previous block in a pre-order depth-first tree traversal.
   *
   * cf. Tree traversal - Wikipedia https://en.wikipedia.org/wiki/Tree_traversal
   */
  getPrevBlock() {
    const [parent, currentIdx] = this.getParentAndIdx();
    if (!parent) {
      return null;
    }
    if (currentIdx === 0) {
      return parent;
    }
    const closestPreviousSibling = parent.children[currentIdx - 1];
    return closestPreviousSibling.getLastDescendant();
  }

  /**
   * Returns the last descendant of the current block, including itself.
   */
  getLastDescendant(): Block {
    if (this.children.length === 0) {
      return this;
    }
    return this.getLastChild().getLastDescendant();
  }

  getLastChild() {
    return this.children[this.children.length - 1];
  }

  /**
   * Retrieve the parent block and the index of the current block in the parent's children array.
   */
  getParentAndIdx(): [Block | null, number] {
    if (!this?.parent?.children) {
      console.error("Block has no parent or parent has no children.");
      return [null, -1];
    }

    const idx = this.parent.children.findIndex((child) => child.id === this.id);
    return [this.parent, idx];
  }

  updateBlockById(id: string, updatedBlock: Block): Block {
    if (this.id === id) {
      return updatedBlock;
    }

    if (this.children) {
      return {
        ...this,
        children: this.children.map((child) =>
          child.updateBlockById(id, updatedBlock),
        ),
      };
    }

    return this;
  }

  /**
   * Retrieve its descendant block by its id.
   *
   * NOTE: This function has a time complexity: O(the number of descendant blocks).
   * This is acceptable because the number of descendant blocks is expected to be small (< 1000)
   */
  getBlockById(id: string): Block | null {
    if (this.id === id) {
      return this;
    }

    for (let child of this.children) {
      const found = child.getBlockById(id);
      if (found) {
        return found;
      }
    }

    return null;
  }

  toJson(): any {
    return {
      id: this.id,
      content: this.content,
      children:
        this.children?.length == 0
          ? undefined
          : this.children?.map((child) => child.toJson()),
    };
  }
}

function createBlock(obj: any): Block {
  const children = obj.children?.map(createBlock) || [];
  const block = new Block(obj.content, children).withParent(obj.parent);
  block.id = obj.id;
  return block;
}

export { createBlock };
