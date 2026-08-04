import { useRef, useState } from "react"
import { Check, RotateCcw, RotateCw, X } from "lucide-react"
import {
  Cropper,
  type CropperRef,
} from "react-advanced-cropper"

import { createCroppedImage } from "@/lib/image"

type CropDialogProps = {
  imageUrl: string
  title: string
  description: string
  aspect?: number
  onCancel: () => void
  onComplete: (file: File) => void
  onError: () => void
}

function CropDialog({
  imageUrl,
  title,
  description,
  aspect,
  onCancel,
  onComplete,
  onError,
}: CropDialogProps) {
  const cropperRef = useRef<CropperRef>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleComplete = async () => {
    if (!cropperRef.current) {
      return
    }

    setIsProcessing(true)

    try {
      const file = await createCroppedImage(
        cropperRef.current,
        title.includes("portada") ? "cover.jpg" : "postcard.jpg",
      )
      onComplete(file)
    } catch {
      onError()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="crop-dialog-backdrop" role="presentation">
      <section
        className="crop-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-dialog-title"
      >
        <header className="crop-dialog-header">
          <div>
            <p className="eyebrow">Preparar imagen</p>
            <h2 id="crop-dialog-title">{title}</h2>
            <p>{description}</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            aria-label="Cancelar edición de imagen"
          >
            <X size={20} />
          </button>
        </header>

        <div className="crop-stage">
          <Cropper
            ref={cropperRef}
            src={imageUrl}
            className="advanced-cropper"
            stencilProps={aspect ? { aspectRatio: aspect } : undefined}
            backgroundWrapperProps={{ rotateImage: { touch: true } }}
            onChange={() => undefined}
          />
        </div>

        <div className="crop-controls">
          <p className="crop-touch-hint">
            Arrastra la imagen, pellizca para ampliar y usa las esquinas para
            ajustar el encuadre.
          </p>
          <div className="rotation-controls">
            <button
              type="button"
              className="secondary-button"
              onClick={() => cropperRef.current?.rotateImage(-90)}
            >
              <RotateCcw size={16} />
              Girar izquierda
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => cropperRef.current?.rotateImage(90)}
            >
              <RotateCw size={16} />
              Girar derecha
            </button>
          </div>
        </div>

        <footer className="crop-dialog-footer">
          <button type="button" className="text-button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => void handleComplete()}
            disabled={isProcessing}
          >
            <Check size={17} />
            {isProcessing ? "Preparando..." : "Continuar"}
          </button>
        </footer>
      </section>
    </div>
  )
}

export default CropDialog
