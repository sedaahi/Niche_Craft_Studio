const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load LiberationSans fonts for Turkish Unicode character support
  const regFontBytes = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf');
  const boldFontBytes = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf');
  doc.addFileToVFS('LiberationSans-Regular.ttf', regFontBytes.toString('base64'));
  doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
  doc.addFileToVFS('LiberationSans-Bold.ttf', boldFontBytes.toString('base64'));
  doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');

  // ==========================================
  // PAGE 1: Başlık, Meta, İster 1 (Veri Modeli) & İster 2 (CRUD)
  // ==========================================

  // Header Bar
  doc.setFillColor(74, 63, 58); // #4A3F3A
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.text('ÖDEV 3 · AI Destekli Web Uygulaması Geliştirme Atölyesi', 14, 11);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.text('Veritabanı Entegrasyonu, CRUD Modülü, Topluluk Vitrini & Yönetici Onay Masası', 14, 18);

  // Meta Info Box
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, 28, 182, 30, 2.5, 2.5, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(12);
  doc.text('Niche Craft Studio · Ödev 3 Proje Raporu', 20, 36);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(126, 112, 103);
  doc.text('Konsept: Butik Zanaat Atölyeleri, Katılımcı Eser Paylaşımı, Deneyim Puanlama & Yönetici Masası', 20, 42);

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.text('Katılımcı: Seda Ahi', 20, 49);
  doc.text('Altyapı: Google Cloud Firestore + React 19 + Tailwind CSS + Node.js', 78, 49);
  doc.text('Canlı URL:', 20, 54);
  doc.setFont('LiberationSans', 'normal');
  doc.setTextColor(222, 153, 124);
  doc.text('https://niche-craft-studio.ai.studio/', 38, 54);

  // ------------------------------------------
  // İSTER 1: VERİ MODELİ TABLOSU
  // ------------------------------------------
  let y = 62;
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6.5, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 63, 58);
  doc.text('1 · VERİ MODELİ (İSTER 1: KOLEKSİYONLAR, ALANLAR & İŞ AKIŞI)', 18, y + 4.5);

  y += 8.5;
  // Table header
  doc.setFillColor(243, 234, 223);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 63, 58);
  doc.text('KOLEKSİYON', 16, y + 4.2);
  doc.text('ALANLAR VE TİPLERİ', 46, y + 4.2);
  doc.text('İLİŞKİLER', 115, y + 4.2);
  doc.text('YETKİ & ERİŞİM KURALLARI', 145, y + 4.2);

  const dataModel = [
    {
      col: 'craft_posts\n(Katılımcı Eser & Deneyim)',
      fields: 'id: string, title: string, category: string, workshopId: string, workshopTitle: string, imageUrl: string, rating: number (1-5), description: string, authorId: string, authorName: string, status: "draft" | "pending" | "published" | "rejected", showOnHome: boolean, rejectionReason?: string, likesCount: number, createdAt: string',
      rel: 'users.id -> authorId\ncourses.id -> workshopId',
      rules: 'Herkes: yayinda olanları oku\nKatılımcı: kendi eserini yaz/güncelle/sil\nYönetici: tümünü oku/onayla/reddet/öne çıkar',
    },
    {
      col: 'craft_likes\n(Eser Beğenileri)',
      fields: 'id: string (userId_postId), postId: string, userId: string, createdAt: string',
      rel: 'craft_posts.id -> postId\nusers.id -> userId',
      rules: 'Giriş yapan kullanıcı beğeni ekler/kaldırır (1 kullanıcı = 1 oy)',
    },
    {
      col: 'courses & sessions\n(Atölyeler & Seanslar)',
      fields: 'id, title, slug, category, basePrice, durationMinutes, level, includedItems[], instructor, imageUrl, capacity, bookedCount',
      rel: 'sessions.courseId -> courses.id',
      rules: 'Herkes seansları görür; sadece admin ekler, düzenler ve siler (Tam CRUD)',
    },
    {
      col: 'users & orders\n(Üyeler & Biletler)',
      fields: 'id, name, email, phone, role ("customer" | "admin"), tickets[], totalAmount, status ("paid" | "refunded")',
      rel: 'orders.userId, craft_posts.authorId',
      rules: 'Kullanıcı kendi biletlerini ve profilini görür; admin tümünü yönetir',
    },
  ];

  y += 6;
  dataModel.forEach((item) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(235, 225, 215);
    doc.rect(14, y, 182, 17, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(74, 63, 58);
    const colLines = doc.splitTextToSize(item.col, 28);
    doc.text(colLines, 16, y + 4.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(80, 75, 70);
    const fieldsLines = doc.splitTextToSize(item.fields, 65);
    doc.text(fieldsLines, 46, y + 3.8);

    const relLines = doc.splitTextToSize(item.rel, 26);
    doc.text(relLines, 115, y + 3.8);

    const rulesLines = doc.splitTextToSize(item.rules, 48);
    doc.text(rulesLines, 145, y + 3.8);

    y += 17.5;
  });

  // 4 Durum Akışı Şeması Kutusu
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(222, 153, 124);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(74, 63, 58);
  doc.text('4 Kademeli Durum Akışı (Lifecycle States):', 18, y + 4.5);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(90, 80, 75);
  doc.text('1. [taslak] (Gri) → Katılımcı çalışmayı henüz göndermedi; sadece kendi günlüğünde düzenleyip silebilir.', 18, y + 8.5);
  doc.text('2. [onay_bekliyor] (Sarı) → Yönetici Onay Masası\'na düşer; vitrinde henüz yayınlanmaz, inceleme sırasındadır.', 18, y + 12.5);
  doc.text('3. [yayinda] (Yeşil) → Yönetici onayladı; Topluluk Vitrini\'nde ve seçilirse Ana Sayfa İlham Galerisi\'nde görünür.', 18, y + 16.5);
  doc.text('4. [reddedildi] (Kırmızı) → Gerekçe iletildi; katılımcı sebebi kırmızı kutuda görüp güncelleyerek tekrar onaya sunabilir.', 18, y + 20.5);

  // ------------------------------------------
  // İSTER 2: VERİTABANINA BAĞLI MODÜL (CRUD)
  // ------------------------------------------
  y += 26;
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6.5, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 63, 58);
  doc.text('2 · VERİTABANINA BAĞLI MODÜL: ESER & ATÖLYE YÖNETİMİ (İSTER 2 - TAM CRUD)', 18, y + 4.5);

  y += 8.5;
  const crudFeatures = [
    {
      action: 'EKLE (Create)',
      desc: 'Katılımcı "Biletlerim" ekranındaki biletinden veya Topluluk alanından "Ürettiğim Eseri Paylaş" butonuyla atölyesini seçer, ortaya çıkardığı esere isim verir, bilgisayarından fotoğrafını sürükleyip bırakır, 1-5 yıldız verir ve deneyimini yazar. Taslak veya Onaya Gönder seçenekleriyle Firestore\'a anlık kaydeder.',
    },
    {
      action: 'LİSTELE (Read)',
      desc: 'Katılımcı "Atölye Günlüğüm & Eserlerim" sayfasında tüm kayıtlarını 4 durum filtresiyle (Tümü, Taslaklar, Onay Bekleyenler, Yayındakiler, Düzeltme İstenenler) fotoğraflı kartlar halinde listeler. Kart üzerinde puanı, atölyesi ve beğenileri gösterilir.',
    },
    {
      action: 'DÜZENLE (Update)',
      desc: 'Kullanıcı kendi eserini istediği zaman "Düzenle" modalı ile güncelleyebilir; fotoğrafını değiştirebilir. Reddedilen eserlerde yöneticinin yazdığı gerekçe kırmızı uyarı kutusunda gösterilir ve düzeltilerek tekrar onaya sunulur. Ayrıca Yönetici panelinde tüm atölyeler için anlık Kurs Düzenleme (Update) modalı mevcuttur.',
    },
    {
      action: 'SİL (Delete)',
      desc: 'Her eserin yanında ve admin panelindeki atölyelerin yanında "Sil" butonu bulunur. Tıklandığında yanlışlıkla silmeyi önleyen özel bir "Onay Modalı" açılır. Onaylandığında Firestore bulut veritabanından kalıcı olarak silinir.',
    },
  ];

  crudFeatures.forEach((cf) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(231, 221, 206);
    doc.rect(14, y, 182, 13, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(222, 153, 124);
    doc.text(cf.action, 17, y + 5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(6.9);
    doc.setTextColor(80, 75, 70);
    const descLines = doc.splitTextToSize(cf.desc, 140);
    doc.text(descLines, 52, y + 4.5);

    y += 13.8;
  });

  // Footer Page 1
  doc.setFontSize(7);
  doc.setTextColor(150, 140, 135);
  doc.text('Ödev 3 Teslim Raporu · Niche Craft Studio · Sayfa 1 / 2', 14, 290);

  // ==========================================
  // PAGE 2: İster 3 (Vitrin & Onay Masası) & İster 4 (Test & Canlı Yayın)
  // ==========================================
  doc.addPage();

  // Header Bar Page 2
  doc.setFillColor(74, 63, 58);
  doc.rect(0, 0, 210, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  doc.text('ÖDEV 3 · BÖLÜM 2: TOPLULUK VİTRİNİ, YÖNETİCİ ONAY MASASI & DOĞRULAMA', 14, 11);

  // ------------------------------------------
  // İSTER 3: PAYLAŞIM ALANI VE YÖNETİCİ EKRANI
  // ------------------------------------------
  y = 22;
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6.5, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 63, 58);
  doc.text('3 · PAYLAŞIM ALANI VE YÖNETİCİ EKRANI (SEÇENEK A VE SEÇENEK B BİRLİKTE UYGULANDI)', 18, y + 4.5);

  y += 9;
  // Box for Secenek A
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 36, 2.5, 2.5, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('SEÇENEK A: TOPLULUK VİTRİNİ & ANA SAYFA İLHAM GALERİSİ', 18, y + 6);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(80, 75, 70);
  const secATexts = [
    '• Yalnızca Onaylanmış Eserler: Yalnızca status === "yayinda" olan eserler vitrinde yer alır; taslak ve onay bekleyenler gizlidir.',
    '• Ana Sayfa İlham Alanı: Yöneticinin onaylayıp "Ana Sayfada Göster" dediği eserler, ana sayfada fotoğraflı ve yıldızlı sergilenir.',
    '• Canlı Arama Çubuğu: Eser başlığında, atölye adında veya yorumda anlık arama yapar (örn: "kupa", "suluboya", "fincan", "lavanta").',
    '• Kategori Çipleri & Sıralama: Seramik, suluboya, takı, dokuma, mum filtreleri ve En Yeni, En Beğenilen sıralama seçenekleri.',
    '• Beğeni (Kalp) Sistemi: Giriş yapan veya ziyaretçi kullanıcı tek tıkla eseri beğenir; beğeni sayısı anlık artar/azalır.',
    '• Gizlilik İlkesi: Katılımcının kişisel e-posta adresi asla gösterilmez; yazar adı "Deniz Y." formatında kısaltılarak korunur.',
  ];
  let aY = y + 11;
  secATexts.forEach((t) => {
    doc.text(t, 18, aY);
    aY += 4.1;
  });

  y += 39;
  // Box for Secenek B
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 36, 2.5, 2.5, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('SEÇENEK B: YÖNETİCİ ONAY KUYRUĞU (Admin Paneli - "Eser Onay Masası" Sekmesi)', 18, y + 6);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(80, 75, 70);
  const secBTexts = [
    '• Bekleyen Eser Sayacı: Sekme üzerinde onay bekleyen eser sayısını gösteren canlı rozet (badge) ve nabız animasyonu yer alır.',
    '• İçerik İnceleme: Katılımcının yüklediği fotoğraf, verdiği yıldız puanı, atölye bilgisi ve yorumu tüm şeffaflığıyla listelenir.',
    '• Onayla & Yayınla: Yönetici "Onayla & Yayınla" butonuna bastığı anda status "yayinda" durumuna geçer ve anında vitrine taşınır.',
    '• Ana Sayfada Öne Çıkar Toggle: Yönetici tek tıkla onaylanmış bir eseri ana sayfada öne çıkarabilir veya ana sayfadan kaldırabilir.',
    '• Reddet & Gerekçe İlet (Zorunlu): Yönetici "Reddet" dediğinde bir modal açılır ve gerekçe girmesi zorunlu tutulur.',
    '• İki Yönlü Bildirim: Katılımcı kendi panelinde bu gerekçeyi kırmızı kutuda okur, fotoğrafı/yorumunu düzeltir ve tekrar onaya gönderir.',
  ];
  let bY = y + 11;
  secBTexts.forEach((t) => {
    doc.text(t, 18, bY);
    bY += 4.1;
  });

  // ------------------------------------------
  // ÖZGÜN PROJE MİMARİSİ VE TAM İSTER KARŞILAMA ADIMLARI
  // ------------------------------------------
  y += 40;
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6.5, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 63, 58);
  doc.text('4 · NICHE CRAFT STUDIO ÖZGÜN MİMARİSİ & TAM İSTER DOĞRULAMASI', 18, y + 4.5);

  y += 8.5;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 38, 2.5, 2.5, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(74, 63, 58);
  doc.text('Projemizde Hayata Geçirilen İleri Seviye Mühendislik Adımları:', 18, y + 5);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(80, 75, 70);
  const archSteps = [
    '1. Sürükle-Bırak Fotoğraf Yükleme: Katılımcılar ürettikleri ürünün fotoğrafını doğrudan bilgisayarlarından sürükleyip bırakarak yükleyebilir.',
    '2. Atölye Yönetimi (Admin Tam CRUD): Admin sekmesinde yeni atölye oluşturma, tüm atölyeleri listeleme, anlık düzenleme modalı ve silme.',
    '3. Doğrulanmış Katılımcı Puanlaması: Yalnızca bilet alan ve atölyeye katılan üyeler 1-5 yıldız vererek deneyim incelemesi bırakabilir.',
    '4. Google Cloud Firestore Bulut Veritabanı: craft_posts, courses, sessions, orders ve users koleksiyonları canlı onSnapshot ile bağlıdır.',
    '5. Resend E-posta & Bulut Bildirimleri: Kayıt hoş geldin ve bilet satın alma bildirimleri otomatik şablonlarla iletilir ve loglanır.',
    '6. Tek Oturum İlkesi (Single-Session Security): Müşteri ve yönetici oturumlarının aynı anda çakışmasını engelleyen güvenli mimari.',
    '7. Responsive & Mobil Uyumlu: Tüm vitrin, modal ve yönetim masası bileşenleri masaüstü ve mobil ekranlarda kusursuz çalışır.',
  ];
  let sY = y + 9.5;
  archSteps.forEach((st) => {
    doc.text(st, 18, sY);
    sY += 3.9;
  });

  // ------------------------------------------
  // İSTER 4: CANLI YAYIN VE İKİ CİHAZLA TEST RAPORU
  // ------------------------------------------
  y += 42;
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6.5, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 63, 58);
  doc.text('5 · CANLI YAYIN VE İKİ CİHAZLA TEST DOĞRULAMASI (HESAP BİLGİLERİ VE TEST SENARYOSU)', 18, y + 4.5);

  y += 8.5;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 34, 2.5, 2.5, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(74, 63, 58);
  doc.text('Canlı URL: https://niche-craft-studio.ai.studio/', 18, y + 5);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(80, 75, 70);
  const testLines = [
    '• 1. Cihaz (Katılımcı / Yazar): demo@nichecraft.studio · Şifre: Test1234! (Giriş ekranında "Tek Tıkla Demo Müşteri Girişi" ile anında açılır).',
    '  → "Biletlerim" sayfasından "Eseri Paylaş" diyerek fotoğraf yükler, 5 yıldız verir ve deneyimini yazıp onaya sunar.',
    '• 2. Cihaz (Yönetici / Admin): admin@nichecraft.studio · Şifre: admin123 (Güvenlik gereği e-posta ve şifresi elle girilerek açılır).',
    '  → Yönetici Paneli > "Eser Onay Masası" sekmesine girildiğinde 1. cihazdan eklenen eser canlı olarak fotoğraflı kuyrukta görünür.',
    '• Onay & Ana Sayfa Vitrini: Yönetici "Onayla & Vitrinde Yayınla" der; eser Topluluk Vitrinine ve Ana Sayfa İlham Vitrinine anlık yansır.',
    '• Reddetme & Düzeltme: Yönetici "Reddet" diyerek gerekçe yazar. 1. cihazda eser kırmızı "Düzeltme İsteniyor" durumuna geçer.',
  ];
  let tY = y + 10;
  testLines.forEach((tl) => {
    const lines = doc.splitTextToSize(tl, 174);
    doc.text(lines, 18, tY);
    tY += lines.length * 3.8;
  });

  // Footer Page 2
  doc.setFontSize(7);
  doc.setTextColor(150, 140, 135);
  doc.text('Ödev 3 Teslim Raporu · Niche Craft Studio · Sayfa 2 / 2', 14, 290);

  const pdfBytes = Buffer.from(doc.output('arraybuffer'));
  const targets = [
    path.join(__dirname, '../public/NicheCraftStudio_Odev_3_Guncel_Teslim_Raporu.pdf'),
    path.join(__dirname, '../public/Odev_3_NicheCraftStudio_Teslim_Raporu.pdf'),
    path.join(__dirname, '../dist/NicheCraftStudio_Odev_3_Guncel_Teslim_Raporu.pdf'),
    path.join(__dirname, '../dist/Odev_3_NicheCraftStudio_Teslim_Raporu.pdf'),
  ];
  targets.forEach((t) => {
    try {
      fs.writeFileSync(t, pdfBytes);
    } catch (e) {}
  });
  console.log('Ödev 3 PDF generated successfully at targets');
}

generatePdf();
