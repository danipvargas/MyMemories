import { useNavigate } from "react-router-dom"

import {
  getPostcardCoverUrl,
  type Postcard,
} from "@/lib/api"
import { getCountryName } from "@/lib/countries"
import { formatPostcardDate } from "@/lib/date"

function PostcardCard({ postcard }: { postcard: Postcard }) {
  const navigate = useNavigate()
  const countryName = getCountryName(postcard.country)
  const rotation = 0

  return (
    <article
      className="postcard-card-wrap"
      style={{
        "--card-rotation": `${rotation}deg`,
      } as React.CSSProperties}
    >
      <button
        type="button"
        className="postcard-card"
        onClick={() => navigate(`/postcards/${postcard.id}`)}
        aria-label={`Abrir detalles de ${postcard.title}`}
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
          <span className="postcard-mobile-date">
            {formatPostcardDate(postcard, true)}
          </span>
        </div>
      </button>
      <div className="postcard-hover-info" aria-hidden="true">
        <strong>{postcard.title}</strong>
        <span>{formatPostcardDate(postcard, true)}</span>
      </div>
    </article>
  )
}

export default PostcardCard
