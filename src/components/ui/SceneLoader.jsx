// Loading screen shown while the 3D chunk downloads and first frames render.
// Fills the canvas area (not the viewport) so navbar, orbs, and dock are
// already alive behind it — the wait feels like boot-up, not a blank page.
export default function SceneLoader() {
  return (
    <div className="scene-loader" role="status" aria-label="Loading 3D scene">
      <div className="scene-loader-plate">
        <span className="scene-loader-tag">ESTABLISHING UPLINK</span>
        <strong className="scene-loader-title">EndoMind</strong>
        <span className="loader-bar" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  )
}
