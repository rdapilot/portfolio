import { Home, User, Settings, Search, Heart, Database, Star } from '../../icons/index.js'

// DOM overlay pages pinned to each ScrollControls page (drei <Scroll html>).
// Why separate: the original App.jsx buried marketing copy inside Canvas JSX.
// Here each page is declarative markup; the 3D camera (SceneRig) owns motion.
// pointer-events stay none (CSS) so scrolling reaches the canvas.
export default function HtmlPages() {
  return (
    <div className="html-pages">
      {/* Page 1: empty — lets the planet trio own the first viewport. */}
      <section className="html-page" />

      <section className="html-page">
        <div className="hero-icons">
          <Home className="icon-hero icon-accent" />
          <User className="icon-hero icon-primary" />
          <Settings className="icon-hero icon-primary" />
        </div>
        <h1 className="hero-title">collective conscious</h1>
        <p className="hero-sub">
          Rapid hardware and software architecture prototyping for organic intelligence simulation
        </p>
      </section>

      <section className="html-page">
        <div className="hero-icons">
          <Search className="icon-hero icon-primary" />
          <Heart className="icon-hero icon-accent" />
          <Database className="icon-hero icon-primary" />
        </div>
        <h1 className="hero-title">Our Products</h1>
        <p className="hero-sub">A universal gallery built for the working man</p>
      </section>

      <section className="html-page">
        <div className="hero-icons">
          <Star className="icon-hero icon-primary" />
          <Database className="icon-hero icon-accent" />
        </div>
        <h1 className="hero-title">The research</h1>
        <p className="hero-sub">Every primitive form of knowledge, lives in one place</p>
      </section>
    </div>
  )
}
