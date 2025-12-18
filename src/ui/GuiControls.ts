import GUI from 'lil-gui';
import type { VolumeField } from '../rendering/VolumeField';
import type { AppState } from '../state/AppState';
import type { ElementRecord } from '../data/periodicTable';
import type { ThreeContext } from '../core/ThreeContext';

export function createGuiControls(options: {
  state: AppState;
  table: ElementRecord[];
  field: VolumeField;
  context: ThreeContext;
}) {
  const { state, table, field } = options;
  const gui = new GUI({ title: 'Atomic Visualizer' });

  const selection = {
    element: state.params.element.symbol,
    ionCharge: state.params.ionCharge,
    n: state.params.orbital.n,
    l: state.params.orbital.l,
    m: state.params.orbital.m,
    isovalue: state.params.isovalue
  };

  gui.add(selection, 'element', table.map((e) => e.symbol)).onChange((symbol: string) => {
    const element = table.find((e) => e.symbol === symbol) ?? table[0];
    state.update((params) => ({ ...params, element }));
  });

  gui.add(selection, 'ionCharge', -3, 3, 1).name('Ion charge').onChange((value: number) => {
    state.update((params) => ({ ...params, ionCharge: value }));
  });

  const orbitalFolder = gui.addFolder('Orbital');
  orbitalFolder.add(selection, 'n', 1, 5, 1).name('Principal n').onChange((value: number) => {
    const l = Math.min(selection.l, value - 1);
    const m = Math.max(-l, Math.min(selection.m, l));
    selection.l = l;
    selection.m = m;
    state.update((params) => ({ ...params, orbital: { n: value, l, m } }));
  });

  orbitalFolder
    .add(selection, 'l', 0, 3, 1)
    .name('Azimuthal l')
    .onChange((value: number) => {
      const boundedL = Math.min(value, selection.n - 1);
      selection.l = boundedL;
      selection.m = Math.max(-boundedL, Math.min(selection.m, boundedL));
      state.update((params) => ({ ...params, orbital: { ...params.orbital, l: boundedL, m: selection.m } }));
    });

  orbitalFolder
    .add(selection, 'm', -3, 3, 1)
    .name('Magnetic m')
    .onChange((value: number) => {
      const bounded = Math.max(-selection.l, Math.min(value, selection.l));
      selection.m = bounded;
      state.update((params) => ({ ...params, orbital: { ...params.orbital, m: bounded } }));
    });

  gui
    .add(selection, 'isovalue', 0.01, 0.5, 0.01)
    .name('Isovalue threshold')
    .onChange((value: number) => {
      state.update((params) => ({ ...params, isovalue: value }));
    });

  gui.add({ resetView: () => options.context.camera.position.set(0, 0, 20) }, 'resetView').name('Reset view');
  return gui;
}
