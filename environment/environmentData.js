// A fixed seed keeps the fictional landscape reproducible across sessions.
export function randomSequence(seed = 7307) {
  let value = seed >>> 0
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296 }
}

export function makeTrees(count = 180) {
  const random = randomSequence()
  const trees = []
  for (let attempt = 0; trees.length < count && attempt < count * 20; attempt++) {
    const x = (random() - 0.5) * 650
    const z = (random() - 0.5) * 650
    // Keep the airfield, roads, campus and central display clear.
    if (Math.hypot(x, z) < 125 || Math.abs(z + 145) < 30 || Math.abs(x - 125) < 18 || (x > 140 && x < 240 && z > 30 && z < 170)) continue
    trees.push({ x, z, height: 3 + random() * 5, radius: 1.8 + random() * 1.4 })
  }
  return trees
}

// Mountains are a distant backdrop. The playable exercise area stays flat.
export function backdropHeight(x, z) {
  const radius = Math.hypot(x, z)
  const edge = Math.max(0, Math.min(1, (radius - 390) / 130))
  return edge * (22 + 22 * Math.sin(x * 0.017) * Math.cos(z * 0.012) + 12 * Math.sin(z * 0.036 + x * 0.019))
}
