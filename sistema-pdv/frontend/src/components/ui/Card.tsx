import type { HTMLAttributes, PropsWithChildren } from "react"

export default function Card({
  children,
  className = "",
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section
      className={`rounded-xl border border-[#d8d7d2] bg-white ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
