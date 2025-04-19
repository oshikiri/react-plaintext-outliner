import BlockComponent from "./BlockComponent";
import { useStore, setToLocalStorage, clearLocalStorage } from "./state";

export default function Root() {
  const rootBlock = useStore((state) => state.rootBlock);
  setToLocalStorage(rootBlock);

  return (
    <div
      className="flex justify-center h-full
        portrait:flex-col portrait:w-full
        landscape:flex-row"
    >
      <Pane key="editor">
        {rootBlock.children.map((block, i) => (
          <BlockComponent key={`${block.id}/${i}`} block={block} />
        ))}
      </Pane>
      <Pane key="json">
        <pre className="text-xs">
          {JSON.stringify(rootBlock.toJson(), null, 2)}
        </pre>
      </Pane>
    </div>
  );
}

function Pane({ children }) {
  return (
    <div
      className="border border-gray-300
        rounded p-10 overflow-auto
        portrait:h-1/2 portrait:w-full
        landscape:w-1/2"
    >
      {children}
    </div>
  );
}

window.onkeydown = (event) => {
  if (event.key === "k" && event.ctrlKey) {
    clearLocalStorage();
    event.preventDefault();
  }
};
