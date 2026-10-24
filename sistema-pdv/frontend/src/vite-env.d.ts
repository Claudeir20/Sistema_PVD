/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Nome da loja (menus e título da aba). Definido no build de cada instalação. */
  readonly VITE_STORE_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
