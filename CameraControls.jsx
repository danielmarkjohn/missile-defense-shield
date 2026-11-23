import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useSimStore } from '../../store/simStore'
export default function CameraControls() {
  const controls = useRef(), lastMode = useRef(null), transition = useRef(0)
  const mode = useSimStore(s => s.cameraMode)
  const target = useMemo(() => new Vector3(), [])
  const desired = useMemo(() => new Vector3(), [])
  useFrame(({ camera }, delta) => {
    if (!controls.current) return
    if (lastMode.current !== mode) { transition.current = 2; lastMode.current = mode }
    if (mode === 'follow') {
      const jet = useSimStore.getState().jet
      target.set(...jet.position)
      desired.set(target.x + 25, target.y + 15, target.z + 35)
    } else {
      target.set(0, 10, 0)
      desired.set(...(mode === 'overhead' ? [0, 250, 0.1] : [245, 210, 260]))
    }
    if (transition.current > 0 || mode === 'follow') {
      const amount = 1 - Math.exp(-4 * Math.min(delta, 0.1))
      camera.position.lerp(desired, amount)
      controls.current.target.lerp(target, amount)
      transition.current -= delta
      controls.current.update()
    }
  })
  return <OrbitControls ref={controls} makeDefault enabled={mode !== 'follow'} enableDamping dampingFactor={0.08} minDistance={30} maxDistance={420} maxPolarAngle={Math.PI / 2.1} />
}
