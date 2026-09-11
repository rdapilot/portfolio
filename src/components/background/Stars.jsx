import { STAR_COUNT } from '../../config/sceneConfig.js'

// Static DOM starfield rendered behind everything (z-index 0).
// Why DOM divs instead of WebGL points: these stars never move, so cheap
// absolutely-positioned divs avoid a draw call. Positions are baked once at
// module load (not in render) so re-renders can never reshuffle the sky —
// and the render stays pure.
const STARS = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.7 + 0.3,
}))

export default function Stars() {
  return (
    <div className="stars">
      {STARS.map((star, index) => (
        <div
          key={index}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}
