import { sphericalHarmonicAmplitude } from './sphericalHarmonics';

export type OrbitalSampleOptions = {
  n: number;
  l: number;
  m: number;
  charge: number;
  atomicNumber: number;
  resolution: number;
};

export type VolumeGrid = {
  resolution: number;
  data: Float32Array;
};

export function sampleOrbitalDensity(options: OrbitalSampleOptions): VolumeGrid {
  const { resolution } = options;
  const data = new Float32Array(resolution * resolution * resolution);
  const half = resolution / 2;
  const zeff = Math.max(1, options.atomicNumber - options.charge * 0.35);
  const scale = 3.2 / zeff;

  for (let z = 0; z < resolution; z += 1) {
    for (let y = 0; y < resolution; y += 1) {
      for (let x = 0; x < resolution; x += 1) {
        const dx = (x - half) * scale;
        const dy = (y - half) * scale;
        const dz = (z - half) * scale;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
        const theta = Math.acos(dz / r);
        const phi = Math.atan2(dy, dx);

        const rho = (2 * zeff * r) / Math.max(1, options.n);
        const radial = Math.pow(rho, options.l) * Math.exp(-rho * 0.5);
        const angular = sphericalHarmonicAmplitude(options.l, options.m, theta, phi);
        const psi = radial * angular;
        data[x + y * resolution + z * resolution * resolution] = psi * psi;
      }
    }
  }

  normalize(data);
  return { resolution, data };
}

function normalize(buffer: Float32Array) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    sum += buffer[i];
  }
  const inv = sum > 0 ? 1 / sum : 1;
  for (let i = 0; i < buffer.length; i += 1) {
    buffer[i] *= inv;
  }
}
