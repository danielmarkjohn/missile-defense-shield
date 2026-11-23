import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useSimStore } from '../../../store/simStore'
import { backdropHeight, makeTrees, randomSequence } from './environmentData'

function Ground() {
  const { geometry, texture } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1500, 1500, 96, 96)
    geometry.rotateX(-Math.PI / 2)
    const p = geometry.attributes.position
    const colors = new Float32Array(p.count * 3)
    const color = new THREE.Color()
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), height = backdropHeight(x, z)
      p.setY(i, height - 0.08)
      const variation = Math.sin(x * 0.016) * Math.cos(z * 0.013) * 0.03
      color.setHSL(0.19 + variation, 0.13, 0.25 + variation + height * 0.0007)
      color.toArray(colors, i * 3)
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    const random = randomSequence(33), pixels = new Uint8Array(128 * 128 * 4)
    for (let i = 0; i < pixels.length; i += 4) {
      const v = 230 + Math.floor(random() * 25)
      pixels.set([v, v, v, 255], i)
    }
    const texture = new THREE.DataTexture(pixels, 128, 128)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(40, 40)
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.generateMipmaps = true
    texture.needsUpdate = true
    return { geometry, texture }
  }, [])
  useEffect(() => () => { geometry.dispose(); texture.dispose() }, [geometry, texture])
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial map={texture} vertexColors roughness={1} /></mesh>
}

function Trees({ count }) {
  const trunks = useRef(), crowns = useRef()
  const data = useMemo(() => makeTrees(count), [count])
  useLayoutEffect(() => {
    const transform = new THREE.Object3D(), color = new THREE.Color()
    data.forEach((tree, i) => {
      transform.position.set(tree.x, tree.height * 0.25, tree.z)
      transform.scale.set(0.3, tree.height * 0.5, 0.3)
      transform.updateMatrix(); trunks.current.setMatrixAt(i, transform.matrix)
      transform.position.y = tree.height * 0.7
      transform.scale.set(tree.radius, tree.height * 0.65, tree.radius)
      transform.updateMatrix(); crowns.current.setMatrixAt(i, transform.matrix)
      color.setHSL(0.23 + (i % 4) * 0.015, 0.2, 0.19 + (i % 5) * 0.025)
      crowns.current.setColorAt(i, color)
    })
    trunks.current.instanceMatrix.needsUpdate = true
    crowns.current.instanceMatrix.needsUpdate = true
    crowns.current.instanceColor.needsUpdate = true
    trunks.current.computeBoundingSphere(); crowns.current.computeBoundingSphere()
  }, [data])
  return <>
    <instancedMesh ref={trunks} args={[null, null, data.length]} castShadow><cylinderGeometry args={[1, 1.3, 1, 5]} /><meshStandardMaterial color="#665447" /></instancedMesh>
    <instancedMesh ref={crowns} args={[null, null, data.length]} castShadow><coneGeometry args={[1, 1, 7]} /><meshStandardMaterial roughness={1} /></instancedMesh>
  </>
}

