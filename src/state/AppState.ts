import type { ElementRecord } from '../data/periodicTable';

export type OrbitalSelection = {
  n: number;
  l: number;
  m: number;
};

export type AppStateParams = {
  element: ElementRecord;
  ionCharge: number;
  orbital: OrbitalSelection;
  isovalue: number;
  densityScale: number;
};

type Listener = (params: AppStateParams) => void;

export class AppState {
  params: AppStateParams;
  private listeners: Set<Listener> = new Set();

  constructor(initial: AppStateParams) {
    this.params = initial;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  update(updater: (params: AppStateParams) => AppStateParams) {
    this.params = updater(this.params);
    this.listeners.forEach((listener) => listener(this.params));
  }
}
