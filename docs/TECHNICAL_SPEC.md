# Atomic Structure Visualization Application – Technical Specification

## Goals and Scope
Build a browser-based visualization tool that renders scientifically faithful atomic structures using WebGL/Three.js. The app must:

- Show a nucleus and electron probability densities for s, p, d, and f orbitals.
- Allow selection of any element (Z = 1–118) and common ionic states.
- Support interactive camera controls, view toggles (density field, isosurfaces, node overlays), and parameter adjustments (e.g., isovalue, density scaling).
- Target desktop browsers with WebGL2 support; degrade gracefully to WebGL1 with reduced quality where possible.

## High-Level Architecture

```
index.html
└── src/
    ├─ app.ts                 # Application bootstrap and orchestration
    ├─ config/                # Constants, orbital presets, rendering defaults
    ├─ core/                  # Three.js scene setup, renderer, camera, controls
    ├─ data/                  # Periodic table + ionization metadata
    ├─ math/                  # Orbital probability density utilities
    ├─ rendering/             # Materials, shaders, instancing utilities
    ├─ state/                 # Global reactive state (selected element/orbital)
    └─ ui/                    # GUI bindings (lil-gui) and HUD overlays
```

- **Rendering engine:** Three.js with WebGL2 features (3D textures, instanced meshes, floating-point textures).
- **Volume strategy:** GPU-driven ray-marched volume for probability densities, plus optional iso-surface extraction (Marching Cubes on WebGL2 or precomputed LUTs).
- **Physics fidelity:** Orbital densities computed from hydrogen-like wavefunctions scaled by effective nuclear charge (Slater rules) for atoms/ions; normalized probability densities for s/p/d/f.
- **State management:** Lightweight signal store (custom) to broadcast element/orbital updates to rendering and UI layers.

## Core Modules

### 1) Core Three.js Setup (src/core)
- `ThreeContext`: Initializes renderer, scene, perspective camera, orbit controls, tone mapping, and adaptive pixel ratio. Exposes resize/render hooks.
- `EnvironmentLoader`: Optional HDRI/environment map loader for PBR nucleus materials; falls back to neutral lighting.

### 2) Data & Configuration (src/data, src/config)
- `periodicTable.ts`: Minimal dataset with atomic number, symbol, name, electron configuration, common ions, and color coding. Supports lookup by Z and ion charge.
- `orbitalPresets.ts`: Maps principal quantum number (n) + orbital type (l) to rendering defaults: voxel resolution, isovalue thresholds, and color palettes.
- `renderDefaults.ts`: Toggles for postprocessing (FXAA), tone mapping, and density scaling.

### 3) Math Layer (src/math)
- `sphericalHarmonics.ts`: Implements real spherical harmonics `Y_lm(θ, φ)` for m ∈ [−l, l], optimized for GPU uniform uploads and CPU sampling.
- `radialWavefunctions.ts`: Hydrogenic radial components `R_{n,l}(r)` parameterized by effective nuclear charge (Z_eff). Includes normalization and decay controls.
- `orbitalDensity.ts`: Composes radial + angular parts to compute |ψ|² and provides CPU-side samplers for precomputing 3D textures; exposes LUTs for s/p/d/f nodes.

### 4) Rendering Layer (src/rendering)
- `VolumeField`: Builds a 3D density texture (RGBA16F or R16F) from CPU samples; uploads to a custom `ShaderMaterial` for ray marching with adjustable isovalue and transfer function.
- `IsoSurfaceMesh`: Generates isosurfaces via Marching Cubes (GPU or CPU fallback) to highlight nodal shapes; supports edge outlines for educational mode.
- `NucleusMesh`: Instanced mesh of protons/neutrons with color-coded spheres; animated jitter to imply motion.
- `ElectronMarkerLayer` (optional): Small particle layer for stochastic sampling of |ψ|² to contrast classical Bohr orbits.

