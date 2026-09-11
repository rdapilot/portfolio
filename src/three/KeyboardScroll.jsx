import { useEffect } from 'react'
import { useScroll } from '@react-three/drei'

// Keyboard paging for the scroll journey. drei's ScrollControls owns a
// private scroll container (body itself never scrolls), so global keys would
// do nothing — this handler drives that container directly via scroll.el.
// Skipped while the focus modal is open (arrows belong to card nav there)
// and while focus sits in a form control. Mounted inside <ScrollControls>
// because useScroll only exists below it.
const PAGE_KEYS = {
  ArrowDown: 0.9,
  ArrowUp: -0.9,
  PageDown: 0.9,
  PageUp: -0.9,
}

export default function KeyboardScroll() {
  const scroll = useScroll()

  useEffect(() => {
    const onKeyDown = (event) => {
      // Modal open: leave arrows to the card navigator.
      if (document.querySelector('.focus-overlay')) return
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return

      if (event.key === 'Home') {
        event.preventDefault()
        scroll.el.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        scroll.el.scrollTo({ top: scroll.el.scrollHeight, behavior: 'smooth' })
        return
      }
      const pageFraction = PAGE_KEYS[event.key]
      if (pageFraction === undefined) return
      event.preventDefault()
      scroll.el.scrollBy({ top: pageFraction * window.innerHeight, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [scroll])

  return null
}
