import "./styles/global.css"; // Правильный путь к стилям
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ContextProvider from "./context/ContextProvider";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
);