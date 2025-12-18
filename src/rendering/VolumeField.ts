import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial
} from 'three';
import { ThreeContext } from '../core/ThreeContext';

export type VolumeGrid = {
  resolution: number;
  data: Float32Array;
};

type VolumeFieldOptions = {
  context: ThreeContext;
  grid: VolumeGrid;
  bounds: number;
  isovalue: number;
};

export class VolumeField {
  readonly mesh: Points;
  private options: VolumeFieldOptions;

  constructor(options: VolumeFieldOptions) {
    this.options = options;
    this.mesh = new Points();
    this.mesh.renderOrder = 1;
    this.mesh.frustumCulled = false;
    this.rebuildGeometry();
  }

  setIsovalue(value: number) {
    this.options.isovalue = value;
    this.rebuildGeometry();
  }

  updateGrid(grid: VolumeGrid) {
    this.options.grid = grid;
    this.rebuildGeometry();
  }

  private rebuildGeometry() {
    const geometry = new BufferGeometry();
    const { positions, colors } = this.buildAttributes();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 0.18,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexColors: true
    });

    if (this.mesh.geometry) this.mesh.geometry.dispose();
    // @ts-expect-error swapping runtime material instance
    if (this.mesh.material) this.mesh.material.dispose();

    this.mesh.geometry = geometry;
    this.mesh.material = material;
  }

  private buildAttributes() {
    const { grid, bounds, isovalue } = this.options;
    const max = grid.data.reduce((acc, v) => Math.max(acc, v), 0);
    const threshold = Math.max(max * isovalue, max * 0.08);
    const pointsAbove: number[] = [];
    const res = grid.resolution;
    let aboveCount = 0;

    for (let i = 0; i < grid.data.length; i += 1) {
      if (grid.data[i] >= threshold) {
        aboveCount += 1;
      }
    }

    const maxPoints = 120000;
    const keepChance = Math.min(1, maxPoints / Math.max(1, aboveCount));

    for (let z = 0; z < res; z += 1) {
      for (let y = 0; y < res; y += 1) {
        for (let x = 0; x < res; x += 1) {
          const idx = x + y * res + z * res * res;
          const value = grid.data[idx];
          if (value < threshold || Math.random() > keepChance) continue;
          const px = (x / (res - 1) - 0.5) * bounds;
          const py = (y / (res - 1) - 0.5) * bounds;
          const pz = (z / (res - 1) - 0.5) * bounds;
          const norm = value / max;
          const [r, g, b] = colorRamp(norm);
          pointsAbove.push(px, py, pz, r, g, b);
        }
      }
    }

    const positions = new Float32Array((pointsAbove.length / 6) * 3);
    const colors = new Float32Array((pointsAbove.length / 6) * 3);

    for (let i = 0, j = 0; i < pointsAbove.length; i += 6, j += 3) {
      positions[j] = pointsAbove[i];
      positions[j + 1] = pointsAbove[i + 1];
      positions[j + 2] = pointsAbove[i + 2];
      colors[j] = pointsAbove[i + 3];
      colors[j + 1] = pointsAbove[i + 4];
      colors[j + 2] = pointsAbove[i + 5];
    }

    return { positions, colors };
  }
}

function colorRamp(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const r = 0.2 + 0.8 * Math.pow(clamped, 0.6);
  const g = 0.5 + 0.5 * Math.pow(clamped, 0.9);
  const b = 0.9 - 0.6 * clamped;
  return [r, g, b];
}
