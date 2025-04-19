function indent(block) {
  const [parent, currentIdx] = block.getParentAndIdx();
  if (!parent || currentIdx === -1) {
    console.log("Block has no parent:", block);
    return parent;
  }

  if (currentIdx === 0) {
    console.log("Cannot indent block that is the first child of its parent.");
    return parent;
  }

  const siblingsBefore = parent.children.slice(0, currentIdx);
  const prevSibling = siblingsBefore[siblingsBefore.length - 1];
  if (!prevSibling) {
    console.log("No previous sibling to indent to.");
    return parent;
  }
  block.parent = prevSibling;
  prevSibling.children.push(block);

  const siblingsAfter = parent.children.slice(currentIdx + 1);
  parent.children = [...siblingsBefore, ...siblingsAfter];

  return parent;
}

function outdent(block) {
  const [parent, currentIdx] = block.getParentAndIdx();
  if (!parent || currentIdx === -1) {
    console.log("Block has no parent:", block);
    return { parent, grandParent: null };
  }
  if (!parent.parent) {
    console.log("Cannot outdent block that is a child of the root.");
    return { parent, grandParent: null };
  }

  const [grandParent, parentIdx] = parent.getParentAndIdx();
  if (!grandParent || parentIdx === -1) {
    console.log("Parent has no parent:", parent);
    return { parent, grandParent };
  }

  const siblingsBefore = parent.children.slice(0, currentIdx);
  const siblingsAfter = parent.children.slice(currentIdx + 1);

  parent.children = siblingsBefore;
  block.parent = grandParent;
  block.children = [...block.children, ...siblingsAfter];
  block.children.forEach((b) => {
    b.parent = block;
  });

  grandParent.children[parentIdx] = parent;
  grandParent.children.splice(parentIdx + 1, 0, block);

  return { parent, grandParent };
}

export { indent, outdent };
