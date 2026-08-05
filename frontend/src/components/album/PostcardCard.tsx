import { CalendarDays, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  getPostcardCoverUrl,
  type Postcard,
} from "@/lib/api"
import { getCountryName, getCountryTint } from "@/lib/countries"
import { formatPostcardDate } from "@/lib/date"

function PostcardCard({ postcard }: { postcard: Postcard }) {
  const navigate = useNavigate()
  const tint = getCountryTint(postcard.country)
  const countryName = getCountryName(postcard.country)
  const location = [postcard.city, postcard.region, countryName]
    .filter(Boolean)
    .join(", ")

  return (
    <button
      type="button"
      className="postcard-card"
      onClick={() => navigate(`/postcards/${postcard.id}`)}
      aria-label={`Abrir detalles de ${postcard.title}`}
      style={{
        "--country-tint": tint.background,
        "--country-border": tint.border,
      } as React.CSSProperties}
    >
      <div className="postcard-card-media">
        <img
          src={getPostcardCoverUrl(postcard.id)}
          alt={`Portada de ${postcard.title}`}
          loading="lazy"
        />
        <span
          className={`fi fi-${postcard.country.toLowerCase()}`}
          title={countryName}
          aria-label={countryName}
        />
      </div>
      <div className="postcard-card-content">
        <h2>{postcard.title}</h2>
        <p>
          <MapPin size={14} aria-hidden="true" />
          {location || "Ubicación no indicada"}
        </p>
        <p>
          <CalendarDays size={14} aria-hidden="true" />
          {formatPostcardDate(postcard)}
        </p>
      </div>
    </button>
  )
}

export default PostcardCard
