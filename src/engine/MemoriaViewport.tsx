import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ChevronDown, ChevronUp, Volume2, VolumeX, Sparkles, Hammer, Scissors, Layers } from 'lucide-react';
import { PALACES, type PalaceId } from '../data/memoriaData';
import { createProceduralTextures } from './proceduralTextures';
import { createArtisanMaterials } from './materials';
import { buildPalaceScene, type BuiltPalace } from './palaceBuilders';
import type { MemoriaAudioEngine } from './audioEngine';

// Pre-allocated math helpers outside render loop (Zero-GC)
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3(6.4, 4.2, 7.6);
const _targetLookAt = new THREE.Vector3(0, 1.5, 0);

interface MemoriaViewportProps {
  activePalace: PalaceId;
  onSelectPalace: (id: PalaceId) => void;
  integrity: number;
  onIntegrityChange: (val: number) => void;
  spoolLevel: number;
  onSpoolChange: (val: number) => void;
  audioEngine: MemoriaAudioEngine;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const MemoriaViewport: React.FC<MemoriaViewportProps> = ({
  activePalace,
  onSelectPalace,
  integrity,
  onIntegrityChange,
  spoolLevel,
  onSpoolChange,
  audioEngine,
  audioEnabled,
  onToggleAudio,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [stitchAnchorLabel, setStitchAnchorLabel] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Mutable refs for WebGL loop without re-creating renderer
  const stateRef = useRef({
    activePalace,
    targetIntegrity: integrity,
    currentIntegrity: integrity,
    targetExplode: 0,
    currentExplode: 0,
    cameraTweening: false,
  });

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    mats: ReturnType<typeof createArtisanMaterials>;
    palaceGroup: THREE.Group;
    builtPalace: BuiltPalace | null;
    stitchGroup: THREE.Group;
    stitchGeometries: THREE.BufferGeometry[];
    firstAnchorObj: THREE.Object3D | null;
    rebuildPalace: (id: PalaceId) => void;
    weaveThreadBetween: (a: THREE.Object3D, b: THREE.Object3D) => void;
    clearThreads: () => void;
  } | null>(null);

  // Keep refs synced with props
  useEffect(() => {
    stateRef.current.targetIntegrity = integrity;
    audioEngine.setIntegrity(integrity);
  }, [integrity, audioEngine]);

  useEffect(() => {
    stateRef.current.targetExplode = explodeFactor;
  }, [explodeFactor]);

  // Keyboard shortcut 'H' for Zero-UI Diegetic Mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (document.activeElement?.tagName !== 'INPUT') {
          setDockCollapsed((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Switch palace inside existing Three.js scene
  useEffect(() => {
    stateRef.current.activePalace = activePalace;
    const spec = PALACES.find((p) => p.id === activePalace);
    if (spec) {
      _targetCamPos.set(...spec.cameraPos);
      _targetLookAt.set(...spec.cameraTarget);
      stateRef.current.cameraTweening = true;
    }
    if (sceneRefs.current) {
      sceneRefs.current.rebuildPalace(activePalace);
    }
    setStitchAnchorLabel(null);
  }, [activePalace]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL probe
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 640;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const bgHex = new THREE.Color('#0C0D10');
    scene.background = bgHex;
    scene.fog = new THREE.FogExp2('#0C0D10', 0.032);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 80);
    camera.position.set(6.4, 4.2, 7.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.0;
    controls.maxDistance = 14.5;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 1.5, 0);
    controls.addEventListener('start', () => {
      stateRef.current.cameraTweening = false;
    });

    // Studio Environment Reflection (RoomEnvironment on all devices)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xaab8d6, 0x261d14, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe6ba, 2.35);
    keyLight.position.set(6.5, 9.5, 6.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6d93c9, 1.2);
    rimLight.position.set(-7.0, 5.0, -6.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffdf9e, 3.2, 5, 2.5);
      softbox.position.set(0, 6.5, 5.0);
      softbox.lookAt(0, 1.6, 0);
      scene.add(softbox);
    }

    // Procedural Textures & Materials
    const textures = createProceduralTextures(renderer.capabilities.getMaxAnisotropy());
    const mats = createArtisanMaterials(textures, isSoftwareGl);

    // Architectural Studio Floor & Radial Contact Shadow
    const floorGeo = new THREE.CircleGeometry(22, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e1014,
      roughness: 0.88,
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const contactGeo = new THREE.PlaneGeometry(8.5, 8.5);
    const contactMat = new THREE.MeshBasicMaterial({
      map: textures.contactShadowMap,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const contactPlane = new THREE.Mesh(contactGeo, contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.005;
    scene.add(contactPlane);

    // Subtle floating golden memory dust motes (InstancedMesh)
    const moteGeo = new THREE.OctahedronGeometry(0.024, 0);
    const moteCount = 64;
    const motes = new THREE.InstancedMesh(moteGeo, mats.goldenThread, moteCount);
    const dummy = new THREE.Object3D();
    const moteSeeds: Array<{ r: number; y: number; phase: number; speed: number }> = [];
    for (let i = 0; i < moteCount; i++) {
      const seed = {
        r: 2.2 + Math.random() * 3.8,
        y: 0.5 + Math.random() * 4.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.25,
      };
      moteSeeds.push(seed);
      dummy.position.set(
        Math.cos(seed.phase) * seed.r,
        seed.y,
        Math.sin(seed.phase) * seed.r,
      );
      dummy.scale.setScalar(0.6 + Math.random() * 0.8);
      dummy.updateMatrix();
      motes.setMatrixAt(i, dummy.matrix);
    }
    motes.instanceMatrix.needsUpdate = true;
    motes.computeBoundingSphere();
    motes.frustumCulled = false;
    scene.add(motes);

    const palaceGroup = new THREE.Group();
    scene.add(palaceGroup);

    const stitchGroup = new THREE.Group();
    scene.add(stitchGroup);
    const stitchGeometries: THREE.BufferGeometry[] = [];

    const clearThreads = () => {
      while (stitchGroup.children.length > 0) {
        stitchGroup.remove(stitchGroup.children[0]);
      }
      stitchGeometries.forEach((g) => g.dispose());
      stitchGeometries.length = 0;
    };

    const weaveThreadBetween = (a: THREE.Object3D, b: THREE.Object3D) => {
      a.getWorldPosition(_vecA);
      b.getWorldPosition(_vecB);
      _mid.addVectors(_vecA, _vecB).multiplyScalar(0.5);
      _mid.y += 0.65;

      const curve = new THREE.CatmullRomCurve3([
        _vecA.clone(),
        _mid.clone(),
        _vecB.clone(),
      ]);
      const geo = new THREE.TubeGeometry(curve, 24, 0.022, 8, false);
      stitchGeometries.push(geo);
      const threadMesh = new THREE.Mesh(geo, mats.goldenThread);
      stitchGroup.add(threadMesh);
    };

    let currentBuilt: BuiltPalace | null = null;

    const rebuildPalace = (id: PalaceId) => {
      clearThreads();
      if (currentBuilt) {
        palaceGroup.remove(currentBuilt.root);
        currentBuilt.dispose();
        currentBuilt = null;
      }
      currentBuilt = buildPalaceScene(id, mats);
      palaceGroup.add(currentBuilt.root);
      if (sceneRefs.current) {
        sceneRefs.current.builtPalace = currentBuilt;
        sceneRefs.current.firstAnchorObj = null;
      }
    };

    sceneRefs.current = {
      scene,
      camera,
      controls,
      mats,
      palaceGroup,
      builtPalace: null,
      stitchGroup,
      stitchGeometries,
      firstAnchorObj: null,
      rebuildPalace,
      weaveThreadBetween,
      clearThreads,
    };

    rebuildPalace(stateRef.current.activePalace);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for Spatial Stitching (click any two architectural fragments)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverCheck = 0;

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 55) return;
      lastHoverCheck = now;
      if (!currentBuilt) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(currentBuilt.root.children, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.fragmentLabel && obj.parent) {
          obj = obj.parent;
        }
        const label = obj?.userData?.fragmentLabel as string | undefined;
        setHoveredPart(label || null);
        renderer.domElement.style.cursor = label ? 'pointer' : 'grab';
      } else {
        setHoveredPart(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6 || !currentBuilt || !sceneRefs.current) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(currentBuilt.root.children, true);
      if (hits.length === 0) return;

      let targetObj: THREE.Object3D | null = hits[0].object;
      while (targetObj && !targetObj.userData.fragmentLabel && targetObj.parent) {
        targetObj = targetObj.parent;
      }
      if (!targetObj || !targetObj.userData.fragmentLabel) return;

      const label = targetObj.userData.fragmentLabel as string;
      const refs = sceneRefs.current;

      if (!refs.firstAnchorObj) {
        refs.firstAnchorObj = targetObj;
        setStitchAnchorLabel(label);
        audioEngine.playFoley('typewriter');
      } else if (refs.firstAnchorObj !== targetObj) {
        refs.weaveThreadBetween(refs.firstAnchorObj, targetObj);
        refs.firstAnchorObj = null;
        setStitchAnchorLabel(null);
        audioEngine.playFoley('stitch');
        onIntegrityChange(Math.min(1, stateRef.current.targetIntegrity + 0.25));
        onSpoolChange(Math.max(12, spoolLevel - 8));
      } else {
        refs.firstAnchorObj = null;
        setStitchAnchorLabel(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Resize Observer
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation loop with software WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Exponentially damp integrity & exploded state
      st.currentIntegrity = THREE.MathUtils.damp(st.currentIntegrity, st.targetIntegrity, 4.5, delta);
      st.currentExplode = THREE.MathUtils.damp(st.currentExplode, st.targetExplode, 5.5, delta);

      const fractureAlpha = 1 - st.currentIntegrity;

      // Smoothly tween camera presets until arrival
      if (st.cameraTweening) {
        camera.position.lerp(_targetCamPos, 1 - Math.exp(-3.8 * delta));
        controls.target.lerp(_targetLookAt, 1 - Math.exp(-3.8 * delta));
        if (camera.position.distanceTo(_targetCamPos) < 0.04) {
          st.cameraTweening = false;
        }
      }
      controls.update();

      // Update Kintsugi seam glow intensity
      mats.moltenKintsugiGold.emissiveIntensity = 0.25 + st.currentIntegrity * 0.9;

      // Update Palace fragments & animated mechanisms
      if (currentBuilt) {
        for (let i = 0; i < currentBuilt.fragments.length; i++) {
          const frag = currentBuilt.fragments[i];
          const hoverFloat = fractureAlpha > 0.05 ? Math.sin(elapsed * 1.4 + i) * 0.06 * fractureAlpha : 0;
          frag.mesh.position.set(
            frag.homePos.x + frag.fractureOffset.x * fractureAlpha + frag.explodeOffset.x * st.currentExplode,
            frag.homePos.y + frag.fractureOffset.y * fractureAlpha + frag.explodeOffset.y * st.currentExplode + hoverFloat,
            frag.homePos.z + frag.fractureOffset.z * fractureAlpha + frag.explodeOffset.z * st.currentExplode,
          );
          frag.mesh.rotation.set(
            frag.homeRot.x + frag.fractureRot.x * fractureAlpha,
            frag.homeRot.y + frag.fractureRot.y * fractureAlpha,
            frag.homeRot.z + frag.fractureRot.z * fractureAlpha,
          );
        }

        for (let i = 0; i < currentBuilt.animatedParts.length; i++) {
          currentBuilt.animatedParts[i].update(elapsed, st.currentIntegrity);
        }
      }

      // Gently orbit floating golden memory dust motes
      for (let i = 0; i < moteCount; i++) {
        const s = moteSeeds[i];
        const angle = s.phase + elapsed * s.speed;
        dummy.position.set(
          Math.cos(angle) * s.r,
          s.y + Math.sin(elapsed * 0.8 + s.phase) * 0.18,
          Math.sin(angle) * s.r,
        );
        dummy.rotation.set(elapsed * 0.5, angle, 0);
        dummy.scale.setScalar(0.45 + st.currentIntegrity * 0.55);
        dummy.updateMatrix();
        motes.setMatrixAt(i, dummy.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      clearThreads();
      if (currentBuilt) {
        currentBuilt.dispose();
      }
      floorGeo.dispose();
      floorMat.dispose();
      contactGeo.dispose();
      contactMat.dispose();
      moteGeo.dispose();
      envRT.dispose();
      mats.dispose();
      textures.dispose();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFracture = () => {
    onIntegrityChange(0.15);
    sceneRefs.current?.clearThreads();
    audioEngine.playFoley('fracture');
  };

  const handleRestore = () => {
    onIntegrityChange(1.0);
    onSpoolChange(100);
    setExplodeFactor(0);
    audioEngine.playFoley('orchestra');
  };

  const handleAutoStitch = () => {
    const refs = sceneRefs.current;
    if (!refs || !refs.builtPalace || refs.builtPalace.fragments.length < 2) return;
    const frags = refs.builtPalace.fragments;
    const idxA = Math.floor(Math.random() * frags.length);
    let idxB = Math.floor(Math.random() * frags.length);
    if (idxB === idxA) idxB = (idxA + 1) % frags.length;
    refs.weaveThreadBetween(frags[idxA].mesh, frags[idxB].mesh);
    onIntegrityChange(Math.min(1, integrity + 0.25));
    onSpoolChange(Math.max(15, spoolLevel - 10));
    audioEngine.playFoley('stitch');
  };

  const currentSpec = PALACES.find((p) => p.id === activePalace) || PALACES[0];
  const integrityPct = Math.round(integrity * 100);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[640px] bg-[#0C0D10] overflow-hidden select-none">
      {/* Dedicated WebGL Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Context Lost Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0C0D10]/95 p-8 text-center">
          <p className="font-display text-2xl text-[#F2EFE9]">3D Sahne Bağlamı Yenileniyor</p>
          <p className="mt-2 max-w-md text-sm text-[#9E9A92]">
            Grafik bağlamı geçici olarak duraklatıldı. Sayfayı yenileyerek Kintsugi sahnesini geri yükleyebilirsiniz.
          </p>
        </div>
      )}

      {/* Minimal Top-Left Curatorial Spec Overlay (Zero Center Occlusion, No Pulsing Dots) */}
      <div className="pointer-events-none absolute top-6 left-6 z-10 max-w-md">
        <div className="flex items-center gap-2 text-xs text-[#9E9A92]">
          <span className="font-mono-tabular text-[#D4A843]">Katman {currentSpec.index}</span>
          <span aria-hidden="true">·</span>
          <span>{currentSpec.titleEn}</span>
        </div>
        <h1 className="mt-1 font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#F2EFE9] leading-tight">
          {currentSpec.titleTr}
        </h1>
        <p className="mt-1 text-xs text-[#9E9A92]">
          {stitchAnchorLabel
            ? `İlk nokta seçildi: ${stitchAnchorLabel} — İkinci parçaya tıklayarak Zaman Dikişi örün.`
            : hoveredPart
              ? `Seçilebilir Parça: ${hoveredPart} (Zaman Dikişi için tıklayın)`
              : 'Döndürmek için sürükleyin · Zaman-Mekân Dikişi için iki parçaya tıklayın'}
        </p>
      </div>

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className="absolute bottom-5 left-1/2 z-20 w-[min(940px,94vw)] -translate-x-1/2 transition-transform duration-300 ease-out"
        style={{
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% + 4px))'
            : 'translate(-50%, 0)',
        }}
      >
        {/* Collapse / Zen Mode Toggle Tab */}
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-t-lg border border-b-0 border-white/10 bg-[#14161B]/95 px-4 py-1.5 text-xs font-medium text-[#D6D1C7] hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            style={{
              transform: dockCollapsed ? 'translateY(-40px)' : 'none',
            }}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-[#D4A843]" />
                <span>Kontrolleri Göster (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-[#D4A843]" />
                <span>Sıfır-Arayüz Modu (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Solid/RGBA Control Bar (No backdrop-filter over WebGL) */}
        <div className="pointer-events-auto rounded-xl border border-white/10 bg-[#14161B]/95 px-4 py-3 shadow-2xl">
          {/* Row 1: 5 Memory Palace Tabs + Diegetic Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-1 overflow-x-auto">
              {PALACES.map((palace) => {
                const isActive = palace.id === activePalace;
                return (
                  <button
                    key={palace.id}
                    type="button"
                    onClick={() => onSelectPalace(palace.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#D4A843] text-[#0C0D10]'
                        : 'text-[#9E9A92] hover:text-[#F2EFE9] hover:bg-white/5'
                    }`}
                  >
                    {palace.index}. {palace.titleTr.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-[#9E9A92] shrink-0">
              <div className="flex items-center gap-1.5">
                <span>Kronometre Bütünlüğü:</span>
                <span className="font-mono-tabular font-medium text-[#E5BC5E]">{integrityPct}%</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span>Altın İplik Makarası:</span>
                <span className="font-mono-tabular font-medium text-[#F2EFE9]">{spoolLevel}%</span>
              </div>
            </div>
          </div>

          {/* Row 2: Kinetic Actions, Exploded View Slider & Audio Toggle */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRestore}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#D4A843] px-3.5 py-1.5 text-xs font-semibold text-[#0C0D10] hover:bg-[#E5BC5E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Altınla Onar</span>
              </button>

              <button
                type="button"
                onClick={handleAutoStitch}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#1C1F26] px-3.5 py-1.5 text-xs font-medium text-[#F2EFE9] hover:border-[#D4A843]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Scissors className="h-3.5 w-3.5 text-[#D4A843]" />
                <span>Zaman-Mekân Dikişi</span>
              </button>

              <button
                type="button"
                onClick={handleFracture}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#1C1F26] px-3.5 py-1.5 text-xs font-medium text-[#F2EFE9] hover:border-red-400/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Hammer className="h-3.5 w-3.5 text-[#D6D1C7]" />
                <span>Parçala</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-[#9E9A92]">
                <Layers className="h-3.5 w-3.5 text-[#D4A843]" />
                <span className="whitespace-nowrap">Katman Ayrımı</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explodeFactor}
                  onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                  aria-label="Mimari katman ayrımı"
                  className="w-24 accent-[#D4A843] cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={onToggleAudio}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  audioEnabled
                    ? 'border-[#D4A843]/60 bg-[#D4A843]/15 text-[#E5BC5E]'
                    : 'border-white/15 bg-[#1C1F26] text-[#9E9A92] hover:text-[#F2EFE9]'
                }`}
              >
                {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{audioEnabled ? 'Akustik Açık' : 'Akustik Ses'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
