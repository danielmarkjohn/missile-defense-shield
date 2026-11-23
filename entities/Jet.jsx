import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import FlightTrail from '../components/FlightTrail'
import * as THREE from 'three'
import { useSimStore } from '../../../store/simStore'
import { interpolationAlpha } from '../core/simulation'

export default function Jet() {
  const ref = useRef()
  const vectors = useMemo(() => ({ direction: new THREE.Vector3(), forward: new THREE.Vector3(0, 0, 1), roll: new THREE.Quaternion() }), [])
  const wing = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0.6, 2.2); shape.lineTo(5.6, -2.1)
    shape.lineTo(5.1, -2.8); shape.lineTo(0.6, -1.4); shape.closePath()
    return shape
  }, [])
  useFrame(() => {
    const state = useSimStore.getState(), jet = state.jet, alpha = interpolationAlpha(state)
    ref.current.position.set(...jet.previousPosition).lerp(vectors.direction.set(...jet.position), alpha)
    vectors.direction.set(...jet.velocity).normalize()
    ref.current.quaternion.setFromUnitVectors(vectors.forward, vectors.direction)
    vectors.roll.setFromAxisAngle(vectors.forward, jet.bank)
    ref.current.quaternion.multiply(vectors.roll)
  }, -1)
  return <FlightTrail target={ref} color="#8bbecb">
    <group ref={ref}>
      <mesh scale={[0.8, 0.65, 4.8]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#a9bdc7" metalness={0.65} roughness={0.4} /></mesh>
      <mesh position={[0, 0.55, 1.8]} scale={[0.55, 0.4, 1.4]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#153c50" metalness={0.8} roughness={0.2} /></mesh>
      {[-1, 1].map(side => <group key={side}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[side, 1, 1]}><extrudeGeometry args={[wing, { depth: 0.15, bevelEnabled: false }]} /><meshStandardMaterial color="#748e9d" metalness={0.6} roughness={0.5} /></mesh>
        <mesh position={[side * 1.3, 0.65, -3.5]} rotation={[0.15, 0, side * -0.3]} scale={[0.12, 1.7, 1.3]}><boxGeometry /><meshStandardMaterial color="#607b8d" /></mesh>
        <mesh position={[side * 1, -0.15, -3.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.5, 2, 12]} /><meshStandardMaterial color="#2c3c4b" metalness={0.8} roughness={0.4} /></mesh>
        <mesh position={[side * 1, -0.15, -4.6]} scale={[0.32, 0.32, 1]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#87e4ff" /></mesh>
      </group>)}
    </group>
  </FlightTrail>
}
