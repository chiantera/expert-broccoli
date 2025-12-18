// Real-valued spherical harmonics approximations for l <= 3.
// These functions are placeholders for GPU-uploaded coefficients used by the renderer.

const SQRT_1_OVER_4PI = 0.28209479177387814;

export function sphericalHarmonicAmplitude(l: number, m: number, theta: number, phi: number) {
  if (l === 0) return SQRT_1_OVER_4PI;
  if (l === 1) {
    if (m === -1) return SQRT_1_OVER_4PI * Math.sqrt(3) * Math.sin(theta) * Math.sin(phi);
    if (m === 0) return SQRT_1_OVER_4PI * Math.sqrt(3) * Math.cos(theta);
    return SQRT_1_OVER_4PI * Math.sqrt(3) * Math.sin(theta) * Math.cos(phi);
  }
  if (l === 2) {
    if (m === -2) return SQRT_1_OVER_4PI * Math.sqrt(15) * Math.pow(Math.sin(theta), 2) * Math.sin(2 * phi) * 0.5;
    if (m === -1) return SQRT_1_OVER_4PI * Math.sqrt(15) * Math.sin(theta) * Math.sin(phi) * Math.cos(theta);
    if (m === 0) return SQRT_1_OVER_4PI * Math.sqrt(5) * (3 * Math.pow(Math.cos(theta), 2) - 1) * 0.5;
    if (m === 1) return SQRT_1_OVER_4PI * Math.sqrt(15) * Math.sin(theta) * Math.cos(phi) * Math.cos(theta);
    return SQRT_1_OVER_4PI * Math.sqrt(15) * Math.pow(Math.sin(theta), 2) * Math.cos(2 * phi) * 0.5;
  }
  // Simplified f-orbital envelope; full expressions should be added later.
  if (l === 3) {
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    if (m === 0) return SQRT_1_OVER_4PI * 0.25 * (5 * Math.pow(cosT, 3) - 3 * cosT);
    return SQRT_1_OVER_4PI * 0.5 * Math.pow(sinT, 3) * Math.cos(3 * phi);
  }
  return SQRT_1_OVER_4PI;
}
