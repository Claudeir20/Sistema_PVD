import { useEffect, useRef, useState } from "react"
import Button from "../../../components/ui/Button"

export default function PhotoPreview() {
  const inputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo))
    }
  }, [])

  return (
    <div className="no-print mt-4">
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div
            className="relative size-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            key={photo}
          >
            <img
              alt={`Foto local ${index + 1} da entrada do aparelho`}
              className="size-full object-cover"
              src={photo}
            />
          </div>
        ))}
        <Button
          className="size-24 border-dashed px-2 text-xs"
          onClick={() => inputRef.current?.click()}
        >
          Adicionar foto
        </Button>
      </div>
      <input
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          setPhotos((current) => [
            ...current,
            ...files.map((file) => URL.createObjectURL(file)),
          ])
          event.target.value = ""
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  )
}
