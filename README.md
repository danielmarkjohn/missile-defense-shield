# Project Aegis · Aerospace Operations — Just for Education, Fun & Hobby Experimentation

An interactive, educational 3D aerospace simulator with S.H.I.E.L.D.-inspired controls, animated aircraft and projectiles, a detailed ground environment, radar visualization, and live telemetry.

Built with **React**, **Three.js**, **React Three Fiber**, **Zustand**, and **Vite**. The application runs entirely in the browser, with no backend, account, API key, or external asset service required.

> This is a fictional educational simulation. Flight, projectile, and response behavior are simplified; the project is not a validated model of Iron Dome or a real aircraft or weapons system.

## Features

- **Interactive flight:** a continuous banked patrol with smoothly changing airspeed and cruise altitude.
- **Projectile visualization:** inherited aircraft motion, basic gravity and damping, flight trails, and distinct air and ground effects.
- **Control console:** persistent Start, Pause/Resume, and Reset controls, playback speed selection, and a bounded activity stream.
- **Three camera modes:** tactical orbit, overhead, and aircraft follow.
- **Radar and telemetry:** aircraft position, active contacts, response objects, elapsed simulation time, and event counts.
- **Ground environment:** textured terrain, distant hills, a marked runway, hangars, a control tower, roads, buildings, and instanced trees.
- **Display options:** daylight/dusk lighting, Balanced/High graphics, and toggles for range rings, trails, and the ground grid.
- **Renderer diagnostics:** measured FPS, mean frame interval, draw calls, and loaded geometry and texture counts.
- **Responsive layout:** side-by-side controls on desktop and vertically stacked controls on smaller screens.

## Getting started

### Requirements

- Node.js and npm. Local development has been verified with Node.js **20.18** and npm **10.8**.
- A browser with WebGL support and hardware acceleration enabled.

From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The default development port is `5173`; Vite may choose another port if it is already occupied.

### First exercise

1. Click **Start** in the session controls or **Deploy Aircraft** in the Flight tab.
2. Adjust airspeed and cruise altitude, then select a camera view.
3. Click **Release Test Missile** or press **M** while the exercise is running.
4. Open **Sensors** to inspect the radar and counters.
5. Turn off **Automated response** before releasing a projectile to observe a ground impact.
6. Pause to inspect the scene, or reset to return to the initial state.

The exercise automatically pauses when the browser tab becomes hidden. Resume it when you return.

## Controls

| Control | Action |
| --- | --- |
| Start / Deploy Aircraft | Start the session and activate the aircraft |
| Pause / Resume | Freeze or continue simulation time |
| Reset | Clear the session and restore initial simulation and display settings |
| Space | Pause or resume |
| M | Release a test missile while the aircraft and simulation are active |
| 1 | Tactical camera |
| 2 | Overhead camera |
| 3 | Aircraft follow camera |
| Drag | Orbit the camera in tactical and overhead modes |
| Scroll | Zoom in tactical and overhead modes |
| Playback buttons | Select 0.25×, 0.5×, 1×, 2×, or 3× simulation speed |

Keyboard shortcuts do not override focused buttons, inputs, select menus, or editable text. Click the scene before using them.

### Console tabs

| Tab | Contents |
| --- | --- |
| Flight | Aircraft settings, deployment, projectile release, automated response, and playback speed |
| Sensors | Radar visualization, active-object counts, resolved contacts, and ground impacts |
| Settings | Lighting, graphics quality, display layers, renderer diagnostics, and navigation help |
| Reference | Academic paper summary, implementation scope, and model limitations |

## Graphics and performance

**Balanced** renders at a device pixel ratio of 1, uses fewer trees, and leaves dynamic shadows disabled. **High** enables shadows, increases vegetation, and allows a device pixel ratio up to 1.5. Both use the same simulation clock.

The active environment uses locally generated geometry and textures. It does not download models or fonts at runtime. Trees use instanced meshes, object transforms update directly in the render loop, and DOM telemetry refreshes at 10 Hz.

Original model files remain in [`public/models`](public/models) as reference assets. They are not used by the active scene. [`vite.config.js`](vite.config.js) disables copying the public directory into production output, so future runtime assets placed there will need an explicit bundling or copy strategy.

If performance drops, select **Balanced**, reduce the browser window size, and inspect the diagnostics in Settings. FPS depends on the browser, hardware, display refresh rate, and scene activity.

## Simulation model

