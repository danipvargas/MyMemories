import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Camera, ImagePlus, Images } from "lucide-react"

import CropDialog from "@/components/add-postcard/CropDialog"

type CropStep = "original" | "cover" | null

export type ImageReplacement = {
  image: File
  cover: File
}

type PostcardImageReplacementProps = {
  onChange: (replacement: ImageReplacement | null) => void
}

function PostcardImageReplacement({
  onChange,
}: PostcardImageReplacementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const objectUrls = useRef<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [cropStep, setCropStep] = useState<CropStep>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urls = objectUrls.current

    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const registerObjectUrl = (file: File) => {
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    return url
  }

  const reset = () => {
    setImageFile(null)
    setCoverFile(null)
    setImagePreview(null)
    setCoverPreview(null)
    setCropSource(null)
    setCropStep(null)
    setError(null)
    onChange(null)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError("El formato de la imagen no está permitido. Usa JPG, JPEG o PNG.")
      return
    }

    setError(null)
    setImageFile(null)
    setCoverFile(null)
    setImagePreview(null)
    setCoverPreview(null)
    setCropSource(registerObjectUrl(file))
    setCropStep("original")
    onChange(null)
  }

  const handleOriginalComplete = (file: File) => {
    const preview = registerObjectUrl(file)
    setImageFile(file)
    setImagePreview(preview)
    setCropSource(preview)
    setCropStep("cover")
  }

  const handleCoverComplete = (file: File) => {
    setCoverFile(file)
    setCoverPreview(registerObjectUrl(file))
    setCropSource(null)
    setCropStep(null)
    onChange(imageFile ? { image: imageFile, cover: file } : null)
  }

  return (
    <section className="image-replacement-section">
      <div className="detail-edit-subheading">
        <div>
          <p className="eyebrow">Imágenes</p>
          <h3>Reemplazar imagen</h3>
        </div>
        <span>Opcional</span>
      </div>

      {imagePreview && coverPreview ? (
        <div className="replacement-previews">
          <img src={imagePreview} alt="Nueva imagen original" />
          <img src={coverPreview} alt="Nueva portada" />
        </div>
      ) : (
        <div className="replacement-trigger">
          <ImagePlus size={20} />
          <span>Elegir una nueva imagen</span>
          <div className="upload-choice-row">
            <button
              type="button"
              className="upload-choice"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={16} />
              Cámara
            </button>
            <button
              type="button"
              className="upload-choice"
              onClick={() => fileInputRef.current?.click()}
            >
              <Images size={16} />
              Galería
            </button>
          </div>
        </div>
      )}

      {imagePreview && coverPreview && (
        <div className="image-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={16} />
            Hacer foto
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Images size={16} />
            Galería
          </button>
        </div>
      )}

      {error && <p className="field-error">{error}</p>}

      <input
        ref={cameraInputRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />

      {cropSource && cropStep && (
        <CropDialog
          key={`${cropStep}-${cropSource}`}
          imageUrl={cropSource}
          title={cropStep === "original" ? "Recorta tu imagen" : "Recorta la portada"}
          description={
            cropStep === "original"
              ? "Ajusta la nueva imagen original."
              : "Elige el nuevo encuadre 3:2 para el álbum."
          }
          aspect={cropStep === "cover" ? 3 / 2 : undefined}
          allowRotation={cropStep === "original"}
          onCancel={() => {
            setCropSource(null)
            setCropStep(null)
          }}
          onComplete={
            cropStep === "original"
              ? handleOriginalComplete
              : handleCoverComplete
          }
          onError={() => setError("No se ha podido preparar la imagen.")}
        />
      )}

      {(imageFile || coverFile) && !(imageFile && coverFile) && (
        <button type="button" className="text-button" onClick={reset}>
          Cancelar reemplazo
        </button>
      )}
    </section>
  )
}

export default PostcardImageReplacement
