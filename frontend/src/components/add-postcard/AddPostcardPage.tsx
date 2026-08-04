import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useMutation } from "@tanstack/react-query"
import { ImagePlus, MapPin, Save, Sparkles } from "lucide-react"

import {
  createPostcard,
  getApiErrorMessage,
  type CreatePostcardPayload,
} from "@/lib/api"
import { getDatePayload, type DateParts } from "@/lib/date"
import CropDialog from "@/components/add-postcard/CropDialog"
import CountryCombobox from "@/components/add-postcard/CountryCombobox"
import DatePrecisionFields from "@/components/add-postcard/DatePrecisionFields"
import LocationPicker from "@/components/add-postcard/LocationPicker"

type CropStep = "original" | "cover" | null

const EMPTY_DATE: DateParts = { year: "", month: "", day: "" }

function AddPostcardPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrls = useRef<string[]>([])
  const [title, setTitle] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [description, setDescription] = useState("")
  const [countryResetKey, setCountryResetKey] = useState(0)
  const [dateParts, setDateParts] = useState<DateParts>(EMPTY_DATE)
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [cropStep, setCropStep] = useState<CropStep>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const urls = objectUrls.current

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const mutation = useMutation({
    mutationFn: (payload: CreatePostcardPayload) => createPostcard(payload),
    onSuccess: () => {
      setTitle("")
      setCountry("")
      setCountryResetKey((current) => current + 1)
      setCity("")
      setRegion("")
      setDescription("")
      setDateParts(EMPTY_DATE)
      setCoordinates(null)
      clearImages()
      setSuccessMessage("La postal se ha guardado en tu colección.")
      setFormError(null)
    },
  })

  function registerObjectUrl(file: File): string {
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    return url
  }

  function clearImages() {
    setOriginalFile(null)
    setCoverFile(null)
    setOriginalPreview(null)
    setCoverPreview(null)
    setCropSource(null)
    setCropStep(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    setSuccessMessage(null)

    if (!file) {
      return
    }

    if (![
      "image/jpeg",
      "image/png",
    ].includes(file.type)) {
      setFormError("El formato de la imagen no está permitido. Usa JPG, JPEG o PNG.")
      return
    }

    clearImages()
    setFormError(null)
    setCropSource(registerObjectUrl(file))
    setCropStep("original")
  }

  function handleOriginalComplete(file: File) {
    const preview = registerObjectUrl(file)
    setOriginalFile(file)
    setOriginalPreview(preview)
    setCropSource(preview)
    setCropStep("cover")
    setFormError(null)
  }

  function handleCoverComplete(file: File) {
    setCoverFile(file)
    setCoverPreview(registerObjectUrl(file))
    setCropSource(null)
    setCropStep(null)
    setFormError(null)
  }

  function handleCropCancel() {
    setCropSource(null)
    setCropStep(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccessMessage(null)
    setFormError(null)

    if (!originalFile || !coverFile) {
      setFormError("Añade una imagen y prepara su portada antes de guardar.")
      return
    }
    if (!coordinates) {
      setFormError("Selecciona la ubicación de la postal en el mapa.")
      return
    }

    const datePayload = getDatePayload(dateParts)

    mutation.mutate({
      title: title.trim(),
      country,
      city: city.trim() || undefined,
      region: region.trim() || undefined,
      description: description.trim() || undefined,
      latitude: coordinates[0],
      longitude: coordinates[1],
      image: originalFile,
      cover: coverFile,
      acquisitionDate: datePayload.date,
      datePrecision: datePayload.precision,
    })
  }

  const canSubmit = Boolean(
    title.trim() && country && originalFile && coverFile && coordinates,
  )

  return (
    <>
      <section className="add-intro">
        <p className="eyebrow">Nueva entrada</p>
        <p className="intro-copy">
          Conserva el lugar y la historia detrás de cada postal.
        </p>
      </section>

      <form className="postcard-form" onSubmit={handleSubmit}>
        <section className="image-upload-card" aria-labelledby="image-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 · Imagen</p>
              <h2 id="image-title">La postal</h2>
            </div>
            <Sparkles size={19} aria-hidden="true" />
          </div>

          {originalPreview && coverPreview ? (
            <div className="image-previews">
              <div className="preview-main">
                <img src={originalPreview} alt="Vista previa de la postal" />
                <span>Imagen original preparada</span>
              </div>
              <div className="preview-cover">
                <img src={coverPreview} alt="Vista previa de la portada" />
                <span>Portada 3:2</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="upload-trigger"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="upload-icon">
                <ImagePlus size={28} strokeWidth={1.7} />
              </span>
              <strong>Añade una imagen</strong>
              <span>Desde tu galería o cámara</span>
              <small>JPG, JPEG o PNG</small>
            </button>
          )}

          {originalPreview && !coverPreview && (
            <div className="image-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setCropSource(originalPreview)
                  setCropStep("cover")
                }}
              >
                Preparar portada 3:2
              </button>
            </div>
          )}

          {originalPreview && coverPreview && (
            <div className="image-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar imagen
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
          />
        </section>

        <section
          className="form-section details-section"
          aria-labelledby="details-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 · Detalles</p>
              <h2 id="details-title">Cuéntame sobre ella</h2>
            </div>
          </div>

          <label className="form-field">
            <span>Título <b>*</b></span>
            <input
              type="text"
              value={title}
              maxLength={60}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Por ejemplo, Atardecer en Ribadeo"
              required
            />
          </label>

          <DatePrecisionFields value={dateParts} onChange={setDateParts} />

          <label className="form-field">
            <span>País <b>*</b></span>
            <CountryCombobox
              key={countryResetKey}
              value={country}
              onChange={setCountry}
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Ciudad</span>
              <input
                type="text"
                value={city}
                maxLength={50}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ribadeo"
              />
            </label>
            <label className="form-field">
              <span>Región</span>
              <input
                type="text"
                value={region}
                maxLength={50}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="Galicia"
              />
            </label>
          </div>

          <label className="form-field">
            <span>Descripción</span>
            <textarea
              value={description}
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Un recuerdo, una historia o cualquier detalle que quieras conservar..."
              rows={4}
            />
          </label>
        </section>

        <section className="form-section location-section" aria-labelledby="location-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 · Lugar</p>
              <h2 id="location-title">¿Dónde la encontraste?</h2>
            </div>
            <MapPin size={19} aria-hidden="true" />
          </div>
          <LocationPicker value={coordinates} onChange={setCoordinates} />
        </section>

        {(formError || mutation.isError) && (
          <div className="feedback feedback-error" role="alert">
            {formError ?? getApiErrorMessage(mutation.error)}
          </div>
        )}
        {successMessage && (
          <div className="feedback feedback-success" role="status">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          className="primary-button save-button"
          disabled={!canSubmit || mutation.isPending}
        >
          <Save size={18} />
          {mutation.isPending ? "Guardando postal..." : "Guardar postal"}
        </button>
      </form>

      {cropSource && cropStep && (
        <CropDialog
          key={`${cropStep}-${cropSource}`}
          imageUrl={cropSource}
          title={
            cropStep === "original"
              ? "Recorta tu imagen"
              : "Recorta la portada"
          }
          description={
            cropStep === "original"
              ? "Ajusta y gira la imagen que conservarás en tu colección."
              : "Elige el encuadre de la portada que aparecerá en el álbum."
          }
          aspect={cropStep === "cover" ? 3 / 2 : undefined}
          allowRotation={cropStep === "original"}
          onCancel={handleCropCancel}
          onComplete={
            cropStep === "original"
              ? handleOriginalComplete
              : handleCoverComplete
          }
          onError={() =>
            setFormError("No se ha podido preparar la imagen. Inténtalo de nuevo.")
          }
        />
      )}
    </>
  )
}

export default AddPostcardPage
