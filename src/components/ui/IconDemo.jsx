import { useState } from 'react'
import useMagneticPull from '../../hooks/useMagneticPull.js'
import { Star, Rocket, Globe, Home, Menu, X } from '../../icons/index.js'

// Small popover showcasing the SVG icon set. Collapsed by default so it never
// competes with the navbar title; toggles open for a quick visual inventory.
// The toggle button shares the liquid-glass material + magnetic pull of the
// dock, so the navbar and dock feel like one family.
export default function IconDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const magneticRef = useMagneticPull(5)

  return (
    <div className="icon-demo">
      <button
        ref={magneticRef}
        className="icon-demo-toggle button-icon liquid-glass"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Hide icon demo' : 'Show icon demo'}
      >
        <span className="liquid-inner">{isOpen ? <X /> : <Menu />}</span>
      </button>
      {isOpen && (
        <div className="icon-demo-panel">
          <h3>Icon Examples</h3>
          <div className="icon-grid">
            <div className="icon-item">
              <Star className="icon-primary" />
              <small>Star</small>
            </div>
            <div className="icon-item">
              <Rocket className="icon-accent" />
              <small>Rocket</small>
            </div>
            <div className="icon-item">
              <Globe className="icon-primary" />
              <small>Globe</small>
            </div>
            <div className="icon-item">
              <Home className="icon-accent" />
              <small>Home</small>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
