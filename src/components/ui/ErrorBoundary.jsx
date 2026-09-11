import { Component } from 'react'

// Catches render-time crashes in the 3D tree (failed texture/HDR fetch,
// broken geometry) so one bad asset degrades to a message instead of a
// blank page. Periodically re-checks nothing — recovery is via the reload
// button, which is the only sane reset for a poisoned WebGL context.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="focus-overlay">
          <div className="focus-modal" style={{ '--fm-accent': '#ff4d5e', '--fm-deep': '#5e1620', '--fm-ink': '#160608' }}>
            <div className="focus-text">
              <span className="focus-tag">RENDER FAULT</span>
              <strong className="focus-title">Scene offline</strong>
              <p className="focus-blurb">
                The 3D scene failed to start (missing asset or WebGL unavailable).
                The rest of the page still works — reload to retry.
              </p>
              <button
                type="button"
                className="focus-close"
                style={{ position: 'static', width: 'auto', height: 'auto', padding: '8px 16px' }}
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
