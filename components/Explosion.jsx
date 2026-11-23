import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSimStore } from '../../../store/simStore'

const Effect = memo(function Effect({ id }) {
  const flash = useRef(), ring = useRef(), smoke = useRef(), crater = useRef()
  const effect = useSimStore.getState().effects.find(e => e.id === id)
  useFrame(() => {
    const age = useSimStore.getState().simTime - effect.bornAt
    const fade = Math.max(0, 1 - age / 2.4)
    flash.current.scale.setScalar(0.2 + Math.min(age * 12, 5))
    flash.current.material.opacity = Math.max(0, 1 - age / 0.65)
    ring.current.scale.setScalar(1 + age * 9)
    ring.current.material.opacity = fade * 0.6
    smoke.current.children.forEach((particle, i) => {
      const angle = i * 2.399
      particle.position.set(Math.cos(angle) * age * 3, age * (2 + i % 3), Math.sin(angle) * age * 3)
      particle.scale.setScalar(0.5 + age * 1.7)
      particle.material.opacity = fade * 0.22
    })
    if (crater.current) crater.current.material.opacity = Math.max(0, 1 - age / 18) * 0.6
  })
  return <group position={effect.position}>
    <mesh ref={flash}><sphereGeometry args={[1, 12, 8]} /><meshBasicMaterial color="#ffd3a0" transparent depthWrite={false} /></mesh>
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}><ringGeometry args={[0.85, 1, 48]} /><meshBasicMaterial color={effect.kind === 'ground' ? '#f8ba72' : '#81dfed'} transparent depthWrite={false} side={2} /></mesh>
    <group ref={smoke}>{Array.from({ length: 8 }, (_, i) => <mesh key={i}><sphereGeometry args={[1, 6, 5]} /><meshBasicMaterial color="#829099" transparent depthWrite={false} /></mesh>)}</group>
    {effect.kind === 'ground' && <mesh ref={crater} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4, 24]} /><meshBasicMaterial color="#12151a" transparent depthWrite={false} /></mesh>}
  </group>
})
export default function Effects() {
  const ids = useSimStore(s => s.effects.map(e => e.id).join('|'))
  return ids ? ids.split('|').map(id => <Effect key={id} id={id} />) : null
}
