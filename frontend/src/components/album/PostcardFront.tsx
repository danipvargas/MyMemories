import { RefreshCw, Trash2 } from "lucide-react"

import { getPostcardImageUrl, type Postcard } from "@/lib/api"

type PostcardFrontProps = {
  postcard: Postcard
  onFlip: () => void
  onDelete: () => void
  isDeleting: boolean
  onImageLoad: (width: number, height: number) => void
}

function PostcardFront({
  postcard,
  onFlip,
  onDelete,
  isDeleting,
  onImageLoad,
}: PostcardFrontProps) {
  return (
    <article className="postcard-front">
      <img
        className="postcard-front-image"
        src={getPostcardImageUrl(postcard.id)}
        alt={`Imagen completa de ${postcard.title}`}
        onLoad={(event) => {
          const image = event.currentTarget
          onImageLoad(image.naturalWidth, image.naturalHeight)
        }}
      />
      <div className="postcard-front-footer">
        <h2>{postcard.title}</h2>
        <div className="postcard-front-actions">
          <button
            type="button"
            className="postcard-action-button postcard-delete-action"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
          <button
            type="button"
            className="postcard-action-button postcard-flip-action"
            onClick={onFlip}
            aria-label="Dar la vuelta a la postal"
          >
            <RefreshCw size={16} />
            Dar la vuelta
          </button>
        </div>
      </div>
    </article>
  )
}

export default PostcardFront
