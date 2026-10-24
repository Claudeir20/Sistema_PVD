import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { storeName } from "./config/store"
import "./index.css"

// Título da aba: o nome da loja de cada instalação (VITE_STORE_NAME).
document.title = `${storeName} · PDV`

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
