import { Course, Instructor, Session, User } from '../types';

export const heroCraftStudioImg = '/images/hero_craft_studio.jpg';
export const workshopCeramicImg = '/images/workshop_ceramic.jpg';
export const workshopWatercolorImg = '/images/workshop_watercolor.jpg';
export const workshopJewelryImg = '/images/workshop_jewelry.jpg';
export const workshopPunchNeedleImg = '/images/workshop_punch_needle.jpg';

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Selin Arslan',
    title: 'Seramik Sanatçısı & Çömlek Ustası',
    bio: 'Mimar Sinan Güzel Sanatlar Fakültesi Seramik Bölümü mezunu. 8 yıldır elle şekillendirme ve çömlek tornası üzerine atölyeler düzenliyor.',
  },
  {
    id: 'inst-2',
    name: 'Mert Aksoy',
    title: 'Botanik İllüstratör & Ressam',
    bio: 'Doğal pigmentler ve botanik suluboya konusunda uzmanlaşmış görsel sanatçı. Uluslararası botanik illüstrasyon sergilerinde eserleri yer almıştır.',
  },
  {
    id: 'inst-3',
    name: 'Deniz Kutlu',
    title: 'Tekstil & Lif Sanatçısı',
    bio: 'Geleneksel dokuma ve modern punch nakış tekniklerini harmanlayarak sıcak dokulu ev objeleri tasarlıyor.',
  },
  {
    id: 'inst-4',
    name: 'Banu Yıldız',
    title: 'Mücevher & Reçine Tasarımcısı',
    bio: 'Kurutulmuş dağ çiçekleri ve şeffaf biyo-reçine ile zamansız takı koleksiyonları üretiyor.',
  },
  {
    id: 'inst-5',
    name: 'Cemre Eren',
    title: 'Kaligrafi Sanatçısı & Tipograf',
    bio: 'Divit kalem ve mürekkep büyüsünü modern hat sanatıyla buluşturan serbest tasarımcı.',
  },
  {
    id: 'inst-6',
    name: 'Elif Tan',
    title: 'Doğal Parfümör & Aromaterapist',
    bio: 'Bitkisel uçucu yağlar ve organik soya mumu üzerine butik koku atölyeleri yürütüyor.',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-ceramic-mug',
    title: 'Elle Seramik Kupa & Tabak Atölyesi',
    slug: 'elle-seramik-kupa-atolyesi',
    category: 'ceramic',
    categoryLabel: 'Seramik',
    description: 'Çamurun sakinleştirici dokusuyla kendi kahve kupanızı ve altlık tabağınızı elle şekillendirin.',
    longDescription: 'Bu atölyede antik pinch-pot (çimdik) ve sucuk (coiling) tekniklerini kullanarak tamamen size özel bir kupa ve tatlı tabağı tasarlayacaksınız. Hiçbir deneyim gerekmez; eğitmenimiz Selin Hanım adım adım form vermeyi, kulp montajını ve doku kazıma (sgraffito) tekniklerini gösterir. Hazırladığınız ürünler atölyemizde kurutulup 2 kez 1040°C sıcaklıkta fırınlanır ve gıdaya uygun şeffaf sırla sırlanarak 2 hafta sonra teslim alınabilir.',
    durationMinutes: 150,
    level: 'Başlangıç',
    includedItems: ['1 kg taş çamuru', 'Ahşap şekillendirme araçları', '2 kez fırınlama & sır', 'Filtre kahve & bitki çayı ikramı'],
    instructorId: 'inst-1',
    instructor: INITIAL_INSTRUCTORS[0],
    imageUrl: workshopCeramicImg,
    basePrice: 1250,
    featured: true,
    maxCapacityPerSession: 8,
  },
  {
    id: 'course-watercolor-botanical',
    title: 'Botanik Suluboya & Zeytin Dalı İllüstrasyonu',
    slug: 'botanik-suluboya-atolyesi',
    category: 'painting',
    categoryLabel: 'Resim',
    description: 'Pamuklu kağıt üzerine renk geçişleri, yaprak tonlamaları ve ıslak üstüne ıslak tekniğini keşfedin.',
    longDescription: 'Zeytin dalı, okaliptüs ve mevsim yapraklarının canlı yeşil tonlarını kendi paletinizde harmanlayacaksınız. Doğal ışıklı masamızda, kaliteli 300gr %100 pamuk kağıtlar ve sanatçı sınıfı pigmentlerle suluboyanın akışkan doğasını öğrenip çerçevelenmeye hazır bir botanik eserle ayrılacaksınız.',
    durationMinutes: 180,
    level: 'Başlangıç',
    includedItems: ['300gr Arches pamuklu kağıt', 'Schmincke suluboya paleti kullanımı', 'Doğal kıl fırçalar', 'Korumalı paspartu çerçeve'],
    instructorId: 'inst-2',
    instructor: INITIAL_INSTRUCTORS[1],
    imageUrl: workshopWatercolorImg,
    basePrice: 1100,
    featured: true,
    maxCapacityPerSession: 10,
  },
  {
    id: 'course-resin-jewelry',
    title: 'Kurutulmuş Çiçekli Reçine Kolye & Yüzük',
    slug: 'recine-taki-atolyesi',
    category: 'jewelry',
    categoryLabel: 'Takı Tasarımı',
    description: 'Doğal preslenmiş kır çiçeklerini pirinç ve altın kaplama çerçevelere kristal reçineyle sabitleyin.',
    longDescription: 'Hava kabarcıksız UV ve epoksi reçine dökümünün inceliklerini öğrenin. Atölyemizin zengin kurutulmuş çiçek koleksiyonundan dilediğiniz minik kır papatyaları, lavantalar ve yosunları seçerek 1 adet kolye ucu ve 1 adet ayarlanabilir yüzük tasarlayacaksınız. Atölye sonunda takılarınız hemen kullanıma hazır olur.',
    durationMinutes: 120,
    level: 'Tüm Seviyeler',
    includedItems: ['Antialerjik pirinç takı kaideleri', 'UV Reçine & sertleştirici', 'Doğal pres çiçek seçkisi', 'Özel hediye kutusu'],
    instructorId: 'inst-4',
    instructor: INITIAL_INSTRUCTORS[3],
    imageUrl: workshopJewelryImg,
    basePrice: 950,
    featured: true,
    maxCapacityPerSession: 8,
  },
  {
    id: 'course-punch-needle',
    title: 'Modern Punch Nakışı ile Bardak Altlığı & Duvar Panosu',
    slug: 'punch-nakisi-atolyesi',
    category: 'textile',
    categoryLabel: 'Tekstil & Örgü',
    description: 'Keten kumaş ve pastel yün iplerle dokunsal kabartma ilmekler atarak içinizi ısıtacak objeler üretin.',
    longDescription: 'Punch iğnesinin ritmik ve terapi hissi veren hareketleriyle tanışın. İplik gerginliği ayarlamayı, döngü (loop) ve düz dikiş geçişlerini öğrenerek geometrik veya botanik desenli 2 adet kalın bardak altlığı veya 20cm çapında ahşap kasnak duvar panosu tamamlayacaksınız.',
    durationMinutes: 150,
    level: 'Başlangıç',
    includedItems: ['Ayarlanabilir punch iğnesi seti', 'Doğal keten kumaş & ahşap kasnak', 'Organik pamuk yünler', 'Kaymaz altlık keçesi'],
    instructorId: 'inst-3',
    instructor: INITIAL_INSTRUCTORS[2],
    imageUrl: workshopPunchNeedleImg,
    basePrice: 980,
    featured: false,
    maxCapacityPerSession: 8,
  },
  {
    id: 'course-modern-calligraphy',
    title: 'Modern Kaligrafi & Fırça Yazı Sanatı',
    slug: 'modern-kaligrafi-atolyesi',
    category: 'calligraphy',
    categoryLabel: 'Kaligrafi',
    description: 'Mürekkep akışı, harf anatomisi ve zarif el yazısı teknikleriyle davetiye ve tebrik kartları hazırlayın.',
    longDescription: 'Divit uç ve fırça uçlu kalemlerin baskı-bırak prensibini öğrenin. Temel vuruşlardan (upstroke/downstroke) başlayarak harf bağlantılarını çalışacak, atölye sonunda özel tasarım kalın kartlara kendi el yazınızla şiir veya alıntı kartları hazırlayacaksınız.',
    durationMinutes: 150,
    level: 'Başlangıç',
    includedItems: ['Başlangıç kaligrafi çalışma defteri', 'Tombow fırça kalem & divit uç', 'Japon sumi mürekkebi', 'Zarf & el yapımı kağıtlar'],
    instructorId: 'inst-5',
    instructor: INITIAL_INSTRUCTORS[4],
    imageUrl: workshopWatercolorImg,
    basePrice: 890,
    featured: false,
    maxCapacityPerSession: 10,
  },
  {
    id: 'course-soy-candle',
    title: 'Aromaterapik Soya Mumu & Fitil Dökümü',
    slug: 'dogal-soya-mumu-atolyesi',
    category: 'candle',
    categoryLabel: 'Mum & Koku',
    description: '%100 doğal soya mumu, ahşap fitil ve saf uçucu yağlarla kendi imza kokunuzu oluşturun.',
    longDescription: 'Petrokimyasal parafin içermeyen, temiz yanan soya wax ile 2 adet seramik kapta aromatik mum hazırlayın. Üst, orta ve alt nota koku piramidini öğrenip sedir ağacı, bergamot, vanilya ve lavanta esanslarını oranlayarak kişisel karışımınızı dökün.',
    durationMinutes: 120,
    level: 'Tüm Seviyeler',
    includedItems: ['500gr saf GDO-suz soya mumu', 'Doğal ahşap çıtırdayan fitiller', '2 adet el yapımı seramik kase', 'Saf uçucu yağ esansları'],
    instructorId: 'inst-6',
    instructor: INITIAL_INSTRUCTORS[5],
    imageUrl: workshopCeramicImg,
    basePrice: 920,
    featured: false,
    maxCapacityPerSession: 8,
  },
];

