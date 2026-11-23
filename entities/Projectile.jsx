import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FlightTrail from '../components/FlightTrail'
import * as THREE from 'three'
import { useSimStore } from '../../../store/simStore'
import { interpolationAlpha } from '../core/simulation'

export default memo(function Projectile({ id, collection }) {
  const ref = useRef()
  const v = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const color = collection === 'missiles' ? '#ffb85c' : '#6ce3f2'
  useFrame(() => {
    const state = useSimStore.getState(), entity = state[collection].find(e => e.id === id)
    if (!entity) { ref.current.visible = false; return }
    ref.current.position.set(...entity.previousPosition).lerp(v.set(...entity.position), interpolationAlpha(state))
    ref.current.quaternion.setFromUnitVectors(up, v.set(...entity.velocity).normalize())
  }, -1)
  return <FlightTrail target={ref} color={color}>
    <group ref={ref}>
      <mesh><cylinderGeometry args={[0.22, 0.25, 2, 8]} /><meshStandardMaterial color="#b8c3c8" /></mesh>
      <mesh position={[0, 1.3, 0]}><coneGeometry args={[0.25, 0.6, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} /></mesh>
      <mesh position={[0, -0.8, 0]}><boxGeometry args={[1.1, 0.5, 0.08]} /><meshStandardMaterial color="#67828d" /></mesh>
      <mesh position={[0, -1.3, 0]} scale={[0.22, 0.7, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color={color} /></mesh>
    </group>
  </FlightTrail>
})
