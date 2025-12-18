import { Color, Group, InstancedMesh, Matrix4, MeshStandardMaterial, SphereGeometry } from 'three';

export function createNucleusMesh(atomicNumber: number) {
  const group = new Group();
  const protonGeometry = new SphereGeometry(0.25, 16, 16);
  const neutronGeometry = new SphereGeometry(0.27, 16, 16);
  const protonMaterial = new MeshStandardMaterial({ color: new Color('#d9534f'), roughness: 0.4, metalness: 0.1 });
  const neutronMaterial = new MeshStandardMaterial({ color: new Color('#5bc0de'), roughness: 0.4, metalness: 0.05 });

  const protonCount = atomicNumber;
  const neutronCount = Math.round(atomicNumber * 1.3);

  const protonMesh = new InstancedMesh(protonGeometry, protonMaterial, protonCount);
  const neutronMesh = new InstancedMesh(neutronGeometry, neutronMaterial, neutronCount);

  const tmp = new Matrix4();
  const jitter = () => (Math.random() - 0.5) * 0.6;

  for (let i = 0; i < protonCount; i += 1) {
    tmp.makeTranslation(jitter(), jitter(), jitter());
    protonMesh.setMatrixAt(i, tmp);
  }

  for (let i = 0; i < neutronCount; i += 1) {
    tmp.makeTranslation(jitter(), jitter(), jitter());
    neutronMesh.setMatrixAt(i, tmp);
  }

  group.add(protonMesh, neutronMesh);
  return group;
}
