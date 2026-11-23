export type PalaceId =
  | 'scriptorium'
  | 'tapestry'
  | 'vitrail'
  | 'musicbox'
  | 'amnesia';

export interface PalaceSpec {
  id: PalaceId;
  index: string;
  titleTr: string;
  titleEn: string;
  subtitle: string;
  atmosphereColor: string;
  accentHex: string;
  materialSignature: string;
  mechanicalFocus: string;
  description: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  imagePath?: string;
}

export interface GearItem {
  id: string;
  slot: string;
  nameTr: string;
  nameEn: string;
  materials: string;
  functionTitle: string;
  description: string;
}

export interface FoleySoundSpec {
  id: 'typewriter' | 'shuttle' | 'porcelain' | 'musicbox' | 'orchestra';
  title: string;
  origin: string;
  acousticProfile: string;
}

export const PALACES: PalaceSpec[] = [
  {
    id: 'scriptorium',
    index: '01',
    titleTr: 'Sonsuz Kütüphane ve Daktilo Katedrali',
    titleEn: 'The Scriptorium of Echoes',
    subtitle: 'El Yazması Kemerler · Mekanik Daktilo Platformları · Mürekkep Nehirleri',
    atmosphereColor: '#0F1117',
    accentHex: '#D4A843',
    materialSignature: 'Dövme Pirinç · Eskitilmiş Parşömen · Siyah Mürekkep',
    mechanicalFocus: 'Tuş Baskısıyla Yükselen Dikey Mimarî Platformlar',
    description:
      'Gökyüzüne uzanan milyonlarca el yazması kitabın, dev mekanik daktilo tuşlarının ve mürekkep nehirlerinin yer aldığı dikey mimari harikası. Her bir harf vuruşu taş köprüleri harekete geçirir.',
    cameraPos: [6.4, 4.2, 7.6],
    cameraTarget: [0, 1.5, 0],
    imagePath: '/src/assets/images/palace_scriptorium_vitrail_1795024631271.jpg',
  },
  {
    id: 'tapestry',
    index: '02',
    titleTr: 'Dokuma Tezgahı Vadisi',
    titleEn: 'The Tapestry Canyon',
    subtitle: 'Kilometrelik Altın Halatlar · Ceviz Ahşap Tezgâh Kemerleri',
    atmosphereColor: '#12110E',
    accentHex: '#E0B24C',
    materialSignature: 'Cilalı Ceviz Ağacı · Gerilmiş İpek · Pirinç Mekik',
    mechanicalFocus: 'Gergin Hafıza İplikleri Üzerinde Kinetik Denge ve Kayış',
    description:
      'Devasa ahşap ve pirinç dokuma tezgahlarının bulutların arasında çalıştığı, kilometrelerce uzunluktaki gerilmiş ipek ve altın halatların üzerinde denge kurarak savaşılan baş döndürücü akrobasi arenası.',
    cameraPos: [6.8, 3.8, 7.2],
    cameraTarget: [0, 1.7, 0],
  },
  {
    id: 'vitrail',
    index: '03',
    titleTr: 'Kırık Porselen ve Vitray Şehri',
    titleEn: 'The Vitrail Citadel',
    subtitle: 'El Boyaması Vitray Camlar · Antik Çini Porselen · Kintsugi Kırıkları',
    atmosphereColor: '#0E121A',
    accentHex: '#E5BC5E',
    materialSignature: 'Sırlı Beyaz Porselen · Kobalt & Yakut Vitray · Sıvı Altın',
    mechanicalFocus: 'Kırılgan Zeminlerde Yüksek Riskli Parçalanma ve Altın Onarım',
    description:
      'Her bir binası el boyaması renkli vitray camlardan ve antik çini porselenlerden inşa edilmiş, güneş ışığının kırılmasıyla sokakların renkli ışık tablolarına dönüştüğü kırılgan şehir.',
    cameraPos: [5.9, 3.9, 6.8],
    cameraTarget: [0, 1.6, 0],
    imagePath: '/src/assets/images/palace_scriptorium_vitrail_1795024631271.jpg',
  },
  {
    id: 'musicbox',
    index: '04',
    titleTr: 'Sualtı Saat ve Müzik Kutusu Mahzeni',
    titleEn: 'The Submerged Music-Box',
    subtitle: 'İğneli Pirinç Silindir · Dev Çelik Taraklar · Ritmik Kapılar',
    atmosphereColor: '#0A1219',
    accentHex: '#D8AD48',
    materialSignature: 'Su Altı Patinalı Pirinç · Çelik Tarak · Safir Kubbe',
    mechanicalFocus: 'Müzik Kutusu Melodisinin Ritmiyle Eşzamanlı Açılan Mekanik Kapılar',
    description:
      'Devasa bir su altı kubbesinin içinde yer alan, pirinç silindirlerin üzerindeki iğnelerin dev metal taraklara çarparak şehri titreten melodiler ürettiği mekanik mahzen.',
    cameraPos: [6.6, 3.6, 7.1],
    cameraTarget: [0, 1.5, 0],
    imagePath: '/src/assets/images/palace_musicbox_core_1795024631230.jpg',
  },
  {
    id: 'amnesia',
    index: '05',
    titleTr: 'Unutuşun Kalbi',
    titleEn: 'The Amnesia Core',
    subtitle: 'Parçalanmış Saat Çarkları · Ruhsuz Algoritma Leviathanı · Final Arenası',
    atmosphereColor: '#090A0D',
    accentHex: '#F0C764',
    materialSignature: 'Obsidyen Taş · Yırtılmış Usturlap Halkaları · Saf Altın İplik',
    mechanicalFocus: 'Zaman-Mekân Dikişiyle Uzayı Bükerek Çekirdeği Yeniden Örme',
    description:
      'Tüm el emeği anıları silip tek tip bir karanlığa gömmek isteyen Ruhsuz Algoritma Leviathanı ile savaşılan, parçalanmış saatlerin ve mimari eserlerin havada süzüldüğü destansı final arenası.',
    cameraPos: [7.0, 4.1, 7.5],
    cameraTarget: [0, 1.8, 0],
  },
];

