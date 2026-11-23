import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useSimStore } from '../../../store/simStore'

export default function FlightTrail({ target, color, children }) {
  const geometry = useRef(), count = useRef(0), lastTime = useRef(-1)
  const positions = useMemo(() => new Float32Array(64 * 3), [])
  const point = useMemo(() => new Vector3(), [])
  const visible = useSimStore(s => s.showTrails)
  useFrame(() => {
    const { simTime, running } = useSimStore.getState()
    if (simTime < lastTime.current) { count.current = 0; lastTime.current = -1; geometry.current.setDrawRange(0, 0) }
    if (!running || !target.current || simTime - lastTime.current < 0.03) return
    lastTime.current = simTime
    target.current.updateWorldMatrix(true, false)
    target.current.getWorldPosition(point)
    if (count.current === 64) positions.copyWithin(0, 3)
    else count.current++
    point.toArray(positions, (count.current - 1) * 3)
    geometry.current.attributes.position.needsUpdate = true
    geometry.current.setDrawRange(0, count.current)
  })
  return <>{children}<line visible={visible} frustumCulled={false}><bufferGeometry ref={geometry} drawRange={{ start: 0, count: 0 }}><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><lineBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} /></line></>
}