function Slab({ position, size, color = '#414d53', ...props }) {
  return <mesh position={position} receiveShadow {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
}

function Airfield({ dusk }) {
  return <group>
    <Slab position={[-20, 0.02, -145]} size={[285, 0.14, 23]} color="#30383c" />
    <Slab position={[-20, 0.12, -155.2]} size={[280, 0.05, 0.45]} color="#c3c3b1" />
    <Slab position={[-20, 0.12, -134.8]} size={[280, 0.05, 0.45]} color="#c3c3b1" />
    {Array.from({ length: 19 }, (_, i) => <Slab key={i} position={[-145 + i * 14, 0.12, -145]} size={[6, 0.05, 0.5]} color="#d3d1b9" />)}
    {[-150, 110].flatMap(x => Array.from({ length: 6 }, (_, i) => <Slab key={`${x}-${i}`} position={[x, 0.12, -153 + i * 3]} size={[7, 0.05, 1.3]} color="#b9bdb3" />))}
    <Slab position={[125, 0.04, 0]} size={[10, 0.14, 310]} color="#41474a" />
    <Slab position={[62, 0.04, 0]} size={[130, 0.14, 8]} color="#41474a" />
    <Slab position={[-60, 0, -105]} size={[150, 0.13, 45]} color="#686d69" />
    {[-105, -60, -15].map(x => <group key={x} position={[x, 0, -95]}>
      <mesh position={[0, 5.5, 0]} castShadow receiveShadow><boxGeometry args={[27, 11, 22]} /><meshStandardMaterial color="#8a918c" /></mesh>
      <mesh position={[0, 11.4, 0]} castShadow><boxGeometry args={[28, 0.8, 23]} /><meshStandardMaterial color="#56656c" /></mesh>
      <Slab position={[0, 4.5, 11.1]} size={[21, 8.5, 0.15]} color="#283943" />
      {[-8, -4, 0, 4, 8].map(dx => <Slab key={dx} position={[dx, 4.5, 11.22]} size={[0.15, 8.5, 0.1]} color="#7e9199" />)}
    </group>)}
    <group position={[28, 0, -96]}>
      <Slab position={[0, 7, 0]} size={[6, 14, 6]} color="#999d94" />
      <Slab position={[0, 15, 0]} size={[11, 3, 9]} color="#426574" />
      <Slab position={[0, 17, 0]} size={[12, 0.7, 10]} color="#bac0b7" />
    </group>
    {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-155 + (i % 12) * 25, 0.4, i < 12 ? -157 : -133]}><sphereGeometry args={[0.32, 6, 4]} /><meshBasicMaterial color={dusk ? '#f4d48b' : '#ccd1b7'} /></mesh>)}
  </group>
}

function Campus({ dusk }) {
  return <group position={[175, 0, 90]}>
    <Slab position={[12, 0, 0]} size={[95, 0.15, 95]} color="#686c65" />
    {Array.from({ length: 9 }, (_, i) => {
      const x = (i % 3) * 28 - 16, z = Math.floor(i / 3) * 28 - 28, height = 5 + i % 4 * 3
      return <group key={i} position={[x, 0, z]}>
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[17, height, 16]} /><meshStandardMaterial color={i % 2 ? '#a0a69b' : '#7f8a83'} /></mesh>
        <Slab position={[0, height + 0.3, 0]} size={[18, 0.6, 17]} color="#576569" />
        <Slab position={[3, height + 1, 0]} size={[4, 1.5, 4]} color="#9baba8" />
        {[0, 1].map(row => <mesh key={row} position={[0, 2 + row * 2, 8.1]}><boxGeometry args={[12, 0.7, 0.15]} /><meshStandardMaterial color="#345663" emissive={dusk ? '#c1a467' : '#000000'} emissiveIntensity={0.4} /></mesh>)}
      </group>
    })}
  </group>
}

export default memo(function Environment() {
  const environment = useSimStore(s => s.environment)
  const quality = useSimStore(s => s.quality)
  const grid = useSimStore(s => s.showGrid)
  const dusk = environment === 'dusk'
  return <>
    <color attach="background" args={[dusk ? '#263743' : '#a5babd']} />
    <fog attach="fog" args={[dusk ? '#263743' : '#a5babd', 310, 1050]} />
    <ambientLight intensity={dusk ? 0.7 : 1.1} />
    <hemisphereLight args={[dusk ? '#a5bfd5' : '#dbeaff', '#55533f', dusk ? 1.2 : 1.8]} />
    <directionalLight position={[-100, 180, 65]} color={dusk ? '#f5c099' : '#fff0d4'} intensity={dusk ? 2 : 3} castShadow={quality === 'high'} shadow-mapSize={[1024, 1024]} shadow-camera-left={-240} shadow-camera-right={240} shadow-camera-top={240} shadow-camera-bottom={-240} shadow-camera-far={600} shadow-normalBias={0.3} />
    <Ground /><Airfield dusk={dusk} /><Campus dusk={dusk} /><Trees count={quality === 'high' ? 180 : 80} />
    {grid && <gridHelper args={[700, 70, '#6d8f91', '#537578']} position={[0, 0.22, 0]} />}
    <Slab position={[0, 0.06, 0]} size={[42, 0.2, 42]} color="#707b79" />
    <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[17.8, 18.2, 64]} /><meshBasicMaterial color="#d4c891" /></mesh>
  </>
})
