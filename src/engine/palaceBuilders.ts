import * as THREE from 'three';
import type { PalaceId } from '../data/memoriaData';
import type { ArtisanMaterialLibrary } from './materials';

export interface FragmentNode {
  mesh: THREE.Object3D;
  homePos: THREE.Vector3;
  homeRot: THREE.Euler;
  fractureOffset: THREE.Vector3;
  fractureRot: THREE.Euler;
  explodeOffset: THREE.Vector3;
  label: string;
}

export interface BuiltPalace {
  root: THREE.Group;
  fragments: FragmentNode[];
  kintsugiSeams: THREE.Mesh[];
  animatedParts: Array<{ obj: THREE.Object3D; update: (elapsed: number, integrity: number) => void }>;
  dispose: () => void;
}

function registerFragment(
  fragments: FragmentNode[],
  obj: THREE.Object3D,
  fractureOffset: [number, number, number],
  fractureRot: [number, number, number],
  explodeOffset: [number, number, number],
  label: string,
): void {
  obj.traverse((child) => {
    child.layers.enable(1);
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  obj.userData.fragmentLabel = label;
  fragments.push({
    mesh: obj,
    homePos: obj.position.clone(),
    homeRot: obj.rotation.clone(),
    fractureOffset: new THREE.Vector3(...fractureOffset),
    fractureRot: new THREE.Euler(...fractureRot),
    explodeOffset: new THREE.Vector3(...explodeOffset),
    label,
  });
}

function createKintsugiVeinRing(
  radius: number,
  tube: number,
  mats: ArtisanMaterialLibrary,
  seams: THREE.Mesh[],
): THREE.Mesh {
  const geo = new THREE.TorusGeometry(radius, tube, 10, 48);
  const mesh = new THREE.Mesh(geo, mats.moltenKintsugiGold);
  mesh.rotation.x = Math.PI / 2;
  seams.push(mesh);
  return mesh;
}

function createArchShape(outerW: number, outerH: number, thickness: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = outerW / 2;
  shape.moveTo(-hw, 0);
  shape.lineTo(-hw, outerH * 0.55);
  shape.absarc(0, outerH * 0.55, hw, Math.PI, 0, true);
  shape.lineTo(hw, 0);
  shape.lineTo(hw - thickness, 0);
  shape.lineTo(hw - thickness, outerH * 0.55);
  shape.absarc(0, outerH * 0.55, hw - thickness, 0, Math.PI, false);
  shape.lineTo(-hw + thickness, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -0.21);
  return geo;
}

function createGearGeometry(radius: number, teeth: number, thickness: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const innerR = radius * 0.84;
  const outerR = radius;
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.25;
    const a2 = a0 + step * 0.5;
    const a3 = a0 + step * 0.75;

    const p0x = Math.cos(a0) * innerR;
    const p0y = Math.sin(a0) * innerR;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);

    shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
    shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
    shape.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
  }
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 0.32, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 1,
  });
  geo.translate(0, 0, -thickness / 2);
  return geo;
}

