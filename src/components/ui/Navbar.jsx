import GlassToggle from './GlassToggle.jsx'
import IconDemo from './IconDemo.jsx'

// Fixed top bar: brand title on the left, display controls on the right.
// Thin composition only — GlassToggle and IconDemo own their own visuals;
// negative state is passed through from App (shared with the liquid dock).
export default function Navbar({ isNegative, onToggleNegative }) {
  return (
    <nav className="navbar">
      <span className="navbar-title">EndoMind</span>
      <GlassToggle isNegative={isNegative} onToggle={onToggleNegative} />
      <IconDemo />
    </nav>
  )
}
