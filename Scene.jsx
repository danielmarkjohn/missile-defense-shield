import Environment from './environment/Environment'
import { Line } from '@react-three/drei'
import Jet from './entities/Jet'
import Missiles from './entities/Missiles'
import Interceptors from './entities/Interceptors'
import Effects from './components/Explosion'
import SimulationEngine from './SimulationEngine'
import CameraControls from './CameraControls'
import { useSimStore } from '../../store/simStore'

const circle = (radius, y) => Array.from({ length: 97 }, (_, i) => [Math.cos(i / 96 * Math.PI * 2) * radius, y, Math.sin(i / 96 * Math.PI * 2) * radius])
const route = Array.from({ length: 97 }, (_, i) => [Math.cos(i / 96 * Math.PI * 2) * 85, 0.2, Math.sin(i / 96 * Math.PI * 2) * 65])
export default function Scene() {
  const showRange = useSimStore(s => s.showRange)
  return <>
    <SimulationEngine /><CameraControls />
    <Environment />
    {showRange && [40, 80, 120].map(r => <Line key={r} points={circle(r, 0.25)} color="#47818e" transparent opacity={0.45} lineWidth={1} />)}
    <Line points={route} color="#68bccc" dashed dashSize={3} gapSize={3} transparent opacity={0.45} />
    <group>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[13, 14, 1, 48]} /><meshStandardMaterial color="#2d4656" /></mesh>
      <mesh position={[0, 2, 0]}><cylinderGeometry args={[5, 7, 3, 8]} /><meshStandardMaterial color="#526e7c" metalness={0.5} roughness={0.6} /></mesh>
      <mesh position={[0, 5, 0]}><sphereGeometry args={[3.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#96c8d4" wireframe /></mesh>
      <Line points={circle(13, 1.1)} color="#8ee3ec" lineWidth={2} />
    </group>
    <Jet /><Missiles /><Interceptors /><Effects />
  </>
}
