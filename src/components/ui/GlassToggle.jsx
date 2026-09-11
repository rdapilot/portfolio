// Liquid-glass toggle for negative mode. Controlled from App so the navbar
// toggle and the liquid dock always agree — the body-class side effect lives
// next to the state in App, this component owns only the visuals.
export default function GlassToggle({ isNegative, onToggle }) {
  return (
    <button
      type="button"
      className={`glass-toggle${isNegative ? ' is-on' : ''}`}
      onClick={onToggle}
      aria-pressed={isNegative}
      aria-label="Toggle negative colors"
    >
      <span className="glass-knob" />
    </button>
  )
}
