import { useEffect, useState } from 'react'
import { useSimStore } from '../../../store/simStore'

// DOM telemetry needs 10 updates/second; 3D transforms read the store directly.
export function useTelemetry() {
  const [snapshot, setSnapshot] = useState(useSimStore.getState)
  useEffect(() => {
    const timer = setInterval(() => setSnapshot(useSimStore.getState()), 100)
    return () => clearInterval(timer)
  }, [])
  return snapshot
}

export function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}
