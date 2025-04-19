import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import Root from "./Root";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
