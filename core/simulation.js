// Fictional training world: 1 scene unit = 10 m. Flight and response rules are
// for an arcade visualization, not aircraft or weapon performance models.
export const FIXED_DT = 1 / 60
export const METERS_PER_UNIT = 10
export const MAX_MISSILES = 32
export const EFFECT_LIMIT = 24
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
const ease = (value, target, rate, dt) => value + (target - value) * (1 - Math.exp(-rate * dt))

export function createInitialState() {
  return {
    running: false, timeScale: 1, simTime: 0, accumulator: 0, nextId: 1,
    environment: 'daylight', quality: 'balanced', showGrid: false,
    cameraMode: 'tactical', showRange: true, showTrails: true, autoDefense: true,
    constants: { gravity: 9.81 / METERS_PER_UNIT, metersPerUnit: METERS_PER_UNIT },
    ironDome: { position: [0, 0, 0], detectionRadius: 120, maxInterceptors: 8, interceptorSpeed: 80 },
    jet: {
      active: false, position: [-85, 50, 0], previousPosition: [-85, 50, 0],
      velocity: [0, 0, -25], speed: 25, currentSpeed: 25, altitude: 50,
      phase: Math.PI, bank: 0, previousBank: 0, missileCount: 0,
    },
    missiles: [], interceptors: [], effects: [],
    stats: { released: 0, intercepted: 0, groundImpacts: 0 },
    events: [{ id: 'ready', time: 0, text: 'Training environment ready', type: 'system' }],
  }
}

export function addEvent(state, text, type = 'system') {
  return {
    ...state, nextId: state.nextId + 1,
    events: [{ id: `log-${state.nextId}`, time: state.simTime, text, type }, ...state.events].slice(0, 12),
  }
}

export function releaseProjectile(state) {
  if (!state.running || !state.jet.active || state.missiles.length >= MAX_MISSILES) return state
  const position = [...state.jet.position]
  position[1] -= 1.1
  const velocity = [...state.jet.velocity]
  velocity[1] -= 1.8
  const id = `M-${String(state.nextId).padStart(3, '0')}`
  return addEvent({
    ...state, nextId: state.nextId + 1,
    jet: { ...state.jet, missileCount: state.jet.missileCount + 1 },
    missiles: [...state.missiles, {
      id, active: true, position, previousPosition: [...position], velocity,
      bornAt: state.simTime, detectedAt: null,
    }],
    stats: { ...state.stats, released: state.stats.released + 1 },
  }, `${id} · test missile released`, 'warning')
}

function updateJet(jet, dt) {
  if (!jet.active) return jet
  const currentSpeed = ease(jet.currentSpeed, jet.speed, 1.6, dt)
  const tangentLength = Math.hypot(85 * Math.sin(jet.phase), 65 * Math.cos(jet.phase))
  const phase = jet.phase + currentSpeed / tangentLength * dt
  const altitude = ease(jet.position[1], jet.altitude, 0.45, dt)
  const position = [85 * Math.cos(phase), altitude, 65 * Math.sin(phase)]
  return {
    ...jet, currentSpeed, phase, previousPosition: jet.position, position,
    velocity: position.map((p, i) => (p - jet.position[i]) / dt),
    previousBank: jet.bank,
    bank: ease(jet.bank, -0.25 - currentSpeed / 150, 2, dt),
  }
}

function tick(state) {
  const dt = FIXED_DT
  const simTime = state.simTime + dt
  let nextId = state.nextId
  const effects = state.effects.filter(e => simTime - e.bornAt < e.lifetime)
  let events = state.events
  const stats = { ...state.stats }
  const event = (text, type) => {
    events = [{ id: `log-${nextId++}`, time: simTime, text, type }, ...events].slice(0, 12)
  }
  const impact = (position, kind) => {
    effects.push({ id: `effect-${nextId++}`, position: [...position], kind, bornAt: simTime, lifetime: kind === 'ground' ? 18 : 2.4 })
  }

  const missiles = []
  for (const missile of state.missiles) {
    if (!missile.active) continue
    // Basic gravity and mild damping give a readable arcade projectile arc.
    const velocity = missile.velocity.map((v, i) => (v - (i === 1 ? state.constants.gravity * dt : 0)) * Math.exp(-0.012 * dt))
    const position = missile.position.map((p, i) => p + (missile.velocity[i] + velocity[i]) * 0.5 * dt)
    if (position[1] <= 0) {
      const fraction = clamp(missile.position[1] / (missile.position[1] - position[1]), 0, 1)
      const ground = position.map((p, i) => missile.position[i] + (p - missile.position[i]) * fraction)
      ground[1] = 0
      impact(ground, 'ground')
      stats.groundImpacts++
      event(`${missile.id} · ground impact`, 'warning')
      continue
    }
    if (simTime - missile.bornAt > 45) continue
    const distance = Math.hypot(...position.map((p, i) => p - state.ironDome.position[i]))
    const detectedAt = missile.detectedAt ?? (distance <= state.ironDome.detectionRadius ? simTime : null)
    missiles.push({ ...missile, previousPosition: missile.position, position, velocity, detectedAt })
  }

  const byId = new Map(missiles.map(m => [m.id, m]))
  const interceptors = []
  for (const interceptor of state.interceptors) {
    const target = byId.get(interceptor.targetId)
    if (!interceptor.active || !target || simTime - interceptor.bornAt > 15) continue
    // Simple game-style chase, intentionally not predictive guidance.
    const offset = target.position.map((p, i) => p - interceptor.position[i])
    const distance = Math.hypot(...offset)
    if (distance < 2.5) {
      impact(target.position, 'air')
      byId.delete(target.id)
      stats.intercepted++
      event(`${target.id} · contact resolved`, 'success')
      continue
    }
    const velocity = offset.map(v => v / distance * state.ironDome.interceptorSpeed)
    const position = interceptor.position.map((p, i) => p + velocity[i] * dt)
    interceptors.push({ ...interceptor, previousPosition: interceptor.position, position, velocity })
  }

  const activeMissiles = [...byId.values()]
  const assigned = new Set(interceptors.map(i => i.targetId))
  if (state.autoDefense) {
    for (const missile of activeMissiles) {
      if (interceptors.length >= state.ironDome.maxInterceptors) break
      if (missile.detectedAt === null || simTime - missile.detectedAt < 0.5 || assigned.has(missile.id)) continue
      const position = [state.ironDome.position[0], 1.8, state.ironDome.position[2]]
      interceptors.push({
        id: `I-${String(nextId++).padStart(3, '0')}`, targetId: missile.id, active: true,
        position, previousPosition: [...position], velocity: [0, state.ironDome.interceptorSpeed, 0], bornAt: simTime,
      })
      assigned.add(missile.id)
    }
  }

  return {
    ...state, simTime, nextId, jet: updateJet(state.jet, dt),
    missiles: activeMissiles, interceptors, effects: effects.slice(-EFFECT_LIMIT), stats, events,
  }
}

export function advanceFrame(state, delta) {
  if (!state.running || !Number.isFinite(delta) || delta <= 0) return state
  // Accumulate ordinary slow frames in full; bound catch-up after long stalls.
  let accumulator = state.accumulator + Math.min(delta, 0.25) * state.timeScale
  let next = state
  while (accumulator + 1e-10 >= FIXED_DT) {
    next = tick(next)
    accumulator -= FIXED_DT
  }
  return { ...next, accumulator: Math.max(0, accumulator) }
}

export function interpolationAlpha(state) {
  return state.running ? clamp(state.accumulator / FIXED_DT, 0, 1) : 1
}
