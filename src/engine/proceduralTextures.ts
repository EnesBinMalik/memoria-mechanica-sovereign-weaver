import * as THREE from 'three';

export interface ProceduralTextureSet {
  brassMap: THREE.CanvasTexture;
  brassRoughness: THREE.CanvasTexture;
  walnutMap: THREE.CanvasTexture;
  porcelainKintsugiMap: THREE.CanvasTexture;
  chronometerDialMap: THREE.CanvasTexture;
  vitrailMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  return [canvas, ctx];
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const aniso = Math.min(Math.max(maxAnisotropy, 1), 8);

  // 1. Brushed Brass Albedo + Roughness
  const [brassCanvas, bCtx] = makeCanvas(512, 512);
  bCtx.fillStyle = '#B89242';
  bCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y++) {
    const streak = 14 + Math.sin(y * 0.37) * 10 + (Math.random() - 0.5) * 18;
    bCtx.fillStyle = `rgba(${210 + streak}, ${165 + streak * 0.7}, ${75 + streak * 0.3}, 0.22)`;
    bCtx.fillRect(0, y, 512, 1);
  }
  const brassMap = new THREE.CanvasTexture(brassCanvas);
  brassMap.colorSpace = THREE.SRGBColorSpace;
  brassMap.wrapS = THREE.RepeatWrapping;
  brassMap.wrapT = THREE.RepeatWrapping;
  brassMap.anisotropy = aniso;

  const [brassRoughCanvas, brCtx] = makeCanvas(256, 256);
  brCtx.fillStyle = '#484848';
  brCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    const v = Math.floor(55 + Math.random() * 45);
    brCtx.fillStyle = `rgb(${v},${v},${v})`;
    brCtx.fillRect(0, y, 256, 1);
  }
  const brassRoughness = new THREE.CanvasTexture(brassRoughCanvas);
  brassRoughness.colorSpace = THREE.NoColorSpace;
  brassRoughness.wrapS = THREE.RepeatWrapping;
  brassRoughness.wrapT = THREE.RepeatWrapping;

  // 2. Polished Walnut Wood Grain
  const [walnutCanvas, wCtx] = makeCanvas(512, 512);
  wCtx.fillStyle = '#3F2719';
  wCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) {
    const y = (i / 160) * 512;
    wCtx.strokeStyle = i % 3 === 0 ? 'rgba(28, 16, 10, 0.45)' : 'rgba(92, 58, 36, 0.28)';
    wCtx.lineWidth = 1.5 + Math.random() * 3;
    wCtx.beginPath();
    wCtx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      wCtx.lineTo(x, y + Math.sin(x * 0.02 + i * 0.4) * 5);
    }
    wCtx.stroke();
  }
  const walnutMap = new THREE.CanvasTexture(walnutCanvas);
  walnutMap.colorSpace = THREE.SRGBColorSpace;
  walnutMap.wrapS = THREE.RepeatWrapping;
  walnutMap.wrapT = THREE.RepeatWrapping;
  walnutMap.anisotropy = aniso;

  // 3. Aged Porcelain with subtle hairline crazing
  const [porcelainCanvas, pCtx] = makeCanvas(512, 512);
  pCtx.fillStyle = '#EAE4D8';
  pCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 24; i++) {
    pCtx.strokeStyle = 'rgba(130, 120, 108, 0.25)';
    pCtx.lineWidth = 1;
    pCtx.beginPath();
    let cx = Math.random() * 512;
    let cy = Math.random() * 512;
    pCtx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 90;
      cy += (Math.random() - 0.5) * 90;
      pCtx.lineTo(cx, cy);
    }
    pCtx.stroke();
  }
  const porcelainKintsugiMap = new THREE.CanvasTexture(porcelainCanvas);
  porcelainKintsugiMap.colorSpace = THREE.SRGBColorSpace;
  porcelainKintsugiMap.anisotropy = aniso;

  // 4. Crystal Heart Chronometer Engraved Dial
  const [dialCanvas, dCtx] = makeCanvas(512, 512);
  dCtx.fillStyle = '#151820';
  dCtx.fillRect(0, 0, 512, 512);
  dCtx.translate(256, 256);

  // Outer brass chapter rings
  dCtx.strokeStyle = '#D4A843';
  dCtx.lineWidth = 4;
  dCtx.beginPath();
  dCtx.arc(0, 0, 232, 0, Math.PI * 2);
  dCtx.stroke();

  dCtx.lineWidth = 1.5;
  dCtx.beginPath();
  dCtx.arc(0, 0, 184, 0, Math.PI * 2);
  dCtx.stroke();

  // 60 precision tick marks
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const isHour = i % 5 === 0;
    const r0 = isHour ? 202 : 216;
    const r1 = 226;
    dCtx.strokeStyle = isHour ? '#E9C46A' : 'rgba(212, 168, 67, 0.55)';
    dCtx.lineWidth = isHour ? 3 : 1.2;
    dCtx.beginPath();
    dCtx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    dCtx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    dCtx.stroke();
  }

  // Roman numeral markers
  const romans = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  dCtx.fillStyle = '#F2EFE9';
  dCtx.font = '600 22px Georgia, serif';
  dCtx.textAlign = 'center';
  dCtx.textBaseline = 'middle';
  romans.forEach((num, idx) => {
    const angle = (idx / 12) * Math.PI * 2 - Math.PI / 2;
    dCtx.fillText(num, Math.cos(angle) * 160, Math.sin(angle) * 160);
  });

  // Filigree compass lines
  dCtx.strokeStyle = 'rgba(212, 168, 67, 0.35)';
  dCtx.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    dCtx.beginPath();
    dCtx.moveTo(0, 0);
    dCtx.lineTo(Math.cos(a) * 135, Math.sin(a) * 135);
    dCtx.stroke();
  }
  const chronometerDialMap = new THREE.CanvasTexture(dialCanvas);
  chronometerDialMap.colorSpace = THREE.SRGBColorSpace;
  chronometerDialMap.anisotropy = aniso;

  // 5. Stained Glass Vitrail Rose Pattern
  const [vitrailCanvas, vCtx] = makeCanvas(512, 512);
  vCtx.fillStyle = '#182438';
  vCtx.fillRect(0, 0, 512, 512);
  const palette = ['#2B5B9E', '#B84A39', '#D4A843', '#2E7D6B', '#4A3B7C'];
  const cx = 256;
  const cy = 256;
  for (let ring = 3; ring >= 1; ring--) {
    const count = ring * 8;
    const radius = ring * 78;
    for (let i = 0; i < count; i++) {
      const a0 = (i / count) * Math.PI * 2;
      const a1 = ((i + 1) / count) * Math.PI * 2;
      vCtx.fillStyle = palette[(i + ring) % palette.length];
      vCtx.beginPath();
      vCtx.moveTo(cx, cy);
      vCtx.arc(cx, cy, radius, a0, a1);
      vCtx.closePath();
      vCtx.fill();
      vCtx.strokeStyle = '#161412';
      vCtx.lineWidth = 4;
      vCtx.stroke();
    }
  }
  const vitrailMap = new THREE.CanvasTexture(vitrailCanvas);
  vitrailMap.colorSpace = THREE.SRGBColorSpace;
  vitrailMap.anisotropy = aniso;

  // 6. Radial Contact Shadow
  const [shadowCanvas, sCtx] = makeCanvas(256, 256);
  const grad = sCtx.createRadialGradient(128, 128, 16, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);
  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);
  contactShadowMap.colorSpace = THREE.SRGBColorSpace;

  return {
    brassMap,
    brassRoughness,
    walnutMap,
    porcelainKintsugiMap,
    chronometerDialMap,
    vitrailMap,
    contactShadowMap,
    dispose: () => {
      brassMap.dispose();
      brassRoughness.dispose();
      walnutMap.dispose();
      porcelainKintsugiMap.dispose();
      chronometerDialMap.dispose();
      vitrailMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