The simulation uses **60 fixed steps per simulated second**. A frame accumulator preserves ordinary slow frames, while rendering interpolates positions between steps. Catch-up after a long stall is bounded to 250 ms of real elapsed time per frame to avoid an update backlog.

Simulation time governs detection delays, object lifetimes, effects, trails, and event timestamps. Pausing freezes those systems. Camera navigation and renderer diagnostics remain available while paused.

- **Scale:** one scene unit represents 10 meters.
- **Aircraft:** follows a stylized patrol path with smooth speed, altitude, and bank changes.
- **Projectiles:** inherit aircraft velocity and use basic gravity and damping.
- **Response objects:** follow simple game-style chasing rules.
- **Lifecycle:** completed objects are removed; active-object counts, effects, and event history are bounded.
- **Effects:** air effects expire after 2.4 simulation seconds; ground marks fade over 18 seconds.
- **Terrain:** the exercise surface is flat. Distant hills and structures are scenery, not a terrain or building collision model.

There is no persistent session storage: refreshing the page starts a new session.

## Architecture

```text
src/
├── main.jsx                         # React entry point
├── App.jsx                          # Application shell
├── styles.css                       # Console styling and responsive layout
├── store/
│   └── simStore.js                   # Zustand state and user actions
└── modules/simulation/
    ├── index.jsx                    # Canvas, keyboard controls, and telemetry
    ├── Scene.jsx                    # Scene composition
    ├── SimulationEngine.jsx         # Frame updates and renderer metrics
    ├── CameraControls.jsx          # Tactical, overhead, and follow views
    ├── Sidebar.jsx                 # Control console
    ├── core/simulation.js          # Simulation clock and object lifecycle
    ├── entities/                   # Aircraft and projectile renderers
    ├── environment/                # Seeded terrain and procedural scenery
    ├── components/                 # Trails, radar, and impact effects
    └── hooks/                      # Sampled telemetry and renderer metrics

tests/
├── simulation.test.js              # Timing, controls, and lifecycle checks
└── environment.test.js             # Environment and display-setting checks
```

The active path is `main.jsx → App → simulation/index.jsx → Scene`. `SimulationEngine` advances the core through the store; renderers read the current state without rerendering the entire React interface each frame.

Some older standalone components and numerical helpers remain in the repository outside the active application path. Their presence does not mean their algorithms are used by the simulator.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run the Node regression tests |
| `npm run build` | Generate production files in `dist/` |
| `npm run preview` | Serve the production build locally for inspection |

To inspect a production build:

```sh
npm run build
npm run preview
```

The output is a static browser application and can be served by a static web host. For deployment under a URL subpath, configure Vite's `base` before building.

## Tests

The regression suite covers:

- Equivalent simulation results at 20, 60, and 144 FPS.
- Pause behavior, time scaling, and invalid frame deltas.
- Projectile limits, response capacity, and inherited motion.
- Ground-impact removal and effect expiration.
- Smooth live aircraft controls and reset behavior.
- Repeatable scenery generation and a flat exercise area.
- Display-setting validation and separation from simulation state.

These checks verify application behavior. They do not validate real-world aircraft, sensor, or defense-system performance. Visual appearance and GPU performance still require browser checks.

## Academic reference

The repository includes [*Techniques for Missile Tracking, Projection and Interception*](AM205_Project_Report.pdf), a 15-page AM205 project report by Cooper Lorsung, Sujay Thakur, and David Zheng, dated December 10, 2019.

The report describes numerical experiments using simulated data. Page 11 compares tracking errors across 1,000 synthetic trajectories; pages 13–14 discuss successful and unsuccessful simulated cases and acknowledge reliability limitations.

The general numerical methods can support standalone educational mechanics experiments. The current application does **not** reproduce the paper's estimator or interception algorithms, and the report does not establish real-world Iron Dome accuracy or an industry-standard system specification. The console's Reference tab makes this distinction explicit.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Blank or unavailable 3D view | Enable browser hardware acceleration and confirm WebGL support |
| Low display frame rate | Select Balanced graphics and check Settings → Renderer diagnostics |
| Exercise stopped after switching tabs | Use Resume; tab visibility changes intentionally pause simulation |
| Release button disabled | Start the exercise and deploy the aircraft; releases also respect the active-object limit |
| Keyboard shortcut does nothing | Move focus out of a form control by clicking the scene |
| A new public asset is missing from the build | Check `build.copyPublicDir` in `vite.config.js` |
| Build reports a large JavaScript chunk | Three.js contributes substantially to bundle size; inspect whether the build completed successfully |
