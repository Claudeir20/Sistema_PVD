import type { ButtonHTMLAttributes } from "react"

type ButtonVariant = "primary" | "secondary" | "danger"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[#2f5fcb] bg-[#2f5fcb] text-white hover:border-[#254eaa] hover:bg-[#254eaa]",
  secondary:
    "border-[#cfceca] bg-white text-[#292927] hover:border-[#a9a8a3] hover:bg-[#fafaf9]",
  danger:
    "border-[#cfceca] bg-white text-[#292927] hover:border-[#b42318] hover:text-[#b42318]",
}

export default function Button({
  variant = "secondary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5fcb] disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    />
  )
}