export const INITIAL_SESSIONS: Session[] = [
  // Seramik Seansları
  {
    id: 'sess-cer-1',
    courseId: 'course-ceramic-mug',
    date: '2026-10-24', // Cumartesi
    startTime: '11:00',
    endTime: '13:30',
    price: 1250,
    capacity: 8,
    bookedCount: 6, // 2 seats left!
  },
  {
    id: 'sess-cer-2',
    courseId: 'course-ceramic-mug',
    date: '2026-10-25', // Pazar
    startTime: '15:00',
    endTime: '17:30',
    price: 1250,
    capacity: 8,
    bookedCount: 8, // Sold out
  },
  {
    id: 'sess-cer-3',
    courseId: 'course-ceramic-mug',
    date: '2026-10-31', // Gelecek Cumartesi
    startTime: '14:00',
    endTime: '16:30',
    price: 1250,
    capacity: 8,
    bookedCount: 3, // 5 seats left
  },

  // Suluboya Seansları
  {
    id: 'sess-wat-1',
    courseId: 'course-watercolor-botanical',
    date: '2026-10-24',
    startTime: '15:00',
    endTime: '18:00',
    price: 1100,
    capacity: 10,
    bookedCount: 7, // 3 seats left
  },
  {
    id: 'sess-wat-2',
    courseId: 'course-watercolor-botanical',
    date: '2026-10-29', // Perşembe akşam
    startTime: '18:30',
    endTime: '21:30',
    price: 1100,
    capacity: 10,
    bookedCount: 4, // 6 seats left
  },
  {
    id: 'sess-wat-3',
    courseId: 'course-watercolor-botanical',
    date: '2026-11-01', // Pazar
    startTime: '13:00',
    endTime: '16:00',
    price: 1100,
    capacity: 10,
    bookedCount: 1, // 9 seats left
  },

  // Reçine Takı Seansları
  {
    id: 'sess-jew-1',
    courseId: 'course-resin-jewelry',
    date: '2026-10-25',
    startTime: '11:00',
    endTime: '13:00',
    price: 950,
    capacity: 8,
    bookedCount: 5, // 3 seats left
  },
  {
    id: 'sess-jew-2',
    courseId: 'course-resin-jewelry',
    date: '2026-10-28', // Çarşamba öğleden sonra
    startTime: '14:00',
    endTime: '16:00',
    price: 950,
    capacity: 8,
    bookedCount: 2, // 6 seats left
  },

  // Punch Nakışı Seansları
  {
    id: 'sess-pun-1',
    courseId: 'course-punch-needle',
    date: '2026-10-26', // Pazartesi akşamüstü
    startTime: '16:00',
    endTime: '18:30',
    price: 980,
    capacity: 8,
    bookedCount: 4,
  },
  {
    id: 'sess-pun-2',
    courseId: 'course-punch-needle',
    date: '2026-11-07',
    startTime: '11:00',
    endTime: '13:30',
    price: 980,
    capacity: 8,
    bookedCount: 0,
  },

  // Kaligrafi Seansları
  {
    id: 'sess-cal-1',
    courseId: 'course-modern-calligraphy',
    date: '2026-10-30', // Cuma akşam
    startTime: '18:30',
    endTime: '21:00',
    price: 890,
    capacity: 10,
    bookedCount: 6,
  },

  // Mum Yapımı Seansları
  {
    id: 'sess-can-1',
    courseId: 'course-soy-candle',
    date: '2026-10-27', // Salı akşam
    startTime: '18:30',
    endTime: '20:30',
    price: 920,
    capacity: 8,
    bookedCount: 7, // 1 seat left!
  },
];

export const INITIAL_USER: User = {
  id: 'usr-demo',
  name: 'Seda Ahi',
  username: 'sedahi',
  email: 'ahiseda@gmail.com',
  password: 'password123',
  phone: '0555 432 1098',
  role: 'customer',
  createdAt: '2026-09-15',
};

export const STUDIO_INFO = {
  name: 'Niche Craft Studio',
  address: 'Tunalı Hilmi Caddesi No: 48/B, Çankaya / Ankara',
  landmark: 'Kuğulu Park’a 3 dakika yürüme mesafesinde, Tunalı pasaj arkası avlu içi',
  phone: '+90 (312) 427 88 90',
  whatsapp: '+90 (532) 111 22 33',
  email: 'merhaba@nichecraftstudio.com',
  instagram: '@nichecraftstudio',
  hours: 'Salı — Pazar: 10:00 – 21:00 (Pazartesi günleri fırın bakım günü)',
  mapCoordinates: '39.9042, 32.8601',
  googleMapsUrl: 'https://maps.google.com/?q=Tunali+Hilmi+Caddesi+Cankaya+Ankara',
};
