import { useState } from "react"

import type { Postcard as PostcardData } from "@/lib/api"

import FlipAnimation from "@/components/album/FlipAnimation"
import PostcardBack from "@/components/album/PostcardBack"
import PostcardFront from "@/components/album/PostcardFront"

type PostcardProps = {
  postcard: PostcardData
  onDelete: () => void
  isDeleting: boolean
  onEdit: () => void
}

function Postcard({ postcard, onDelete, isDeleting, onEdit }: PostcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal")

  return (
    <FlipAnimation
      isFlipped={isFlipped}
      front={
        <PostcardFront
          postcard={postcard}
          onFlip={() => setIsFlipped(true)}
          onDelete={onDelete}
          isDeleting={isDeleting}
          onImageLoad={(width, height) => {
            setOrientation(height > width ? "vertical" : "horizontal")
          }}
        />
      }
      back={
        <PostcardBack
          postcard={postcard}
          orientation={orientation}
          onFlip={() => setIsFlipped(false)}
          onEdit={onEdit}
        />
      }
    />
  )
}

export default Postcard
