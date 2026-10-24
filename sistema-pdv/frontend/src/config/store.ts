/**
 * Nome da loja mostrado nos menus e no título da aba. Vem da variável VITE_STORE_NAME
 * na hora do build (cada instalação define o seu); sem ela, "Minha Loja".
 */
export const storeName = import.meta.env.VITE_STORE_NAME?.trim() || "Minha Loja"

/** "Minha Loja" → "ML"; "Celulares do João" → "CJ" (ignora "do", "da", "de"...). */
export function storeInitials(name: string) {
  const words = name
    .split(/\s+/)
    .filter((word) => word && !/^(d[aeo]s?|e)$/i.test(word))
  const letters =
    words.length > 1
      ? words[0][0] + words[words.length - 1][0]
      : words[0]?.slice(0, 2)
  return (letters ?? "").toUpperCase()
}
