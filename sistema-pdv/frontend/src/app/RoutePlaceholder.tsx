interface RoutePlaceholderProps {
  title: string
}

export default function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white p-6">
      <h1 className="text-xl font-semibold text-neutral-800">{title}</h1>
    </main>
  )
}
