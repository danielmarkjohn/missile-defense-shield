import { Canvas } from '@react-three/fiber'
import { Component, useEffect, useState } from 'react'
import Scene from './Scene'
import Sidebar from './Sidebar'
import { useSimStore } from '../../store/simStore'
import { useTelemetry, formatTime } from './hooks/useTelemetry'

class SceneBoundary extends Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() { return this.state.error ? <div className="scene-error"><h2>3D display unavailable</h2><p>Enable hardware acceleration or try another browser.</p><button onClick={() => window.location.reload()}>Reload display</button></div> : this.props.children }
}
function Emblem() {
  return <svg className="emblem" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" /><circle cx="24" cy="24" r="17" opacity=".35" /><path d="m24 10 5 9 11-2-9 8 6 5-10-2-3 10-3-10-10 2 6-5-9-8 11 2Z" fill="currentColor" stroke="none" /></svg>
}
function Telemetry() {
  const s = useTelemetry()
  return <div className="telemetry"><div><span>AIRCRAFT ALTITUDE</span><strong>{Math.round(s.jet.position[1] * 10)}<small>m</small></strong><div className="mini-bars">▂ ▃ ▄ ▅ ▆ ▇ ▆ ▅ ▅ ▆ ▇</div></div><div><span>ACTIVE CONTACTS</span><strong className={s.missiles.length ? 'amber' : ''}>{String(s.missiles.length).padStart(2, '0')}<small>/ {s.stats.released} released</small></strong><p>{s.stats.intercepted} resolved · {s.stats.groundImpacts} ground impacts</p></div><div><span>MISSION ELAPSED</span><strong>{formatTime(s.simTime)}<small>{s.timeScale}×</small></strong><p><i className={`status-dot ${!s.running ? 'paused' : ''}`} />{s.running ? 'Exercise in progress' : 'Exercise paused'}</p></div></div>
}
export default function Simulation() {
  const cameraMode = useSimStore(s => s.cameraMode)
  const quality = useSimStore(s => s.quality)
  const running = useSimStore(s => s.running)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const onKey = e => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) || e.target.isContentEditable) return
      const s = useSimStore.getState()
      if (e.code === 'Space') { e.preventDefault(); s.toggle() }
      if (e.code === 'KeyM') s.releaseMissile()
      const mode = { Digit1: 'tactical', Digit2: 'overhead', Digit3: 'follow' }[e.code]
      if (mode) s.setCameraMode(mode)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><Emblem /><div><strong>S.H.I.E.L.D.</strong><span>AEROSPACE OPERATIONS DIVISION</span></div></div><div className="header-center">OPERATIONS <span>/</span> TRAINING ENVIRONMENT</div><div className="connection"><span className="status-dot" /> SYSTEM ONLINE <span className="agent-badge">L7</span></div></header>
    <main className="workspace">
      <section className="viewport" aria-label="Interactive airspace simulation">
        <div className="view-heading"><div className="eyebrow">TACTICAL DISPLAY <span>/ SECTOR 07</span></div><h1>Airspace overview<span className="live-tag">{running ? 'LIVE' : 'STANDBY'}</span></h1><p>PROJECT AEGIS <span>·</span> Controlled flight exercise</p></div>
        <div className="view-controls" aria-label="Camera view">{['tactical', 'overhead', 'follow'].map((mode, i) => <button key={mode} aria-pressed={mode === cameraMode} className={mode === cameraMode ? 'selected' : ''} onClick={() => useSimStore.getState().setCameraMode(mode)}><span>0{i + 1}</span> {mode}</button>)}</div>
        <div className="canvas-wrap"><SceneBoundary><Canvas shadows={quality === 'high'} camera={{ position: [245, 210, 260], fov: 52, near: 0.5, far: 1400 }} dpr={quality === 'high' ? [1, 1.5] : 1} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={() => setReady(true)} fallback={<div className="scene-error">WebGL is unavailable. Enable hardware acceleration to use the 3D display.</div>}><Scene /></Canvas></SceneBoundary></div>
        {!ready && <div className="initializing">INITIALIZING DISPLAY…</div>}
        <div className="sector-label"><span className="crosshair">＋</span><div>AEGIS STATION<strong>FORWARD OPERATING BASE</strong></div></div>
        <div className="viewport-bottom"><div className="scene-legend"><span><i className="legend-line" /> PATROL ROUTE</span><span><i className="legend-circle" /> SENSOR RANGE</span><span className="orbit-hint">DRAG TO ORBIT · SCROLL TO ZOOM</span></div><Telemetry /></div>
      </section>
      <Sidebar />
    </main>
    <footer className="statusbar"><span><i className="status-dot" /> AEGIS / SIMULATION NETWORK</span><span>FICTIONAL TRAINING EXERCISE</span><span>BUILD 03.1 <b> / </b> LOCAL</span></footer>
  </div>
}
