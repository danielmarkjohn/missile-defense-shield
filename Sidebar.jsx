import { useState } from 'react'
import { useSimStore } from '../../store/simStore'
import { TrackingChart } from './components/TrackingChart'
import { useTelemetry, formatTime } from './hooks/useTelemetry'
import { useRenderMetrics } from './hooks/useRenderMetrics'
import { MAX_MISSILES } from './core/simulation'

export default function Sidebar() {
  const [tab, setTab] = useState('flight')
  const s = useTelemetry()
  const metrics = useRenderMetrics()
  const actions = useSimStore.getState()
  return <aside className="sidebar">
    <div className="panel-heading"><span className="eyebrow">MISSION CONTROL</span><span className="tiny-tag">LEVEL 07</span></div>
    <div className="tabs" role="tablist" aria-label="Control panels">{['flight', 'sensors', 'settings', 'reference'].map(t => <button key={t} role="tab" aria-selected={t === tab} onClick={() => setTab(t)} className={t === tab ? 'selected' : ''}>{t}</button>)}</div>
    <div className="session-controls">
      <div><span className="eyebrow">EXERCISE SESSION</span><strong>{s.running ? 'Running' : s.jet.active ? 'Paused' : 'Ready to start'}</strong></div>
      <button className="session-start" onClick={!s.jet.active ? actions.launchJet : actions.toggle}>{!s.jet.active ? 'START' : s.running ? 'PAUSE' : 'RESUME'}</button>
      <button className="session-reset" aria-label="Reset exercise" title="Reset exercise" onClick={actions.reset}>↺</button>
    </div>
    <div className="panel-content">
      {tab === 'flight' && <>
        <div className="section-title"><span>01 / AIRCRAFT</span><span className="status-dot" /></div>
        <div className="aircraft-card"><svg viewBox="0 0 160 70" aria-hidden="true"><path d="M80 3 86 28 145 48 145 54 89 43 87 57 101 64 101 68 80 63 59 68 59 64 73 57 71 43 15 54 15 48 74 28Z" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M80 9V60M20 50H140" stroke="currentColor" opacity=".3" /></svg><div><strong>QUINJET–01</strong><span>{s.jet.active ? 'PATROL IN PROGRESS' : 'READY FOR DEPLOYMENT'}</span></div></div>
        <label className="range-label" htmlFor="speed">Airspeed <span>{Math.round(s.jet.speed * 10)} <small>m/s</small></span></label>
        <input id="speed" type="range" min="15" max="35" step="1" value={s.jet.speed} onChange={e => actions.setJetSpeed(Number(e.target.value))} />
        <div className="range-ends"><span>150 M/S</span><span>350 M/S</span></div>
        <label className="range-label" htmlFor="altitude">Cruise altitude <span>{s.jet.altitude * 10} <small>m</small></span></label>
        <input id="altitude" type="range" min="30" max="90" step="5" value={s.jet.altitude} onChange={e => actions.setJetAltitude(Number(e.target.value))} />
        <div className="range-ends"><span>300 M</span><span>900 M</span></div>
        <button className="primary-button" disabled={s.jet.active} onClick={actions.launchJet}>{s.jet.active ? '✓  AIRCRAFT DEPLOYED' : '↗  DEPLOY AIRCRAFT'}</button>
        <div className="section-title"><span>02 / EXERCISE</span><span className="muted">MANUAL</span></div>
        <button className="launch-button" disabled={!s.running || !s.jet.active || s.missiles.length >= MAX_MISSILES} onClick={actions.releaseMissile}>＋ RELEASE TEST MISSILE <kbd>M</kbd></button>
        <p className="hint">{!s.jet.active ? 'Deploy the aircraft to begin the exercise.' : !s.running ? 'Resume the exercise to release a missile.' : 'Release from the aircraft’s current position.'}</p>
        <button className="switch-row" role="switch" aria-checked={s.autoDefense} onClick={actions.toggleDefense}><span>Automated response</span><span className={`switch ${s.autoDefense ? 'on' : ''}`} /></button>
        <div className="section-title"><span>03 / PLAYBACK</span><span className="muted">{s.timeScale}×</span></div>
        <div className="speed-options">{[0.25, 0.5, 1, 2, 3].map(n => <button key={n} className={n === s.timeScale ? 'selected' : ''} onClick={() => actions.setTimeScale(n)}>{n}×</button>)}</div>
        <p className="hint">Space pauses or resumes the session. Reset clears all contacts and effects.</p>
      </>}
      {tab === 'sensors' && <><div className="section-title"><span>LOCAL AIRSPACE</span><span className="muted">1.45 KM</span></div><TrackingChart {...s} /><div className="radar-legend"><span>● Aircraft</span><span className="amber">● Missile</span><span className="cyan">● Response</span></div><dl className="readouts"><div><dt>Active contacts</dt><dd>{s.missiles.length}</dd></div><div><dt>Response objects</dt><dd>{s.interceptors.length} / {s.ironDome.maxInterceptors}</dd></div><div><dt>Resolved contacts</dt><dd>{s.stats.intercepted}</dd></div><div><dt>Ground impacts</dt><dd>{s.stats.groundImpacts}</dd></div></dl></>}
      {tab === 'settings' && <>
        <div className="section-title">ENVIRONMENT</div>
        <label className="select-label" htmlFor="environment">Lighting</label>
        <select id="environment" value={s.environment} onChange={e => actions.setEnvironment(e.target.value)}><option value="daylight">Daylight / clear visibility</option><option value="dusk">Dusk / warm horizon</option></select>
        <label className="select-label" htmlFor="quality">Graphics quality</label>
        <select id="quality" value={s.quality} onChange={e => actions.setQuality(e.target.value)}><option value="balanced">Balanced / reduced GPU load</option><option value="high">High / shadows + more vegetation</option></select>
        <p className="hint">Graphics settings change the display only. The simulation clock stays the same.</p>
        <div className="section-title">DISPLAY LAYERS</div>
        <button className="switch-row" role="switch" aria-checked={s.showRange} onClick={actions.toggleRange}><span>Range rings</span><span className={`switch ${s.showRange ? 'on' : ''}`} /></button>
        <button className="switch-row" role="switch" aria-checked={s.showTrails} onClick={actions.toggleTrails}><span>Flight trails</span><span className={`switch ${s.showTrails ? 'on' : ''}`} /></button>
        <button className="switch-row" role="switch" aria-checked={s.showGrid} onClick={actions.toggleGrid}><span>Ground grid</span><span className={`switch ${s.showGrid ? 'on' : ''}`} /></button>
        <div className="section-title">RENDERER DIAGNOSTICS</div>
        <dl className="readouts"><div><dt>Display frame rate</dt><dd>{metrics.fps || '—'} FPS</dd></div><div><dt>Mean frame interval</dt><dd>{metrics.frameMs ? metrics.frameMs.toFixed(1) : '—'} ms</dd></div><div><dt>Draw calls</dt><dd>{metrics.draws}</dd></div><div><dt>Loaded geometries</dt><dd>{metrics.geometries}</dd></div><div><dt>Loaded textures</dt><dd>{metrics.textures}</dd></div><div><dt>Simulation clock</dt><dd>60 Hz</dd></div></dl>
        {metrics.fps > 0 && metrics.fps < 30 && <p className="hint amber">Display rate is low. Try Balanced graphics or reduce the browser window size.</p>}
        <div className="info-block"><h3>Navigation</h3><p>Drag to orbit. Scroll to zoom. Follow view tracks the aircraft.</p><p>Space: pause / resume<br />M: release a test missile<br />1 / 2 / 3: camera views</p><p>Leaving this tab pauses the exercise.</p></div>
      </>}
      {tab === 'reference' && <div className="reference-content">
        <div className="section-title">ACADEMIC REFERENCE / 2019</div>
        <h3>Techniques for Missile Tracking, Projection and Interception</h3>
        <p className="hint">Cooper Lorsung, Sujay Thakur, David Zheng<br />Harvard AM205 project report · 15 pages</p>
        <h4>What the report demonstrates</h4>
        <p>Comparisons of numerical tracking and projection methods using simulated data. Its tracking comparison covers 1,000 synthetic trajectories (page 11).</p>
        <h4>What it does not establish</h4>
        <p>Real-world Iron Dome performance, field validation, or a production system specification. The conclusion explicitly reports reliability limitations (page 14).</p>
        <h4>Current implementation</h4>
        <p>This application uses a fixed simulation clock, a stylized aircraft route, simple gravity and damping, and game-style response objects. It does not reproduce the paper's estimator or interception algorithms.</p>
        <h4>Educational feasibility</h4>
        <p>The general numerical methods can be demonstrated in a standalone, non-weapon mechanics lab. Reproducing a research experiment and validating a real defense system are separate tasks.</p>
        <div className="reference-note">Source: AM205_Project_Report.pdf in this repository. Units: 1 scene unit = 10 meters. Distant hills are visual scenery; the exercise surface is flat.</div>
      </div>}
      <div className="section-title"><span>ACTIVITY STREAM</span><span className="muted">LOCAL</span></div>
      <ol className="event-list">{s.events.slice(0, 5).map(e => <li key={e.id} className={e.type}><time>{formatTime(e.time)}</time><span>{e.text}</span></li>)}</ol>
    </div>
    <div className="panel-footer"><span className="status-dot" /> SECURE LOCAL SESSION <span>●●●</span></div>
  </aside>
}
