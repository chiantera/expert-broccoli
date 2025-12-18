# Atomic Structure Visualizer

Interactive Three.js application that renders an atomic nucleus with a volumetric point-cloud representation of electron probability densities derived from hydrogenic orbitals (s, p, d, f). Users can switch elements/ions, dial in quantum numbers, and tune the isovalue threshold to explore orbital shapes.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to view the scene. Use the GUI (top-right) to select the element, ion charge, quantum numbers (n, l, m), and the isovalue threshold. The info card in the lower-left mirrors the current selection.

## Project structure
- `docs/TECHNICAL_SPEC.md` – architecture and math requirements for orbital rendering.
- `src/` – scene setup, orbital sampling, GUI wiring, and volumetric renderer.
- `vite.config.ts` – Vite configuration for dev/build.
