import { CalendarDays, MapPin, Pencil, RefreshCw } from "lucide-react"

import type { Postcard } from "@/lib/api"
import { getPostcardMapUrl } from "@/lib/api"
import { getCountryCode, getCountryName } from "@/lib/countries"
import { formatPostcardDate } from "@/lib/date"

type PostcardBackProps = {
  postcard: Postcard
  orientation: "horizontal" | "vertical"
  onFlip: () => void
  onEdit: () => void
}

function PostcardBack({ postcard, orientation, onFlip, onEdit }: PostcardBackProps) {
  const countryName = getCountryName(postcard.country)
  const countryCode = getCountryCode(postcard.country)
  const location = [postcard.city, postcard.region, countryName].filter(Boolean).join(", ")

  return (
    <article className={`postcard-back postcard-back--${orientation}`}>
      <section className="postcard-back-copy">
        <p className="postcard-back-kicker">Recuerdo de viaje</p>
        <h2>{postcard.title}</h2>

        {postcard.description ? (
          <div className="postcard-back-notes">
            <span>Notas</span>
            <p>{postcard.description}</p>
          </div>
        ) : (
          <p className="postcard-back-empty-notes">Sin notas para esta postal.</p>
        )}
        <img
          className="postcard-location-image"
          src={getPostcardMapUrl(postcard.id)}
          alt={`Mapa de localización de ${postcard.title}`}
          loading="lazy"
        />
      </section>

      <div className="postcard-back-divider" aria-hidden="true" />

      <aside className="postcard-back-postmark">
        <div className="postcard-back-stamp">
          <div
            className={`postcard-back-flag fi fi-${countryCode.toLowerCase()}`}
            title={countryName}
            aria-label={countryName}
          />
        </div>
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
              {formatPostcardDate(postcard, true)}
            </dd>
          </div>
        </dl>
      </aside>

      <div className="postcard-back-actions">
        <button type="button" className="secondary-button" onClick={onFlip}>
          <RefreshCw size={16} />
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
