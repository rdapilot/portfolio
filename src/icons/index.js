/**
 * Icon Package for ViteReact3D
 * 
 * A collection of modern line-based SVG icons matching the site's aesthetic.
 * Styled with rounded line caps, consistent stroke weights, and space-tech theme.
 */

export { default as Home } from './components/Home.jsx'
export { default as Star } from './components/Star.jsx'
export { default as Rocket } from './components/Rocket.jsx'
export { default as Globe } from './components/Globe.jsx'
export { default as User } from './components/User.jsx'
export { default as Settings } from './components/Settings.jsx'
export { default as Search } from './components/Search.jsx'
export { default as Menu } from './components/Menu.jsx'
export { default as X } from './components/X.jsx'
export { default as Heart } from './components/Heart.jsx'
export { default as Download } from './components/Download.jsx'
export { default as Cloud } from './components/Cloud.jsx'
export { default as Database } from './components/Database.jsx'

// Color variants based on site theme
export const iconColors = {
  primary: '#08060d',    // Dark text color from CSS vars
  accent: '#aa3bff',     // Accent/purple color
  white: '#ffffff',
  muted: '#6b6375',
}

// Group exports for bulk import
import * as Icons from './components/index.js'
export default Icons