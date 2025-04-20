import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// For React 18 and newer
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// For older React versions (prior to 18)
// ReactDOM.render(<App />, document.getElementById("root"));
