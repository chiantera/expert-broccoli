export type ElementRecord = {
  atomicNumber: number;
  symbol: string;
  name: string;
  commonIons: number[];
  electronConfiguration: string;
};

export function buildPeriodicTable(): ElementRecord[] {
  return [
    {
      atomicNumber: 1,
      symbol: 'H',
      name: 'Hydrogen',
      commonIons: [0, -1, 1],
      electronConfiguration: '1s¹'
    },
    {
      atomicNumber: 2,
      symbol: 'He',
      name: 'Helium',
      commonIons: [0],
      electronConfiguration: '1s²'
    },
    {
      atomicNumber: 3,
      symbol: 'Li',
      name: 'Lithium',
      commonIons: [0, 1],
      electronConfiguration: '[He] 2s¹'
    },
    {
      atomicNumber: 6,
      symbol: 'C',
      name: 'Carbon',
      commonIons: [0, -4, 4],
      electronConfiguration: '[He] 2s² 2p²'
    },
    {
      atomicNumber: 7,
      symbol: 'N',
      name: 'Nitrogen',
      commonIons: [0, -3, 3, 5],
      electronConfiguration: '[He] 2s² 2p³'
    },
    {
      atomicNumber: 8,
      symbol: 'O',
      name: 'Oxygen',
      commonIons: [0, -2],
      electronConfiguration: '[He] 2s² 2p⁴'
    },
    {
      atomicNumber: 11,
      symbol: 'Na',
      name: 'Sodium',
      commonIons: [0, 1],
      electronConfiguration: '[Ne] 3s¹'
    },
    {
      atomicNumber: 12,
      symbol: 'Mg',
      name: 'Magnesium',
      commonIons: [0, 2],
      electronConfiguration: '[Ne] 3s²'
    },
    {
      atomicNumber: 14,
      symbol: 'Si',
      name: 'Silicon',
      commonIons: [0, -4, 4],
      electronConfiguration: '[Ne] 3s² 3p²'
    },
    {
      atomicNumber: 17,
      symbol: 'Cl',
      name: 'Chlorine',
      commonIons: [0, -1],
      electronConfiguration: '[Ne] 3s² 3p⁵'
    },
    {
      atomicNumber: 18,
      symbol: 'Ar',
      name: 'Argon',
      commonIons: [0],
      electronConfiguration: '[Ne] 3s² 3p⁶'
    }
  ];
}
