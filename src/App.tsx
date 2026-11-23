import { useEffect, useMemo, useRef, useState } from 'react';
import { type PalaceId } from './data/memoriaData';
import { MemoriaAudioEngine } from './engine/audioEngine';
import { MemoriaViewport } from './engine/MemoriaViewport';
import { ArtisanGearSection } from './components/ArtisanGearSection';
import { PalacesAtlasSection } from './components/PalacesAtlasSection';
import { FoleyAndManifestoSection } from './components/FoleyAndManifestoSection';

export default function App() {
  const [activePalace, setActivePalace] = useState<PalaceId>('scriptorium');
  const [integrity, setIntegrity] = useState<number>(1.0);
  const [spoolLevel, setSpoolLevel] = useState<number>(100);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const audioEngine = useMemo(() => new MemoriaAudioEngine(), []);

  useEffect(() => {
    return () => {
      audioEngine.dispose();
    };
  }, [audioEngine]);

  const handleSelectPalace = (id: PalaceId) => {
    setActivePalace(id);
    setIntegrity(1.0);
    setSpoolLevel(100);
    if (id === 'musicbox') {
      audioEngine.playFoley('musicbox');
    } else if (id === 'scriptorium') {
      audioEngine.playFoley('typewriter');
    } else if (id === 'tapestry') {
      audioEngine.playFoley('shuttle');
    } else if (id === 'vitrail') {
      audioEngine.playFoley('porcelain');
    } else {
      audioEngine.playFoley('orchestra');
    }
  };

  const handleOpenIn3D = (id: PalaceId) => {
    handleSelectPalace(id);
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleAudio = () => {
    const enabled = audioEngine.toggle();
    setAudioEnabled(enabled);
  };

  const scrollToStage = () => {
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F2EFE9]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0C0D10]/95">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#sahne"
            className="font-display text-xl font-semibold tracking-tight text-[#F2EFE9] whitespace-nowrap shrink-0"
          >
            Memoria Mechanica
          </a>

          {/* Zone 2: 4 Concise Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9E9A92]">
            <a
              href="#sahne"
              className="hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
            >
              Atölye 3D
            </a>
            <a
              href="#techizat"
              className="hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
            >
              Teçhizat
            </a>
            <a
              href="#saraylar"
              className="hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
            >
              Saraylar
            </a>
            <a
              href="#manifesto"
              className="hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
            >
              Manifesto
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={scrollToStage}
              className="rounded-md bg-[#D4A843] px-4 py-2 text-xs font-semibold text-[#0C0D10] hover:bg-[#E5BC5E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              3D Sahnede İncele
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Interactive 3D WebGL Memory Architecture & Kintsugi Stage */}
        <section id="sahne" ref={stageRef}>
          <MemoriaViewport
            activePalace={activePalace}
            onSelectPalace={handleSelectPalace}
            integrity={integrity}
            onIntegrityChange={setIntegrity}
            spoolLevel={spoolLevel}
            onSpoolChange={setSpoolLevel}
            audioEngine={audioEngine}
            audioEnabled={audioEnabled}
            onToggleAudio={handleToggleAudio}
          />
        </section>

        {/* Master Restorer Enes Öztürk & Diegetic Arsenal */}
        <ArtisanGearSection
          activePalace={activePalace}
          integrity={integrity}
          spoolLevel={spoolLevel}
          onSelectPalace={handleOpenIn3D}
        />

        {/* 5 Hand-Sculpted Memory Palaces Atlas */}
        <PalacesAtlasSection
          activePalace={activePalace}
          onOpenIn3D={handleOpenIn3D}
        />

        {/* Acoustic Foley Studio & Project Manifesto */}
        <FoleyAndManifestoSection audioEngine={audioEngine} />
      </main>

      {/* Quiet Archival Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#9E9A92]">
          <p>
            Memoria Mechanica: The Sovereign Weaver · Yazar ve Baş Mimar: Enes Öztürk
          </p>
          <p>%100 Şahsi Fikri Mülkiyet · Enes-Magnum Mimarisi</p>
        </div>
      </footer>
    </div>
  );
}
