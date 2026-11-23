import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PALACES, type PalaceId } from '../data/memoriaData';
import { ResilientImage } from './ResilientImage';

interface PalacesAtlasSectionProps {
  activePalace: PalaceId;
  onOpenIn3D: (id: PalaceId) => void;
}

export const PalacesAtlasSection: React.FC<PalacesAtlasSectionProps> = ({
  activePalace,
  onOpenIn3D,
}) => {
  return (
    <section id="saraylar" className="border-t border-white/10 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl">
          <p className="text-xs tracking-widest uppercase text-[#9E9A92]">
            02 · Sıfır Prosedürel Üretim · El Oyması Açık Dünya
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F2EFE9] leading-tight text-balance">
            Beş Unutulmaz Hafıza Sarayı
          </h2>
          <p className="mt-4 text-base text-[#B6B1A7] leading-relaxed">
            Algoritmaların ürettiği tekdüze haritalar yerine insan zihninin ve zanaat tarihinin farklı dönemlerini temsil eden, tamamı dijital heykeltıraşlıkla tek tek oyulmuş kesintisiz beş açık dünya katmanı.
          </p>
        </div>

        {/* Two Large Curatorial Plates */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <figure>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#14161B] aspect-video">
              <ResilientImage
                src="/src/assets/images/palace_scriptorium_vitrail_1795024631271.jpg"
                alt="Sonsuz Kütüphane, Daktilo Katedrali ve Vitray Şehri Kintsugi kemerleri"
                fallbackTitle="Sonsuz Kütüphane ve Vitray Kemerleri"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-2.5 text-xs font-serif italic text-[#9E9A92]">
              Levha II — Katman 01 & 03: Daktilo tuşu köprüleri ve sıvı altınla onarılmış kırık vitray kemerleri.
            </figcaption>
          </figure>

          <figure>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#14161B] aspect-video">
              <ResilientImage
                src="/src/assets/images/palace_musicbox_core_1795024631230.jpg"
                alt="Sualtı Saat ve Müzik Kutusu Mahzeni dev pirinç silindir ve çelik taraklar"
                fallbackTitle="Sualtı Saat ve Müzik Kutusu Mahzeni"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-2.5 text-xs font-serif italic text-[#9E9A92]">
              Levha III — Katman 04: Su altı kubbesi içinde dönen iğneli pirinç silindir ve Kintsugi mermer heykeller.
            </figcaption>
          </figure>
        </div>

        {/* Curatorial Index of the 5 Palaces */}
        <div className="mt-14 divide-y divide-white/10 border-t border-b border-white/10">
          {PALACES.map((palace) => {
            const isCurrent = palace.id === activePalace;
            return (
              <div
                key={palace.id}
                className="py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-2 text-xs text-[#9E9A92]">
                    <span className="font-mono-tabular text-[#D4A843]">Katman {palace.index}</span>
                    <span aria-hidden="true">·</span>
                    <span>{palace.titleEn}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl font-semibold text-[#F2EFE9]">
                    {palace.titleTr}
                  </h3>
                  <p className="mt-2 text-xs text-[#9E9A92]">{palace.materialSignature}</p>
                </div>

                <div className="lg:col-span-5">
                  <p className="text-sm text-[#D6D1C7] leading-relaxed">
                    {palace.description}
                  </p>
                  <p className="mt-3 text-xs text-[#9E9A92]">
                    Mekânik Odak: <span className="text-[#F2EFE9]">{palace.mechanicalFocus}</span>
                  </p>
                </div>

                <div className="lg:col-span-3 flex lg:justify-end items-center">
                  <button
                    type="button"
                    onClick={() => onOpenIn3D(palace.id)}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#D4A843] text-[#0C0D10]'
                        : 'border border-white/15 bg-[#14161B] text-[#F2EFE9] hover:border-[#D4A843]/60'
                    }`}
                  >
                    <span>{isCurrent ? '3D Sahnede Aktif' : '3D Sahnede Aç'}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