### 5) State & Interactivity (src/state, src/ui)
- `AppState`: Stores selected element, ion charge, active orbital (n, l, m), visualization mode, and quality presets. Emits subscriptions.
- `GuiControls`: lil-gui panel binding to AppState; exposes selectors for element/ion, orbital, density scale, isovalue, display mode, and quality.
- Event handlers update `AppState`; rendering layer observes state and refreshes textures/meshes as needed.

## Orbital Probability Density Requirements
- Use hydrogen-like wavefunctions as baseline: `ψ_{n,l,m}(r,θ,φ) = R_{n,l}(r) Y_l^m(θ,φ)`.
- **Radial part:** Implement normalized Laguerre polynomials with effective nuclear charge `Z_eff = Z - σ` (Slater rules). For ions, adjust `Z` by charge and recompute `Z_eff`.
- **Angular part:** Use real spherical harmonics; precompute constants for `l ≤ 3` (s, p, d, f) and embed in shader uniforms.
- **Sampling domain:** Cube covering ~8–12 Bohr radii scaled by `n² / Z_eff` to capture tails; clamp density floor to avoid banding.
- **Normalization:** Normalize density field per orbital so integral ≈ 1.0 before mapping to color/alpha.
- **Visualization modes:**
  - Volume ray marching with transfer function (color by |ψ|², alpha via exponential ramp).
  - Isosurface at configurable probability thresholds (e.g., 0.05, 0.15) with optional nodal surface overlay.
  - Cross-section slices aligned to principal axes for detailed study.

## Element & Ion Handling
- Periodic table dataset includes electron configurations and default valence states. Ion charge selection updates electron count and effective nuclear charge estimates.
- Ionization impacts radial decay constants; update sampling scale and re-normalize densities per selection.
- Provide presets for common ions (e.g., Na⁺, Cl⁻); fallback to user-defined charge input.

## Rendering Pipeline
1. **Bootstrap:** Load ThreeContext, set renderer (WebGL2 preferred), attach canvas to DOM, configure resize handling.
2. **Load Data:** Fetch element metadata and orbital presets; initialize AppState with a default element/ion (e.g., Hydrogen neutral 1s).
3. **Generate Density Texture:** Sample `orbitalDensity` on CPU in a Web Worker to avoid blocking; upload to 3D texture.
4. **Render Pass:** Ray-march the volume texture in fragment shader; accumulate color/alpha via transfer function tuned per orbital type.
5. **Optional Isosurface:** Extract mesh for selected isovalue; render with PBR material and outline pass.
6. **UI Interaction:** GuiControls updates AppState; triggers regeneration of textures/meshes and adjusts shader uniforms live.

## Foundational File/Code Structure
- **Build tooling:** Vite + TypeScript for fast dev loop; npm scripts `dev`, `build`, and `preview`.
- **Entry point (`src/app.ts`):** wires AppState, ThreeContext, GUI, and initial density generation.
- **Shader scaffolding:** `src/rendering/shaders/volumeRaymarch.frag` and `volumeRaymarch.vert` placeholders for volume pass; `isosurface.frag/vert` for mesh rendering.
- **Testing hooks:** Math utilities are pure functions and can be unit tested with Vitest later; web workers to be added for sampling.

## Performance & Quality Considerations
- Adaptive quality presets adjust voxel resolution (e.g., 96³, 160³), step size, and color ramp smoothing based on device capabilities.
- Use hardware-accelerated linear interpolation on 3D textures; prefer half-float formats to balance precision and bandwidth.
- Memory budget: keep volume textures under ~8–16 MB per field; release GPU resources on selection change to avoid leaks.
- Provide framerate meter and device capability checks (GL extensions) to gate expensive effects.

## Roadmap / Next Steps
1. Implement AppState and periodic table dataset with ion support.
2. Implement math layer for s/p/d/f probability densities and validation snapshots (golden images).
3. Build CPU sampler + Web Worker to populate 3D textures; integrate VolumeField renderer.
4. Add GUI controls for element/ion/orbital selection, isovalue, and display modes.
5. Add education overlays (labels, node markers) and performance tuning presets.
