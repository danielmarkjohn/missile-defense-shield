import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRenderMetrics } from './hooks/useRenderMetrics'
import { useSimStore } from '../../store/simStore'

export default function SimulationEngine() {
  const sample = useRef({ frames: 0, elapsed: 0 })
  useFrame(({ gl }, delta) => {
    useSimStore.getState().step(delta)
    sample.current.frames++
    sample.current.elapsed += delta
    if (sample.current.elapsed >= 0.5) {
      const { frames, elapsed } = sample.current
      useRenderMetrics.setState({ fps: Math.round(frames / elapsed), frameMs: elapsed / frames * 1000, draws: gl.info.render.calls, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures })
      sample.current = { frames: 0, elapsed: 0 }
    }
  }, -2)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) useSimStore.getState().pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  return null
}
