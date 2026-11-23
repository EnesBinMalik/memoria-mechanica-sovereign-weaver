import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ARTISAN_GEAR, PALACES, type PalaceId } from '../data/memoriaData';
import { ResilientImage } from './ResilientImage';

interface ArtisanGearSectionProps {
  activePalace: PalaceId;
  integrity: number;
  spoolLevel: number;
  onSelectPalace: (id: PalaceId) => void;
}

export const ArtisanGearSection: React.FC<ArtisanGearSectionProps> = ({
  activePalace,
  integrity,
  spoolLevel,
  onSelectPalace,
}) => {
  const [bookOpen, setBookOpen] = useState(false);
  const currentPalace = PALACES.find((p) => p.id === activePalace) || PALACES[0];
  const integrityPct = Math.round(integrity * 100);

  return (
    <section id="techizat" className="border-t border-white/10 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <p className="text-xs tracking-widest uppercase text-[#9E9A92]">
            01 · Baş Restoratör Enes Öztürk & El Yapımı Teçhizat
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F2EFE9] leading-tight text-balance">
            Savaş ve Restorasyon Tek Bir Zanaatta Birleşir
          </h2>
          <p className="mt-4 text-base text-[#B6B1A7] leading-relaxed">
            Koyu antrasit kaşe mühendis paltosu üzerine işlenmiş gümüş ve altın telkari devreler, göğüste gerçek zamanlı atan Kristal Kalp Kronometresi ve parmak eklemleri açıkta bırakılan pirinç mekanizmalı deri eldivenler. Ekranda yapay bir can barı yok; tüm veri doğrudan zanaatkâr teçhizatı üzerinden okunur.
          </p>
        </div>

        {/* Studio Plate + Live Diegetic Readout Split */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#14161B] aspect-video">
              <ResilientImage
                src="/src/assets/images/weapons_loom_gauntlet_1795024630501.jpg"
                alt="Mekik Kılıcı ve Restorasyon Eldiveni stüdyo incelemesi"
                fallbackTitle="Mekik Kılıcı & Restorasyon Eldiveni"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-2.5 text-xs font-serif italic text-[#9E9A92]">
              Levha I — Sağ El: El dövmesi çelik ve cilalı ceviz Mekik Kılıcı · Sol El: Mikro pirinç kancalı Restorasyon Eldiveni.
            </p>
          </div>

          {/* Live Diegetic Telemetry Mirror & Pop-Up Book Control */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-lg border border-white/10 bg-[#14161B] p-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D4A843]">
                Anlık Diegetik Okuma
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-[#F2EFE9]">
                Kristal Kalp & Makara
              </h3>
              <p className="mt-2 text-sm text-[#9E9A92] leading-relaxed">
                Yukarıdaki 3D sahnede yaptığınız her Kintsugi onarımı ve Zaman Dikişi, Enes Öztürk’ün teçhizatındaki mekanik gerilimi doğrudan değiştirir.
              </p>

              <dl className="mt-6 space-y-4 border-t border-white/10 pt-5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#9E9A92]">Altın Zemberek Gerginliği</dt>
                  <dd className="font-mono-tabular font-medium text-[#E5BC5E]">{integrityPct}%</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#9E9A92]">Hafıza İpliği Makarası</dt>
                  <dd className="font-mono-tabular font-medium text-[#F2EFE9]">{spoolLevel}%</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#9E9A92]">Aktif Saray Katmanı</dt>
                  <dd className="text-right text-[#F2EFE9]">{currentPalace.index} · {currentPalace.titleTr}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => setBookOpen((v) => !v)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-[#D4A843]/50 bg-[#1C1F26] px-4 py-2.5 text-xs font-medium text-[#E5BC5E] hover:bg-[#D4A843]/15 transition-colors cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>{bookOpen ? 'Zanaatkâr Kitabını Kapat' : 'Pop-Up Zanaatkâr Kitabını Aç'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Pop-Up Artisan Atlas Drawer */}
        {bookOpen && (
          <div className="mt-6 rounded-lg border border-[#D4A843]/35 bg-[#14161B] p-6 lg:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#D4A843]">
                  Mekanik Pop-Up Zanaatkâr Kitabı · Açık Sayfa
                </p>
                <h4 className="mt-1 font-display text-2xl text-[#F2EFE9]">
                  Beş Katmanlı Kolektif Hafıza Atlası
                </h4>
              </div>
              <p className="text-xs text-[#9E9A92]">
                Katman seçerek 3D maketi güncelleyebilirsiniz
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              {PALACES.map((p) => {
                const selected = p.id === activePalace;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPalace(p.id)}
                    className={`text-left rounded-md border p-4 transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#D4A843] bg-[#1C1F26]'
                        : 'border-white/10 bg-[#0F1116] hover:border-white/25'
                    }`}
                  >
                    <p className="font-mono-tabular text-xs text-[#D4A843]">Katman {p.index}</p>
                    <p className="mt-1.5 font-display text-lg font-medium text-[#F2EFE9] leading-snug">
                      {p.titleTr}
                    </p>
                    <p className="mt-2 text-xs text-[#9E9A92] line-clamp-2">
                      {p.mechanicalFocus}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4-Part Artisan Gear Specification Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTISAN_GEAR.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-white/10 bg-[#14161B] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#9E9A92]">
                  <span className="text-[#D4A843]">{item.slot}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.nameEn}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#F2EFE9]">
                  {item.nameTr}
                </h3>
                <p className="mt-1 text-xs text-[#B6B1A7]">{item.materials}</p>
                <p className="mt-4 text-sm text-[#D6D1C7] leading-relaxed">
                  {item.description}
                </p>
              </div>
              <p className="mt-5 border-t border-white/10 pt-3 text-xs text-[#9E9A92]">
                İşlev: <span className="text-[#F2EFE9]">{item.functionTitle}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
