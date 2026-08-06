import type { ReactNode } from "react"

type FlipAnimationProps = {
  front: ReactNode
  back: ReactNode
  isFlipped: boolean
}

function FlipAnimation({ front, back, isFlipped }: FlipAnimationProps) {
  return (
    <div className="postcard-flip-stage">
      <div className={`postcard-flip-card${isFlipped ? " is-flipped" : ""}`}>
        <div className="postcard-flip-face postcard-flip-front">{front}</div>
        <div className="postcard-flip-face postcard-flip-back">{back}</div>
      </div>
    </div>
  )
}

export default FlipAnimation
