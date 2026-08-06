import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Save, X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import CountryCombobox from "@/components/add-postcard/CountryCombobox"
import DatePrecisionFields from "@/components/add-postcard/DatePrecisionFields"
import LocationPicker from "@/components/add-postcard/LocationPicker"
import PostcardImageReplacement, {
  type ImageReplacement,
} from "@/components/add-postcard/PostcardImageReplacement"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import Postcard from "@/components/album/Postcard"
import {
  deletePostcard,
  getApiErrorMessage,
  getPostcard,
  isDateValidationError,
  updatePostcard,
  type Postcard as PostcardData,
} from "@/lib/api"
import { getDateParts, getDatePayload, type DateParts } from "@/lib/date"

type PostcardEditFormProps = {
  postcard: PostcardData
  onCancel: () => void
  onSaved: (postcard: PostcardData) => void
}

function PostcardEditForm({
  postcard,
  onCancel,
  onSaved,
}: PostcardEditFormProps) {
  const [title, setTitle] = useState(postcard.title)
  const [country, setCountry] = useState(postcard.country)
  const [city, setCity] = useState(postcard.city ?? "")
  const [region, setRegion] = useState(postcard.region ?? "")
  const [description, setDescription] = useState(postcard.description ?? "")
  const [dateParts, setDateParts] = useState<DateParts>(() => getDateParts(postcard))
  const [coordinates, setCoordinates] = useState<[number, number]>(postcard.coordinates)
  const [imageReplacement, setImageReplacement] = useState<ImageReplacement | null>(null)
  const [dateError, setDateError] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      const datePayload = getDatePayload(dateParts)

      return updatePostcard(postcard.id, {
        title: title.trim(),
        country,
        city: city.trim(),
        region: region.trim(),
        description: description.trim(),
        latitude: coordinates[0],
        longitude: coordinates[1],
        acquisitionDate: datePayload.date,
        datePrecision: datePayload.precision,
        image: imageReplacement?.image,
        cover: imageReplacement?.cover,
      })
    },
    onSuccess: onSaved,
    onError: (error) => setDateError(isDateValidationError(error)),
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!title.trim() || !country) {
      setFormError("El título y el país son obligatorios.")
      return
    }

    mutation.mutate()
  }

  return (
    <form className="detail-edit-form" onSubmit={handleSubmit}>
      <div className="detail-edit-heading">
        <div>
          <p className="eyebrow">Editar postal</p>
          <h2>Actualiza sus datos</h2>
        </div>
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancelar edición">
          <X size={19} />
        </button>
      </div>

      <label className="form-field">
        <span>Título <b>*</b></span>
        <input
          type="text"
          value={title}
          maxLength={60}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>

      <DatePrecisionFields
        value={dateParts}
        onChange={(value) => {
          setDateParts(value)
          setDateError(false)
        }}
        invalid={dateError}
      />

      <label className="form-field">
        <span>País <b>*</b></span>
        <CountryCombobox value={country} onChange={setCountry} />
      </label>

      <div className="form-row">
        <label className="form-field">
          <span>Ciudad</span>
          <input
            type="text"
            value={city}
            maxLength={50}
            onChange={(event) => setCity(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Región</span>
          <input
            type="text"
            value={region}
            maxLength={50}
            onChange={(event) => setRegion(event.target.value)}
          />
        </label>
      </div>

      <label className="form-field">
        <span>Descripción</span>
        <textarea
          value={description}
          maxLength={1000}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
        />
      </label>

      <LocationPicker value={coordinates} onChange={setCoordinates} />

      <PostcardImageReplacement onChange={setImageReplacement} />

      {(formError || mutation.isError) && (
        <div className="feedback feedback-error" role="alert">
          {formError ?? getApiErrorMessage(mutation.error)}
        </div>
      )}

      <div className="detail-edit-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={mutation.isPending}>
          <Save size={17} />
          {mutation.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}

function PostcardDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { postcardId } = useParams()
  const numericId = Number(postcardId)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const query = useQuery({
    queryKey: ["postcard", numericId],
    queryFn: () => getPostcard(numericId),
    enabled: Number.isInteger(numericId) && numericId > 0,
  })
  const deleteMutation = useMutation({
    mutationFn: () => deletePostcard(numericId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["postcards"] })
      navigate("/album")
    },
  })

  const handleDelete = () => {
    if (query.data && !deleteMutation.isPending) {
      setDeleteConfirmationOpen(true)
    }
  }

  if (query.isPending) {
    return <div className="detail-feedback" role="status">Cargando la postal...</div>
  }

  if (query.isError || !query.data) {
    return (
      <div className="detail-feedback feedback-error" role="alert">
        {getApiErrorMessage(query.error)}
        <button type="button" className="secondary-button" onClick={() => navigate("/album")}>
          Volver al álbum
        </button>
      </div>
    )
  }

  const postcard = query.data

  return (
    <section className="postcard-detail">
      <button type="button" className="back-button" onClick={() => navigate("/album")}>
        <ArrowLeft size={18} />
        Volver al álbum
      </button>

      {isEditing ? (
        <PostcardEditForm
          key={postcard.id}
          postcard={postcard}
          onCancel={() => setIsEditing(false)}
          onSaved={(updatedPostcard) => {
            queryClient.setQueryData(["postcard", numericId], updatedPostcard)
            void queryClient.invalidateQueries({ queryKey: ["postcards"] })
            setIsEditing(false)
          }}
        />
      ) : (
        <Postcard
          postcard={postcard}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {deleteMutation.isError && (
        <div className="feedback feedback-error" role="alert">
          {getApiErrorMessage(deleteMutation.error)}
        </div>
      )}

      {deleteConfirmationOpen && (
        <ConfirmDialog
          title="Eliminar postal"
          message={`¿Quieres eliminar «${postcard.title}»? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar postal"
          isPending={deleteMutation.isPending}
          onCancel={() => setDeleteConfirmationOpen(false)}
          onConfirm={() => {
            deleteMutation.mutate()
            setDeleteConfirmationOpen(false)
          }}
        />
      )}
    </section>
  )
}

export default PostcardDetailPage
