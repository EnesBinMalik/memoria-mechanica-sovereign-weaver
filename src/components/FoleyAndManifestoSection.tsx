import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { FOLEY_SOUNDS, type FoleySoundSpec } from '../data/memoriaData';
import type { MemoriaAudioEngine } from '../engine/audioEngine';

interface FoleyAndManifestoSectionProps {
  audioEngine: MemoriaAudioEngine;
}

export const FoleyAndManifestoSection: React.FC<FoleyAndManifestoSectionProps> = ({
  audioEngine,
}) => {
  const [lastTriggered, setLastTriggered] = useState<FoleySoundSpec['id'] | null>(null);

  const triggerSound = (id: FoleySoundSpec['id']) => {
    setLastTriggered(id);
    audioEngine.playFoley(id);
  };

  return (
    <section id="manifesto" className="border-t border-white/10 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Part A: Live Instrument & Artisan Foley Audition Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-widest uppercase text-[#9E9A92]">
              03 · Sıfır Sentetik Ses · Zanaat Foley Akustiği
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-[#F2EFE9] leading-tight text-balance">
              Dünyayı Onardıkça Senfoniye Dönüşen Akustik
            </h2>
            <p className="mt-4 text-sm text-[#B6B1A7] leading-relaxed max-w-[65ch]">
              Gerçek antika daktilo tuşları, el dokuma tezgâhı mekik darbeleri, porselen çınlamaları, dev müzik kutusu çelik tarakları ve canlı kaydedilmiş solo keman, çello ile piyano dokuları. Aşağıdaki katmanlara dokunarak fiziksel akustik tepkileri doğrudan dinleyebilirsiniz.
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-white/10 rounded-lg border border-white/10 bg-[#14161B]">
            {FOLEY_SOUNDS.map((sound) => {
              const active = lastTriggered === sound.id;
              return (
                <div
                  key={sound.id}
                  className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-[#9E9A92]">{sound.origin}</p>
                    <h3 className="mt-0.5 font-display text-xl font-medium text-[#F2EFE9]">
                      {sound.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#B6B1A7]">{sound.acousticProfile}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSound(sound.id)}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#D4A843] text-[#0C0D10]'
                        : 'border border-white/15 bg-[#1C1F26] text-[#F2EFE9] hover:border-[#D4A843]/60'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Akustiği Dinle</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Part B: Editorial Manifesto & Enes-Magnum Engine Architecture */}
        <div className="mt-24 border-t border-white/10 pt-16">
          <div className="max-w-3xl mx-auto text-center py-8 border-b border-white/10">
            <blockquote className="font-display text-2xl sm:text-3xl italic text-[#F2EFE9] leading-snug">
              “Enes Öztürk imzası, yalnızca tek bir pikseline bile yapay zekâ sızmamış bir el emeğinin değil; sıfır bellek sızıntılı donanım disiplininin ve insan ruhunun teminatıdır.”
            </blockquote>
            <p className="mt-4 text-xs tracking-widest uppercase text-[#D4A843]">
              Proje Manifestosu · Yapay Zekâya Karşı İnsan Ruhu ve El Emeği
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-5 text-base text-[#D6D1C7] leading-relaxed max-w-[65ch]">
              <h3 className="font-display text-3xl font-semibold text-[#F2EFE9]">
                Enes-Magnum Motoru & Kintsugi Fizik Disiplini
              </h3>
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-semibold first-letter:text-[#D4A843] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                Ticari oyun motorları veya hazır fizik paketleri yerine sıfırdan insan eliyle tasarlanan Enes-Magnum Engine; her kırılan mermer heykeli, parçalanan vitray camı ve çöken köprüyü gerçek kütle ve kırılma vektörleriyle simüle eder. Restorasyon Eldiveni devreye girdiğinde parçalar havada süzülerek eski yuvalarına oturur ve çatlakların arası parlayan saf sıvı altın damarlarıyla dolar.
              </p>
              <p>
                Çekirdek mimari Saf Modern C++26, özel bellek havuzlama (Custom Allocators) ve donanım seviyesinde AVX-512 SIMD vektör optimizasyonu ile sıfır bellek sızıntısı hedefiyle kurgulanmıştır. Tam Path-Tracing açıkken 4K ve 8K çözünürlüklerde dahi kilitsiz 144+ FPS kararlılığını koruyacak biçimde yapılandırılmıştır.
              </p>
            </div>

            <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#14161B] p-6">
              <p className="text-xs uppercase tracking-widest text-[#9E9A92]">
                Mühendislik Künyesi
              </p>
              <dl className="mt-5 divide-y divide-white/10 text-sm">
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#9E9A92]">Baş Mimar & Yönetmen</dt>
                  <dd className="font-medium text-[#F2EFE9]">Enes Öztürk</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#9E9A92]">Çekirdek Motor</dt>
                  <dd className="font-medium text-[#F2EFE9]">Enes-Magnum Engine</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#9E9A92]">Dil & SIMD Katmanı</dt>
                  <dd className="font-mono-tabular text-[#E5BC5E]">C++26 · AVX-512</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#9E9A92]">Hedef Çıktı</dt>
                  <dd className="font-mono-tabular text-[#F2EFE9]">4K/8K · 144+ FPS</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#9E9A92]">Varlık Üretim Politikası</dt>
                  <dd className="text-right text-[#F2EFE9]">%100 El Emeği · Sıfır Yapay Zekâ</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#9E9A92]">Fizik & Arayüz İlkeleri</dt>
                  <dd className="text-right text-[#F2EFE9]">Gerçek Zamanlı Kintsugi · Zero-UI</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
