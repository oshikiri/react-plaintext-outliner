export default class Block {
  parent = null;
  id = crypto.randomUUID();

  constructor(content, children = []) {
    this.content = content;
    children.forEach((child) => child.withParent(this));
    this.children = children;
  }

  withParent(parent) {
    this.parent = parent;
    return this;
  }

  getNextBlock() {
    // case 1: current has children
    //   Return the first child
    if (this.children.length > 0) {
      return this.children[0];
    }

    // case 2: current has no children
    //   Go up the tree until we find a parent that has a next sibling
    let current = this;
    while (current?.parent) {
      const [parent, currentIdx] = current.getParentAndIdx();
      if (!parent || currentIdx === -1) {
        console.debug("no parent at getNextBlock");
        return null;
      }
      if (currentIdx < parent.children.length - 1) {
        return parent.children[currentIdx + 1];
      }
      current = parent;
    }
    console.debug("no parent at getNextBlock");
    return null;
  }

  getPrevBlock() {
    const [parent, idx] = this.getParentAndIdx();
    if (!parent) {
      return null;
    }
    if (idx === 0) {
      return parent;
    }
    return this.parent.children[idx - 1].getLastChild();
  }

  getFirstChild() {
    if (this.children.length === 0) {
      return this;
    }
    return this.children[0];
  }

  getLastChild() {
    if (this.children.length === 0) {
      return this;
    }
    return this.children[this.children.length - 1].getLastChild();
  }

  getParentAndIdx() {
    if (!this?.parent?.children) {
      console.error("Block has no parent or parent has no children.");
      return [null, -1];
    }

    const idx = this.parent.children.findIndex((child) => child.id === this.id);
    return [this.parent, idx];
  }

  updateBlockById(id, updatedBlock) {
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

  // NOTE: This function has a time complexity: O(the number of descendant blocks)
  // This is acceptable because the number of descendant blocks is expected to be small (< 1000)
  getBlockById(id) {
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

  toJson() {
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

function createBlock(obj) {
  const children = obj.children?.map(createBlock) || [];
  const block = new Block(obj.content, children).withParent(obj.parent);
  block.id = obj.id;
  return block;
}

export { createBlock };