export const ARTISAN_GEAR: GearItem[] = [
  {
    id: 'shuttle-blade',
    slot: 'Sağ El Silahı',
    nameTr: 'Mekik Kılıcı',
    nameEn: 'The Shuttle-Blade',
    materials: 'El Dövmesi Çelik · Cilalı Ceviz Ağacı · Altın İplik Makarası',
    functionTitle: 'Hafıza İplikleri Örme & Anı-Kristali Çözümleme',
    description:
      'Eski dokuma tezgahlarının mekiklerinden ilham alınarak dövülen jilet keskinliğinde ağır kılıç. Savrulduğunda havada parlayan Altın Hafıza İplikleri bırakır; tek bir keskin çekişle Unutuş Parazitlerini anı-kristallerine ayırır.',
  },
  {
    id: 'mending-gauntlet',
    slot: 'Sol El Teçhizatı',
    nameTr: 'Restorasyon Eldiveni',
    nameEn: 'The Mending Gauntlet',
    materials: 'El Dikimi Siyah Deri · Mikro Pirinç Kancalar · Manyetik Bobinler',
    functionTitle: 'Kintsugi Onarım & Fiziksel Enkaz Yakalama',
    description:
      'Parmak uçlarındaki mikro pirinç kancalar ve manyetik bobinlerle yıkılmış köprü taşlarını, kırılmış saat çarklarını havada yakalar; çatlakları sıvı altın damarlarıyla birleştirerek yapıyı eskisinden sağlam kılar.',
  },
  {
    id: 'crystal-heart',
    slot: 'Diegetik Sağlık & Zırh',
    nameTr: 'Kristal Kalp Kronometresi',
    nameEn: 'Crystal Heart Chronometer',
    materials: 'Safir Kristal Kubbe · Gümüş Telkari Kafes · Altın Zemberek',
    functionTitle: 'Sıfır-Arayüz (Zero-UI) Durum Okuması',
    description:
      'Ekranda tek bir yapay can barı olmaksızın Enes Öztürk’ün göğsünde gerçek zamanlı atar. Tik-tak ritmi ve içindeki altın zembereğin gerginliği anı bütünlüğünü ve zırh direncini doğrudan bildirir.',
  },
  {
    id: 'popup-book',
    slot: 'Diegetik Harita & Rehber',
    nameTr: 'Mekanik Pop-Up Zanaatkâr Kitabı',
    nameEn: 'Artisan Pop-Up Atlas',
    materials: 'El Bağlaması Parşömen · Pirinç Menteşe · Minyatür Maket',
    functionTitle: 'Üç Boyutlu Katlanır Saray Haritası',
    description:
      'Baş Restoratör paltosunun cebinden çıkardığında sayfalar mekanik olarak açılır ve bulunulan Hafıza Sarayının el çizimi minyatür üç boyutlu maketini gerçek zamanlı olarak yükseltir.',
  },
];

export const FOLEY_SOUNDS: FoleySoundSpec[] = [
  {
    id: 'typewriter',
    title: 'Antika Daktilo Tuş Vuruşu',
    origin: 'Sonsuz Kütüphane · Stüdyo Kaydı Sentezi',
    acousticProfile: 'Mekanik kol darbesi, pirinç mandal tıkırtısı ve taş salon yankısı',
  },
  {
    id: 'shuttle',
    title: 'Dokuma Tezgâhı Mekik Kayışı',
    origin: 'Dokuma Tezgâhı Vadisi · Ahşap & İpek',
    acousticProfile: 'Ceviz mekik süzülüşü ve gergin altın iplik armonik titreşimi',
  },
  {
    id: 'porcelain',
    title: 'Kırık Porselen & Vitray Çınlaması',
    origin: 'Vitray Şehri · Safir Cam & Çini',
    acousticProfile: 'Yüksek Q-faktörlü porselen rezonansı ve altın damar mühür tınısı',
  },
  {
    id: 'musicbox',
    title: 'Dev Pirinç Müzik Kutusu Tarağı',
    origin: 'Sualtı Mahzeni · Çelik Dişli Rezonans',
    acousticProfile: 'Su altı kubbesi içinde çınlayan beş sesli mekanik tarak akışı',
  },
  {
    id: 'orchestra',
    title: 'Oda Orkestrası Senfoni Akoru',
    origin: 'Restorasyon Tamamlandığında · Yaylılar',
    acousticProfile: 'Solo çello, viyola ve keman beşlilerinin kusursuz armonik birleşimi',
  },
];
