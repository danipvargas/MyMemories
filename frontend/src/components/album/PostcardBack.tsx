import { ArrowLeft, CalendarDays, MapPin, Pencil } from "lucide-react"

import type { Postcard } from "@/lib/api"
import PostcardLocationMap from "@/components/album/PostcardLocationMap"
import { getCountryName } from "@/lib/countries"
import { formatPostcardDate } from "@/lib/date"

type PostcardBackProps = {
  postcard: Postcard
  orientation: "horizontal" | "vertical"
  onFlip: () => void
  onEdit: () => void
}

function PostcardBack({ postcard, orientation, onFlip, onEdit }: PostcardBackProps) {
  const countryName = getCountryName(postcard.country)
  const location = [postcard.city, postcard.region, countryName].filter(Boolean).join(", ")

  return (
    <article className={`postcard-back postcard-back--${orientation}`}>
      <section className="postcard-back-copy">
        <p className="postcard-back-kicker">Recuerdo de viaje</p>
        <h2>{postcard.title}</h2>

        <dl className="postcard-back-meta">
          <div>
            <dt>País</dt>
            <dd>{countryName}</dd>
          </div>
          <div>
            <dt>Lugar</dt>
            <dd>
              <MapPin size={14} aria-hidden="true" />
              {location || "No indicado"}
            </dd>
          </div>
          <div>
            <dt>Fecha de visita</dt>
            <dd>
              <CalendarDays size={14} aria-hidden="true" />
              {formatPostcardDate(postcard)}
            </dd>
          </div>
        </dl>

        {postcard.description ? (
          <div className="postcard-back-notes">
            <span>Notas</span>
            <p>{postcard.description}</p>
          </div>
        ) : (
          <p className="postcard-back-empty-notes">Sin notas para esta postal.</p>
        )}

      </section>

      <div className="postcard-back-divider" aria-hidden="true" />

      <aside className="postcard-back-postmark">
        <div className="postcard-back-stamp">
          <div
            className={`postcard-back-flag fi fi-${postcard.country.toLowerCase()}`}
            title={countryName}
            aria-label={countryName}
          />
        </div>
        <PostcardLocationMap coordinates={postcard.coordinates} />
      </aside>

      <div className="postcard-back-actions">
        <button type="button" className="secondary-button" onClick={onFlip}>
          <ArrowLeft size={16} />
          Dar la vuelta
        </button>
        <button type="button" className="primary-button" onClick={onEdit}>
          <Pencil size={16} />
          Editar postal
        </button>
      </div>
    </article>
  )
}

export default PostcardBack