export function buildPalaceScene(
  palaceId: PalaceId,
  mats: ArtisanMaterialLibrary,
): BuiltPalace {
  const root = new THREE.Group();
  const fragments: FragmentNode[] = [];
  const kintsugiSeams: THREE.Mesh[] = [];
  const animatedParts: BuiltPalace['animatedParts'] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // Common carved basalt plinth base (grounded at y = 0)
  const plinthBaseGeo = trackGeo(new THREE.CylinderGeometry(3.2, 3.55, 0.34, 48));
  const plinthBase = new THREE.Mesh(plinthBaseGeo, mats.anthraciteBasalt);
  plinthBase.position.y = 0.17;
  plinthBase.receiveShadow = true;
  root.add(plinthBase);

  const brassTrimGeo = trackGeo(new THREE.TorusGeometry(3.22, 0.045, 12, 64));
  const brassTrim = new THREE.Mesh(brassTrimGeo, mats.brushedBrass);
  brassTrim.rotation.x = Math.PI / 2;
  brassTrim.position.y = 0.34;
  root.add(brassTrim);

  // Kintsugi inlay ring on plinth floor
  const floorVein = createKintsugiVeinRing(2.15, 0.022, mats, kintsugiSeams);
  floorVein.position.y = 0.35;
  trackGeo(floorVein.geometry);
  root.add(floorVein);

  if (palaceId === 'scriptorium') {
    // 1. SONSUIZ KÜTÜPHANE VE DAKTİLO KATEDRALİ
    const archGeo = trackGeo(createArchShape(3.1, 3.8, 0.36));
    const leftArch = new THREE.Mesh(archGeo, mats.agedPorcelain);
    leftArch.position.set(-0.65, 0.34, -0.4);
    leftArch.rotation.y = 0.28;
    root.add(leftArch);
    registerFragment(fragments, leftArch, [-1.4, 0.65, -0.8], [0.22, 0.35, -0.35], [-0.9, 0.3, -0.3], 'Yazma Kemer Sol Kanat');

    const rightArch = new THREE.Mesh(archGeo, mats.agedPorcelain);
    rightArch.position.set(0.65, 0.34, -0.4);
    rightArch.rotation.y = -0.28;
    root.add(rightArch);
    registerFragment(fragments, rightArch, [1.35, 0.72, -0.7], [-0.2, -0.3, 0.38], [0.9, 0.3, -0.3], 'Yazma Kemer Sağ Kanat');

    // Central mechanical typewriter key platforms (5 stepped brass keys)
    const keyStemGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 0.85, 16));
    const keyCapGeo = trackGeo(new THREE.CylinderGeometry(0.42, 0.46, 0.14, 24));
    const keyRingGeo = trackGeo(new THREE.TorusGeometry(0.43, 0.025, 10, 32));

    for (let i = 0; i < 5; i++) {
      const keyGroup = new THREE.Group();
      const stem = new THREE.Mesh(keyStemGeo, mats.antiqueBronze);
      stem.position.y = 0.42;
      const cap = new THREE.Mesh(keyCapGeo, mats.parchmentIvory);
      cap.position.y = 0.88;
      const bezel = new THREE.Mesh(keyRingGeo, mats.brushedBrass);
      bezel.rotation.x = Math.PI / 2;
      bezel.position.y = 0.94;
      keyGroup.add(stem, cap, bezel);

      const angle = ((i - 2) / 2) * 0.65;
      keyGroup.position.set(Math.sin(angle) * 1.45, 0.34 + i * 0.24, Math.cos(angle) * 1.1 - 0.15);
      root.add(keyGroup);

      registerFragment(
        fragments,
        keyGroup,
        [(i - 2) * 0.55, 0.45 + i * 0.18, 0.9],
        [0.3, (i - 2) * 0.25, -0.2],
        [(i - 2) * 0.35, 0.5 + i * 0.2, 0.45],
        `Mekanik Daktilo Tuşu #${i + 1}`,
      );

      animatedParts.push({
        obj: keyGroup,
        update: (elapsed, integrity) => {
          if (integrity > 0.85) {
            cap.position.y = 0.88 + Math.sin(elapsed * 2.2 + i * 1.1) * 0.04;
          }
        },
      });
    }

    // Instanced antique manuscript folios stacked along tower spires
    const bookGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.07, 0.22));
    const bookCount = 48;
    const books = new THREE.InstancedMesh(bookGeo, mats.polishedWalnut, bookCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < bookCount; i++) {
      const side = i % 2 === 0 ? -1.75 : 1.75;
      const stackIdx = Math.floor(i / 2);
      dummy.position.set(
        side + Math.sin(stackIdx * 0.7) * 0.12,
        0.4 + stackIdx * 0.12,
        -0.55 + Math.cos(stackIdx * 0.5) * 0.15,
      );
      dummy.rotation.set(0, stackIdx * 0.18, 0);
      dummy.scale.setScalar(0.88 + (i % 4) * 0.08);
      dummy.updateMatrix();
      books.setMatrixAt(i, dummy.matrix);
    }
    books.instanceMatrix.needsUpdate = true;
    books.computeBoundingSphere();
    books.castShadow = true;
    books.receiveShadow = true;
    root.add(books);

    // Kintsugi Golden Crown Spire
    const spireGeo = trackGeo(new THREE.ConeGeometry(0.38, 1.45, 6));
    const spire = new THREE.Mesh(spireGeo, mats.moltenKintsugiGold);
    spire.position.set(0, 3.65, -0.4);
    root.add(spire);
    kintsugiSeams.push(spire);
    registerFragment(fragments, spire, [0, 1.35, -0.35], [0.45, 0.3, 0.25], [0, 1.25, 0], 'Kintsugi Altın Külahı');
  } else if (palaceId === 'tapestry') {
    // 2. DOKUMA TEZGÂHI VADİSİ
    const beamGeo = trackGeo(new THREE.BoxGeometry(0.26, 3.4, 0.26));
    const crossGeo = trackGeo(new THREE.BoxGeometry(3.4, 0.24, 0.28));
    const rollerGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 24));

    const leftPost = new THREE.Mesh(beamGeo, mats.polishedWalnut);
    leftPost.position.set(-1.55, 2.04, 0);
    root.add(leftPost);
    registerFragment(fragments, leftPost, [-1.3, 0.5, 0.4], [0.15, 0.2, -0.35], [-0.95, 0.2, 0], 'Sol Tezgâh Direği');

    const rightPost = new THREE.Mesh(beamGeo, mats.polishedWalnut);
    rightPost.position.set(1.55, 2.04, 0);
    root.add(rightPost);
    registerFragment(fragments, rightPost, [1.35, 0.55, -0.3], [-0.15, -0.25, 0.32], [0.95, 0.2, 0], 'Sağ Tezgâh Direği');

    const topBeam = new THREE.Mesh(crossGeo, mats.polishedWalnut);
    topBeam.position.set(0, 3.72, 0);
    root.add(topBeam);
    registerFragment(fragments, topBeam, [0, 1.25, 0.5], [0.22, 0.1, -0.2], [0, 1.15, 0], 'Üst Kiriş & Kintsugi Bağlantısı');

    const upperRoller = new THREE.Mesh(rollerGeo, mats.brushedBrass);
    upperRoller.rotation.z = Math.PI / 2;
    upperRoller.position.set(0, 3.15, 0);
    root.add(upperRoller);
    registerFragment(fragments, upperRoller, [0.2, 0.9, -0.7], [-0.1, 0.28, 0.15], [0, 0.75, 0.4], 'Pirinç Çözgü Silindiri');

    animatedParts.push({
      obj: upperRoller,
      update: (elapsed) => {
        upperRoller.rotation.x = elapsed * 0.45;
      },
    });

    // Taut Golden Memory Threads stretched diagonally like a harp/loom
    for (let i = 0; i < 9; i++) {
      const x = -1.2 + i * 0.3;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 0.36, -0.35),
        new THREE.Vector3(x * 0.92, 1.85, 0.15),
        new THREE.Vector3(x, 3.15, 0),
      ]);
      const threadGeo = trackGeo(new THREE.TubeGeometry(curve, 20, 0.016, 8, false));
      const threadMesh = new THREE.Mesh(threadGeo, mats.goldenThread);
      root.add(threadMesh);
      kintsugiSeams.push(threadMesh);
    }

    // Suspended Sculpted Weaver Shuttle in center
    const shuttlePoints = [
      new THREE.Vector2(0, -0.95),
      new THREE.Vector2(0.14, -0.45),
      new THREE.Vector2(0.22, 0),
      new THREE.Vector2(0.14, 0.45),
      new THREE.Vector2(0, 0.95),
    ];
    const shuttleGeo = trackGeo(new THREE.LatheGeometry(shuttlePoints, 24));
    const shuttle = new THREE.Mesh(shuttleGeo, mats.brushedBrass);
    shuttle.rotation.z = Math.PI / 2;
    shuttle.position.set(0, 1.75, 0.35);
    root.add(shuttle);
    registerFragment(fragments, shuttle, [0, 0.4, 1.35], [0.5, 0.6, 0.3], [0, 0.25, 0.9], 'Altın Mekik Gövdesi');

    animatedParts.push({
      obj: shuttle,
      update: (elapsed, integrity) => {
        if (integrity > 0.85) {
          shuttle.position.x = Math.sin(elapsed * 1.4) * 0.85;
        }
      },
    });
  } else if (palaceId === 'vitrail') {
    // 3. KIRIK PORSELEN VE VİTRAY ŞEHRİ
    const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.28, 2.75, 16));
    const pillarOffsets: Array<[number, number]> = [
      [-1.35, 0.55],
      [1.35, 0.55],
      [-1.35, -0.85],
      [1.35, -0.85],
    ];
    pillarOffsets.forEach(([px, pz], idx) => {
      const pillar = new THREE.Mesh(pillarGeo, mats.agedPorcelain);
      pillar.position.set(px, 1.72, pz);
      root.add(pillar);
      registerFragment(
        fragments,
        pillar,
        [px * 0.75, 0.45 + idx * 0.1, pz * 0.85],
        [0.25 * (idx % 2 ? 1 : -1), 0.2, 0.3 * (px > 0 ? 1 : -1)],
        [px * 0.45, 0.35, pz * 0.45],
        `Porselen Sütun #${idx + 1}`,
      );
    });

    // Rose Window Vitrail Medallion
    const frameRingGeo = trackGeo(new THREE.TorusGeometry(1.18, 0.08, 16, 48));
    const frameRing = new THREE.Mesh(frameRingGeo, mats.moltenKintsugiGold);
    frameRing.position.set(0, 2.45, -0.15);
    root.add(frameRing);
    kintsugiSeams.push(frameRing);
    registerFragment(fragments, frameRing, [0, 1.0, -0.6], [0.35, 0.2, 0.15], [0, 0.9, -0.4], 'Altın Vitray Çerçevesi');

    const glassDiscGeo = trackGeo(new THREE.CylinderGeometry(1.12, 1.12, 0.06, 36));
    const glassDisc = new THREE.Mesh(glassDiscGeo, mats.vitrailGlass);
    glassDisc.rotation.x = Math.PI / 2;
    glassDisc.position.set(0, 2.45, -0.15);
    root.add(glassDisc);
    registerFragment(fragments, glassDisc, [0.45, 0.7, 0.85], [-0.3, 0.45, 0.2], [0, 0.9, 0.45], 'El Boyaması Gül Vitray');

    // Fractured Porcelain Altar shards
    const shardGeo = trackGeo(new THREE.OctahedronGeometry(0.55, 0));
    for (let s = 0; s < 3; s++) {
      const shard = new THREE.Mesh(shardGeo, mats.agedPorcelain);
      shard.scale.set(1.1, 0.55, 0.8);
      shard.position.set((s - 1) * 0.7, 0.65, 0.25);
      root.add(shard);
      registerFragment(
        fragments,
        shard,
        [(s - 1) * 0.95, 0.55, 0.95],
        [0.4, 0.6, -0.3],
        [(s - 1) * 0.5, 0.25, 0.65],
        `Çini Porselen Parçası #${s + 1}`,
      );
    }
  } else if (palaceId === 'musicbox') {
    // 4. SUALTI SAAT VE MÜZİK KUTUSU MAHZENİ
    const drumGeo = trackGeo(new THREE.CylinderGeometry(0.88, 0.88, 2.3, 40));
    const drum = new THREE.Mesh(drumGeo, mats.brushedBrass);
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0, 1.55, 0);
    root.add(drum);
    registerFragment(fragments, drum, [0, 0.8, 0.35], [0.18, 0.22, -0.15], [0, 0.75, 0], 'Pirinç Müzik Kutusu Silindiri');

    // Instanced brass pins on cylinder
    const pinGeo = trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8));
    const pinCount = 72;
    const pins = new THREE.InstancedMesh(pinGeo, mats.moltenKintsugiGold, pinCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < pinCount; i++) {
      const row = i % 12;
      const col = Math.floor(i / 12);
      const theta = (i / pinCount) * Math.PI * 2 * 3;
      const xPos = -0.95 + (row / 11) * 1.9;
      const r = 0.92;
      dummy.position.set(xPos, Math.cos(theta + col) * r, Math.sin(theta + col) * r);
      dummy.rotation.set(theta + col, 0, 0);
      dummy.updateMatrix();
      pins.setMatrixAt(i, dummy.matrix);
    }
    pins.instanceMatrix.needsUpdate = true;
    pins.computeBoundingSphere();
    drum.add(pins);

    // Steel resonant comb teeth
    const combBaseGeo = trackGeo(new THREE.BoxGeometry(2.35, 0.18, 0.55));
    const combBase = new THREE.Mesh(combBaseGeo, mats.anthraciteBasalt);
    combBase.position.set(0, 0.95, 1.15);
    root.add(combBase);
    registerFragment(fragments, combBase, [0, 0.3, 1.1], [0.25, 0.15, 0], [0, 0.15, 0.85], 'Çelik Tarak Kaidesi');

    const toothGeo = trackGeo(new THREE.BoxGeometry(0.08, 0.04, 0.62));
    for (let t = 0; t < 14; t++) {
      const tooth = new THREE.Mesh(toothGeo, mats.damascusSteel);
      tooth.position.set(-1.0 + t * 0.155, 1.07, 0.85);
      root.add(tooth);
      registerFragment(
        fragments,
        tooth,
        [(t - 6.5) * 0.18, 0.5 + (t % 3) * 0.15, 1.2],
        [0.4, 0.3, 0.2],
        [(t - 6.5) * 0.06, 0.35, 0.6],
        `Rezonans Dişi #${t + 1}`,
      );
    }

    // Twin side escapement gears
    const gearGeo = trackGeo(createGearGeometry(0.82, 16, 0.14));
    const gearL = new THREE.Mesh(gearGeo, mats.antiqueBronze);
    gearL.rotation.y = Math.PI / 2;
    gearL.position.set(-1.38, 1.55, 0);
    root.add(gearL);
    registerFragment(fragments, gearL, [-1.1, 0.6, -0.4], [0.2, 0.4, -0.3], [-0.9, 0.4, 0], 'Sol Saat Çarkı');

    const gearR = new THREE.Mesh(gearGeo, mats.antiqueBronze);
    gearR.rotation.y = Math.PI / 2;
    gearR.position.set(1.38, 1.55, 0);
    root.add(gearR);
    registerFragment(fragments, gearR, [1.1, 0.6, -0.4], [-0.2, -0.4, 0.3], [0.9, 0.4, 0], 'Sağ Saat Çarkı');

    animatedParts.push({
      obj: drum,
      update: (elapsed, integrity) => {
        const speed = 0.25 + integrity * 0.45;
        drum.rotation.x = elapsed * speed;
        gearL.rotation.x = elapsed * speed;
        gearR.rotation.x = -elapsed * speed;
      },
    });
  } else {
    // 5. UNUTUŞUN KALBİ (THE AMNESIA CORE)
    const coreGeo = trackGeo(new THREE.IcosahedronGeometry(0.68, 1));
    const core = new THREE.Mesh(coreGeo, mats.obsidianCore);
    core.position.set(0, 2.05, 0);
    root.add(core);
    registerFragment(fragments, core, [0, 0.4, 0], [0.5, 0.7, 0.3], [0, 0.5, 0], 'Obsidyen Unutuş Çekirdeği');

    const ringSpecs = [
      { r: 1.25, tube: 0.06, mat: mats.brushedBrass, speed: 0.55, axis: 'x' },
      { r: 1.62, tube: 0.055, mat: mats.moltenKintsugiGold, speed: -0.42, axis: 'y' },
      { r: 1.98, tube: 0.05, mat: mats.damascusSteel, speed: 0.32, axis: 'z' },
    ];
    ringSpecs.forEach((spec, idx) => {
      const rGeo = trackGeo(new THREE.TorusGeometry(spec.r, spec.tube, 16, 64));
      const ring = new THREE.Mesh(rGeo, spec.mat);
      ring.position.set(0, 2.05, 0);
      ring.rotation.set(idx * 0.6, idx * 0.8, 0);
      root.add(ring);
      if (idx === 1) kintsugiSeams.push(ring);
      registerFragment(
        fragments,
        ring,
        [(idx - 1) * 1.1, 0.75 + idx * 0.2, (idx % 2 ? 0.9 : -0.9)],
        [0.4, -0.5, 0.6],
        [(idx - 1) * 0.55, 0.55 + idx * 0.25, 0],
        `Usturlap Halkası #${idx + 1}`,
      );

      animatedParts.push({
        obj: ring,
        update: (elapsed, integrity) => {
          const factor = 0.4 + integrity * 0.8;
          if (spec.axis === 'x') ring.rotation.x = elapsed * spec.speed * factor;
          if (spec.axis === 'y') ring.rotation.y = elapsed * spec.speed * factor;
          if (spec.axis === 'z') ring.rotation.z = elapsed * spec.speed * factor;
        },
      });
    });

    // Floating fractured Kintsugi monoliths around the core
    const monoGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.24, 1.5, 6));
    for (let m = 0; m < 4; m++) {
      const a = (m / 4) * Math.PI * 2 + Math.PI / 4;
      const mono = new THREE.Mesh(monoGeo, mats.agedPorcelain);
      mono.position.set(Math.cos(a) * 2.25, 1.15, Math.sin(a) * 2.25);
      root.add(mono);
      registerFragment(
        fragments,
        mono,
        [Math.cos(a) * 1.1, 0.65, Math.sin(a) * 1.1],
        [0.35, a, -0.25],
        [Math.cos(a) * 0.65, 0.35, Math.sin(a) * 0.65],
        `Zaman-Mekân Dikilitaşı #${m + 1}`,
      );
    }
  }

  // DIEGETIC EQUIPMENT ON PLINTH RIM:
  // A) Kristal Kalp Kronometresi (Front-Right Rim)
  const chronoGroup = new THREE.Group();
  chronoGroup.position.set(2.35, 0.52, 1.75);
  chronoGroup.rotation.y = -0.55;

  const chronoBezel = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.42, 0.46, 0.16, 32)),
    mats.brushedBrass,
  );
  const chronoFace = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.36, 0.36, 0.17, 32)),
    mats.chronometerDial,
  );
  const chronoHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.03, 0.04, 0.28)),
    mats.moltenKintsugiGold,
  );
  chronoHand.position.set(0, 0.1, 0.08);
  const chronoDome = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.37, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)),
    mats.sapphireCrystal,
  );
  chronoDome.position.y = 0.08;
  chronoDome.renderOrder = 10;

  chronoGroup.add(chronoBezel, chronoFace, chronoHand, chronoDome);
  root.add(chronoGroup);

  animatedParts.push({
    obj: chronoHand,
    update: (elapsed, integrity) => {
      // Heartbeat ticks faster when fractured, calm steady sweep when restored
      const rate = 1.2 + (1 - integrity) * 4.5;
      chronoGroup.rotation.z = Math.sin(elapsed * rate) * 0.03;
      chronoHand.rotation.y = -elapsed * (0.8 + (1 - integrity) * 2.5);
    },
  });

  // B) Mekik Kılıcı (Shuttle-Blade) resting cleanly across Front-Left Dais
  const bladeGroup = new THREE.Group();
  bladeGroup.position.set(-2.2, 0.44, 1.85);
  bladeGroup.rotation.set(0, 0.58, 0.06);

  const hilt = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.045, 0.055, 0.42, 16)),
    mats.polishedWalnut,
  );
  hilt.rotation.z = Math.PI / 2;

  const spool = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 20)),
    mats.goldenThread,
  );
  spool.rotation.z = Math.PI / 2;
  spool.position.x = -0.26;
  kintsugiSeams.push(spool);

  const guard = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.14, 0.025, 10, 24)),
    mats.brushedBrass,
  );
  guard.rotation.y = Math.PI / 2;
  guard.position.x = 0.22;

  const blade = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.065, 1.45, 4)),
    mats.damascusSteel,
  );
  blade.rotation.z = -Math.PI / 2;
  blade.scale.set(0.35, 1, 1);
  blade.position.x = 0.95;

  bladeGroup.add(hilt, spool, guard, blade);
  root.add(bladeGroup);

  return {
    root,
    fragments,
    kintsugiSeams,
    animatedParts,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
    },
  };
}
