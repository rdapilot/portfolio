import { useEffect } from 'react'
import { X } from '../../icons/index.js'
import { CARD_COUNT, CARD_DETAILS, CARD_TEXTURE_URLS, PLANET_ACCENTS } from '../../config/sceneConfig.js'

// Fullscreen modal shown when a hotspot bubble (or spotlight caption) selects
// a card. Arrow keys / arrows cycle, Escape or backdrop click closes.
// The accent theme is derived from the planet that owns the card (3 per
// planet) so the modal always matches its 3D origin.
export default function CardFocus({ index, onClose, onNavigate }) {
  const planetIndex = Math.floor(index / 3) % PLANET_ACCENTS.length
  const detail = CARD_DETAILS[index % CARD_DETAILS.length]
  const theme = PLANET_ACCENTS[planetIndex]

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNavigate(1)
      if (event.key === 'ArrowLeft') onNavigate(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, onNavigate])

  return (
    <div className="focus-overlay" onClick={onClose}>
      <div
        className="focus-modal"
        style={{ '--fm-accent': theme.accent, '--fm-deep': theme.deep, '--fm-ink': theme.ink }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="focus-close" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
        <button className="focus-arrow left" onClick={() => onNavigate(-1)} aria-label="Previous card">
          ‹
        </button>
        <div className="focus-body" key={index}>
          <img src={CARD_TEXTURE_URLS[index % CARD_COUNT]} alt={detail.title} draggable={false} />
          <div className="focus-text">
            <span className="focus-tag">{detail.tag}</span>
            <strong className="focus-title">{detail.title}</strong>
            <p className="focus-blurb">{detail.blurb}</p>
            <span className="focus-count">
              {index + 1} / {CARD_COUNT}
            </span>
          </div>
        </div>
        <button className="focus-arrow right" onClick={() => onNavigate(1)} aria-label="Next card">
          ›
        </button>
      </div>
    </div>
  )
}
