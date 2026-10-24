/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Nome da loja (menus e título da aba). Definido no build de cada instalação. */
  readonly VITE_STORE_NAME?: string
  /** Opcionais, mostrados no comprovante impresso. */
  readonly VITE_STORE_CNPJ?: string
  readonly VITE_STORE_ADDRESS?: string
  /** Largura da bobina da impressora térmica: "80mm" (padrão) ou "58mm". */
  readonly VITE_RECEIPT_WIDTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
