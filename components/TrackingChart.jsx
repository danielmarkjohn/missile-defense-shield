import { useEffect, useRef } from 'react'
export function TrackingChart({ missiles, interceptors, jet, simTime }) {
  const ref = useRef()
  useEffect(() => {
    const ctx = ref.current.getContext('2d'), size = 256, center = 128, scale = 0.8
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = '#0b1720'; ctx.beginPath(); ctx.arc(center, center, 116, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#26424d'; ctx.lineWidth = 1
    ;[29, 58, 87, 116].forEach(r => { ctx.beginPath(); ctx.arc(center, center, r, 0, Math.PI * 2); ctx.stroke() })
    ctx.beginPath(); ctx.moveTo(12, center); ctx.lineTo(244, center); ctx.moveTo(center, 12); ctx.lineTo(center, 244); ctx.stroke()
    ctx.save(); ctx.beginPath(); ctx.arc(center, center, 116, 0, Math.PI * 2); ctx.clip()
    const a = simTime * 0.5
    ctx.fillStyle = '#65d8e012'; ctx.beginPath(); ctx.moveTo(center, center); ctx.arc(center, center, 116, a - 0.6, a); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#67cbd866'; ctx.beginPath(); ctx.moveTo(center, center); ctx.lineTo(center + Math.cos(a) * 116, center + Math.sin(a) * 116); ctx.stroke()
    const dot = (p, color, radius) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(center + p[0] * scale, center + p[2] * scale, radius, 0, Math.PI * 2); ctx.fill() }
    if (jet.active) dot(jet.position, '#d6e8ef', 4)
    missiles.forEach(m => dot(m.position, '#ffc17c', 3))
    interceptors.forEach(m => dot(m.position, '#6de1ed', 2.5))
    dot([0, 0, 0], '#6de1ed', 3); ctx.restore()
  }, [missiles, interceptors, jet, simTime])
  return <canvas ref={ref} width={256} height={256} className="radar-canvas" aria-label={`Radar: ${missiles.length} missiles and ${interceptors.length} response objects`} role="img" />
}
