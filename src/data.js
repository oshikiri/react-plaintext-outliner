import Block from "./BlockEntity";

const initialPage = new Block("", [
  new Block("This is a playground for react-plaintext-outliner"),
  new Block(""),
  new Block(
    "react-plaintext-outliner is a study of logseq-like outliner editors",
    [new Block("This project aims to learn React, Zustand, and Tailwind CSS")],
  ),
  new Block("Features", [
    new Block("Create, edit, and delete blocks"),
    new Block("State management", [
      new Block(
        "You can update the nested items and see the current state in the right pane",
      ),
    ]),
    new Block("logseq-like keybinds", [
      new Block("tab: increase level"),
      new Block("shift+tab: decrease level"),
      new Block("enter: add new block after the current block", [
        new Block(
          "Add a new sibling block if the current block has no children, or add a new child block if it does",
        ),
        new Block("The cursor will move to the new block"),
      ]),
      new Block("shift+enter: TODO"),
      new Block("arrow up: move to the previous block"),
      new Block("arrow down: move to the next block"),
      new Block("ctrl+k: clear the localStorage"),
    ]),
  ]),
]);

export { initialPage };
