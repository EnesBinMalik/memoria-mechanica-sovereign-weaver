import * as THREE from 'three';
import type { ProceduralTextureSet } from './proceduralTextures';

export interface ArtisanMaterialLibrary {
  brushedBrass: THREE.MeshPhysicalMaterial;
  antiqueBronze: THREE.MeshStandardMaterial;
  damascusSteel: THREE.MeshPhysicalMaterial;
  polishedWalnut: THREE.MeshStandardMaterial;
  agedPorcelain: THREE.MeshPhysicalMaterial;
  anthraciteBasalt: THREE.MeshStandardMaterial;
  moltenKintsugiGold: THREE.MeshStandardMaterial;
  goldenThread: THREE.MeshStandardMaterial;
  vitrailGlass: THREE.MeshPhysicalMaterial;
  sapphireCrystal: THREE.MeshPhysicalMaterial;
  chronometerDial: THREE.MeshStandardMaterial;
  parchmentIvory: THREE.MeshStandardMaterial;
  obsidianCore: THREE.MeshPhysicalMaterial;
  dispose: () => void;
}

export function createArtisanMaterials(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): ArtisanMaterialLibrary {
  const brushedBrass = new THREE.MeshPhysicalMaterial({
    color: 0xd9b35b,
    map: textures.brassMap,
    roughnessMap: textures.brassRoughness,
    metalness: 0.92,
    roughness: 0.24,
    anisotropy: 0.8,
    clearcoat: 0.2,
  });

  const antiqueBronze = new THREE.MeshStandardMaterial({
    color: 0x6f5534,
    roughnessMap: textures.brassRoughness,
    metalness: 0.82,
    roughness: 0.42,
  });

  const damascusSteel = new THREE.MeshPhysicalMaterial({
    color: 0xc2c8d1,
    metalness: 0.9,
    roughness: 0.22,
    anisotropy: 0.7,
    clearcoat: 0.35,
  });

  const polishedWalnut = new THREE.MeshStandardMaterial({
    color: 0x6c432b,
    map: textures.walnutMap,
    metalness: 0.04,
    roughness: 0.48,
  });

  const agedPorcelain = new THREE.MeshPhysicalMaterial({
    color: 0xf0ebe1,
    map: textures.porcelainKintsugiMap,
    metalness: 0.02,
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });

  const anthraciteBasalt = new THREE.MeshStandardMaterial({
    color: 0x1e2026,
    metalness: 0.08,
    roughness: 0.82,
  });

  const moltenKintsugiGold = new THREE.MeshStandardMaterial({
    color: 0xf4c752,
    metalness: 0.96,
    roughness: 0.12,
    emissive: new THREE.Color(0xc98b14),
    emissiveIntensity: 0.72,
  });

  const goldenThread = new THREE.MeshStandardMaterial({
    color: 0xffd875,
    metalness: 0.85,
    roughness: 0.18,
    emissive: new THREE.Color(0xdca022),
    emissiveIntensity: 0.95,
  });

  const vitrailGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: textures.vitrailMap,
    metalness: 0.05,
    roughness: 0.12,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: isSoftwareGl ? 0.78 : 1.0,
    ior: 1.54,
    thickness: 0.6,
    clearcoat: 1.0,
    side: THREE.DoubleSide,
  });

  const sapphireCrystal = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    metalness: 0.0,
    roughness: 0.04,
    transmission: isSoftwareGl ? 0 : 0.92,
    transparent: true,
    opacity: isSoftwareGl ? 0.34 : 1.0,
    ior: 1.77,
    thickness: 1.2,
    clearcoat: 1.0,
    depthWrite: false,
  });

  const chronometerDial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.chronometerDialMap,
    metalness: 0.35,
    roughness: 0.36,
  });

  const parchmentIvory = new THREE.MeshStandardMaterial({
    color: 0xd8cdb8,
    metalness: 0.02,
    roughness: 0.74,
  });

  const obsidianCore = new THREE.MeshPhysicalMaterial({
    color: 0x161822,
    metalness: 0.25,
    roughness: 0.18,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
  });

  const all = [
    brushedBrass,
    antiqueBronze,
    damascusSteel,
    polishedWalnut,
    agedPorcelain,
    anthraciteBasalt,
    moltenKintsugiGold,
    goldenThread,
    vitrailGlass,
    sapphireCrystal,
    chronometerDial,
    parchmentIvory,
    obsidianCore,
  ];

  return {
    brushedBrass,
    antiqueBronze,
    damascusSteel,
    polishedWalnut,
    agedPorcelain,
    anthraciteBasalt,
    moltenKintsugiGold,
    goldenThread,
    vitrailGlass,
    sapphireCrystal,
    chronometerDial,
    parchmentIvory,
    obsidianCore,
    dispose: () => {
      all.forEach((m) => m.dispose());
    },
  };
}
