import useMagneticPull from '../../hooks/useMagneticPull.js'
import { Star, Rocket, Cloud, Globe } from '../../icons/index.js'

// Bottom liquid-glass dock: real toggles for the background layers + negative
// mode. Each button is magnetic (leans toward the cursor via useMagneticPull)
// and goo-presses with the toggle's squash-and-stretch keyframes. Controlled
// from App so the navbar GlassToggle and this dock never disagree on state.
const DOCK_ACTIONS = [
  { key: 'stars', label: 'Toggle starfield', Icon: Star },
  { key: 'circuits', label: 'Toggle circuit streaks', Icon: Rocket },
  { key: 'grain', label: 'Toggle film grain', Icon: Cloud },
  { key: 'negative', label: 'Toggle negative colors', Icon: Globe },
]

function DockButton({ actionKey, label, Icon, isActive, onToggle }) {
  const magneticRef = useMagneticPull(6)

  return (
    <button
      type="button"
      ref={magneticRef}
      className={`liquid-glass liquid-dock-btn${isActive ? ' is-active' : ''}`}
      onClick={() => onToggle(actionKey)}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
    >
      <span className="liquid-inner">
        <Icon />
      </span>
    </button>
  )
}

export default function LiquidGlassDock({ layers, onToggleLayer }) {
  const [first, second, third, fourth] = DOCK_ACTIONS
  return (
    <div className="liquid-glass liquid-dock" role="toolbar" aria-label="Background layers">
      <DockButton actionKey={first.key} label={first.label} Icon={first.Icon} isActive={layers[first.key]} onToggle={onToggleLayer} />
      <DockButton actionKey={second.key} label={second.label} Icon={second.Icon} isActive={layers[second.key]} onToggle={onToggleLayer} />
      <DockButton actionKey={third.key} label={third.label} Icon={third.Icon} isActive={layers[third.key]} onToggle={onToggleLayer} />
      <span className="liquid-dock-sep" aria-hidden="true" />
      <DockButton actionKey={fourth.key} label={fourth.label} Icon={fourth.Icon} isActive={layers[fourth.key]} onToggle={onToggleLayer} />
    </div>
  )
}
