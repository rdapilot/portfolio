import { Suspense, lazy, useEffect, useState } from 'react'
import './App.css'
import './icons/IconStyles.css'
import './components/liquid/liquidGlass.css'
import { CARD_COUNT } from './config/sceneConfig.js'
import Stars from './components/background/Stars.jsx'
import CircuitStreaks from './components/background/CircuitStreaks.jsx'
import GrainField from './components/background/GrainField.jsx'
import Navbar from './components/ui/Navbar.jsx'
import CardFocus from './components/ui/CardFocus.jsx'
import FleeingGlassOrbs from './components/liquid/FleeingGlassOrbs.jsx'
import LiquidGlassDock from './components/liquid/LiquidGlassDock.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import SceneLoader from './components/ui/SceneLoader.jsx'
import { WEBGL_AVAILABLE } from './utils/webgl.js'

// Lazy: the entire three.js journey (SceneCanvas + its vendor chunks) loads
// on demand, so first paint is just the DOM shell + loader. A failed chunk
// load throws into the ErrorBoundary below, same as any scene crash.
const SceneCanvas = lazy(() => import('./three/SceneCanvas.jsx'))

// ---------------------------------------------------------------------------
// App: thin composition root. Every responsibility lives in its own module:
//   config/sceneConfig.js      — all magic numbers + card metadata
//   components/background/*    — Stars, CircuitStreaks, GrainField overlays
//   components/ui/*            — Navbar, CardFocus modal, HtmlPages copy
//   components/liquid/*        — FleeingGlassOrbs, LiquidGlassDock
//   three/*                    — SceneCanvas (lazy entry), SectorTitle,
//                                PlanetSystem, CardCarousel, GardenFinale,
//                                CloudLayer, SceneRig choreography,
//                                KeyboardScroll paging
// This file only wires them together plus two pieces of shared UI state:
// the background-layer toggles (shared by the navbar + dock) and the
// card-focus modal index.
// ---------------------------------------------------------------------------

export default function App() {
  // Index of the card shown in the focus modal; -1 means "none open".
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1)
  // Background layers + negative mode, toggled from the liquid dock.
  // Negative is lifted (not owned by GlassToggle) so navbar and dock agree.
  const [layers, setLayers] = useState({ stars: true, circuits: true, grain: true, negative: false })

  // One CSS `filter: invert(1)` inverts canvas + DOM overlays together, so no
  // per-component theme plumbing is needed.
  useEffect(() => {
    document.body.classList.toggle('negative', layers.negative)
    return () => document.body.classList.remove('negative')
  }, [layers.negative])

  const closeFocusedCard = () => setFocusedCardIndex(-1)
  const stepFocusedCard = (step) =>
    setFocusedCardIndex((index) => (index + step + CARD_COUNT) % CARD_COUNT)
  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      {/* Fixed 2D layers behind the canvas */}
      {layers.stars && <Stars />}
      {layers.circuits && <CircuitStreaks />}
      <Navbar isNegative={layers.negative} onToggleNegative={() => toggleLayer('negative')} />
      {/* Decorative glass orbs that flee the cursor (never intercept clicks) */}
      <FleeingGlassOrbs />

      <div className="app-shell">
        {/* Opacity driven per-frame from SceneRig for seamless sky handoffs */}
        <div id="handoff-veil" className="handoff-veil" />
        <div className="canvas-wrap">
          <ErrorBoundary>
            {WEBGL_AVAILABLE ? (
              <Suspense fallback={<SceneLoader />}>
                <SceneCanvas onSelectCard={setFocusedCardIndex} />
              </Suspense>
            ) : (
              <div className="focus-overlay">
                <div className="focus-modal" style={{ '--fm-accent': '#22d3ee', '--fm-deep': '#0e3a44', '--fm-ink': '#061114' }}>
                  <div className="focus-text">
                    <span className="focus-tag">NO GPU</span>
                    <strong className="focus-title">2D mode</strong>
                    <p className="focus-blurb">
                      WebGL is unavailable in this browser, so the 3D scene is parked.
                      Everything else on the page works normally.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Film-grain overlay above the canvas, below the modal */}
      <div className="analog-overlay" aria-hidden="true">
        {layers.grain && <GrainField />}
      </div>

      <LiquidGlassDock layers={layers} onToggleLayer={toggleLayer} />

      {focusedCardIndex >= 0 && (
        <CardFocus index={focusedCardIndex} onClose={closeFocusedCard} onNavigate={stepFocusedCard} />
      )}
    </>
  )
}
