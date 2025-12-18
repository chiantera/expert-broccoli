import { ThreeContext } from './core/ThreeContext';
import { Group } from 'three';
import { createNucleusMesh } from './rendering/NucleusMesh';
import { VolumeField } from './rendering/VolumeField';
import { buildPeriodicTable, ElementRecord } from './data/periodicTable';
import { AppState, AppStateParams } from './state/AppState';
import { createGuiControls } from './ui/GuiControls';
import { sampleOrbitalDensity } from './math/orbitalDensity';

export function initApp(container: HTMLElement) {
  const table = buildPeriodicTable();
  const state = new AppState({
    element: table[0],
    ionCharge: 0,
    orbital: { n: 1, l: 0, m: 0 },
    isovalue: 0.16,
    densityScale: 1.0
  });

  const context = new ThreeContext(container);
  let nucleus = createNucleusMesh(state.params.element.atomicNumber);
  context.scene.add(nucleus);

  const resolution = 84;
  let density = sampleOrbitalDensity({
    n: state.params.orbital.n,
    l: state.params.orbital.l,
    m: state.params.orbital.m,
    charge: state.params.ionCharge,
    atomicNumber: state.params.element.atomicNumber,
    resolution
  });

  const field = new VolumeField({
    context,
    grid: density,
    bounds: 12,
    isovalue: state.params.isovalue
  });
  context.scene.add(field.mesh);

  const info = createInfoPanel(container);

  state.subscribe((params) => {
    const nextDensity = sampleOrbitalDensity({
      n: params.orbital.n,
      l: params.orbital.l,
      m: params.orbital.m,
      charge: params.ionCharge,
      atomicNumber: params.element.atomicNumber,
      resolution
    });
    density = nextDensity;
    field.updateGrid(density);
    field.setIsovalue(params.isovalue);
    context.scene.remove(nucleus);
    disposeGroup(nucleus);
    nucleus = createNucleusMesh(params.element.atomicNumber);
    context.scene.add(nucleus);
    updateInfoPanel(info, params.element, params);
  });

  createGuiControls({ state, table, field, context });
  updateInfoPanel(info, state.params.element, state.params);
  context.start();
}

function disposeGroup(group: Group) {
  group.traverse((obj: any) => {
    if (obj.geometry) obj.geometry.dispose?.();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose?.());
      else obj.material.dispose?.();
    }
  });
}

function createInfoPanel(container: HTMLElement) {
  const panel = document.createElement('div');
  panel.className = 'info-panel';
  panel.innerHTML = `
    <div class="info-top">
      <div class="label">Element</div>
      <div class="value" data-field="symbol">H</div>
      <div class="caption" data-field="name">Hydrogen</div>
    </div>
    <div class="info-grid">
      <div>
        <div class="label">Atomic #</div>
        <div class="value" data-field="atomicNumber">1</div>
      </div>
      <div>
        <div class="label">Ion</div>
        <div class="value" data-field="ion">0</div>
      </div>
      <div>
        <div class="label">Orbital</div>
        <div class="value" data-field="orbital">1s</div>
      </div>
    </div>
    <div class="caption" data-field="config">1s¹</div>
  `;
  container.appendChild(panel);
  return panel;
}

function updateInfoPanel(panel: HTMLElement, element: ElementRecord, params: AppStateParams) {
  const orbitalLetters = ['s', 'p', 'd', 'f'];
  const get = (selector: string) => panel.querySelector(selector) as HTMLElement;
  get('[data-field="symbol"]').textContent = element.symbol;
  get('[data-field="name"]').textContent = element.name;
  get('[data-field="atomicNumber"]').textContent = String(element.atomicNumber);
  const ion = params.ionCharge === 0 ? 'neutral' : `${params.ionCharge > 0 ? '+' : ''}${params.ionCharge}`;
  get('[data-field="ion"]').textContent = ion;
  get('[data-field="orbital"]').textContent = `${params.orbital.n}${orbitalLetters[params.orbital.l] ?? 's'} (m=${params.orbital.m})`;
  get('[data-field="config"]').textContent = element.electronConfiguration;
}
