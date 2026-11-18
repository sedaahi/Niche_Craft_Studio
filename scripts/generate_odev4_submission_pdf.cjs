const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load LiberationSans fonts for full Turkish Unicode character support
  const regFontBytes = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf');
  const boldFontBytes = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf');
  doc.addFileToVFS('LiberationSans-Regular.ttf', regFontBytes.toString('base64'));
  doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
  doc.addFileToVFS('LiberationSans-Bold.ttf', boldFontBytes.toString('base64'));
  doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');

  // ==========================================
  // 1 SAYFALIK RESMİ BİTİRME PROJESİ PROJE KARTI
  // ==========================================

  // Top Header Banner
  doc.setFillColor(74, 63, 58); // #4A3F3A
  doc.rect(0, 0, 210, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.text('BİTİRME PROJESİ · PROJE KARTI VE SON KONTROL RAPORU', 14, 10);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(244, 181, 154);
  doc.text('AI Destekli Web Uygulaması Geliştirme Atölyesi · Ödev 4 Final Teslimi', 14, 17);

  // ------------------------------------------
  // BÖLÜM A: PROJE KARTI ŞABLONU (İSTER 5)
  // ------------------------------------------
  let y = 27;

  // Ad Soyad & Proje Adı Card
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(126, 112, 103);
  doc.text('AD SOYAD', 18, y + 5.5);
  doc.text('PROJE ADI', 96, y + 5.5);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(74, 63, 58);
  doc.text('Seda Ahi', 18, y + 12.5);
  doc.text('Niche Craft Studio (Tunalı Butik Zanaat Atölyeleri)', 96, y + 12.5);
  y += 22;

  // Helper to draw clean template rows
  function drawCardRow(title, lines, options = {}) {
    const { isHighlighted = false, height = 20 } = options;
    if (isHighlighted) {
      doc.setFillColor(246, 240, 252);
      doc.setDrawColor(216, 202, 238);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(231, 221, 206);
    }
    doc.roundedRect(14, y, 182, height, 2, 2, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(74, 63, 58);
    doc.text(title, 18, y + 5.5);

    let lineY = y + 10.5;
    lines.forEach((line) => {
      if (typeof line === 'string') {
        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(90, 80, 75);
        doc.text(line, 18, lineY);
      } else {
        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(74, 63, 58);
        doc.text(line.label, 18, lineY);
        doc.setFont('LiberationSans', line.boldValue ? 'bold' : 'normal');
        doc.setTextColor(line.accent ? 200 : 90, line.accent ? 125 : 80, line.accent ? 85 : 75);
        doc.text(line.value, line.xOffset || 44, lineY);
      }
      lineY += 4.5;
    });

    y += height + 3;
  }

  // Çözdüğü problem
  drawCardRow(
    'Çözdüğü problem',
    [
      'Şehir hayatının temposundan ve ekran yorgunluğundan uzaklaşıp elleriyle üretmek isteyen bireylerin, Ankara Tunalı’daki',
      'butik el sanatları atölyeleri (seramik, suluboya, reçine takı, punch nakışı, kaligrafi, doğal soya mumu) arasından ruh',
      'haline ve deneyimine uygun seansı tek bir platformda bulamaması ve tek seferlik bilet ayırtırken dağınık kanallarla uğraşması.'
    ],
    { height: 24 }
  );

  // Hedef kullanıcı
  drawCardRow(
    'Hedef kullanıcı',
    [
      'Hafta sonu veya akşam saatlerinde zihnini dinlendirmek isteyen şehirli yetişkinler, yaratıcı randevu arayan çiftler',
      've ön deneyim gerektirmeyen başlangıç seviyesi hobi/zanaat meraklıları.'
    ],
    { height: 19 }
  );

  // Modüller
  drawCardRow(
    'Modüller',
    [
      { label: '• Atölye & Seans Kataloğu:', value: '6 zanaat alanı, eğitmen profilleri, dahil malzemeler, canlı kontenjan ve takvim.', xOffset: 56 },
      { label: '• Rezervasyon, Bilet & E-posta:', value: 'Sepet, seans seçimi, 48 saat iade, QR/kodlu dijital bilet ve Resend otomatik e-postası.', xOffset: 62 },
      { label: '• Katılımcı Vitrini & Admin Masası:', value: 'Eser fotoğrafı yükleme, 5 yıldız puan, beğeni ve admin onay/red/CRUD yönetim paneli.', xOffset: 66 },
      { label: '• Atölye Danışmanı (AI Asistan):', value: 'Sağ altta yüzen, adım adım seçim yaptırarak kullanıcıya özel atölye öneren sohbet asistanı.', xOffset: 63 }
    ],
    { height: 28 }
  );

  // Yapay zekâ modülü (ne yapar, girdi, çıktı)
  drawCardRow(
    'Yapay zekâ modülü (ne yapar, girdi, çıktı)',
    [
      { label: 'Ne yapar:', value: 'Sağ altta yüzen sohbet penceresinde kullanıcıyla adım adım konuşur; ruh hali, deneyim seviyesi ve arzularına', xOffset: 36 },
      '                 göre stüdyo kataloğundaki 6 atölyeden en uygun seansı seçer ve el yapımı somut eser fikri üretir.',
      { label: 'Girdi:', value: 'Ruh hali/beklenti seçimi, el sanatları deneyim seviyesi ve isteğe bağlı serbest not (sıfır kişisel veri).', xOffset: 30 },
      { label: 'Çıktı:', value: 'Kişiye özel uyum puanlı atölye kartı (doğrudan seans rezervasyon butonlu), "Ellerinle Ne Üreteceksin?" fikri,', xOffset: 30 },
      '                 usta zanaatkar ipucu, saatlik kullanım sınırı takibi ve zorunlu "Yapay zekâ önerisidir, kontrol ediniz." uyarısı.'
    ],
    { isHighlighted: true, height: 34 }
  );

  // Araçlar (geliştirme, veritabanı, AI API, yayın)
  drawCardRow(
    'Araçlar (geliştirme, veritabanı, AI API, yayın)',
    [
      { label: 'Geliştirme:', value: 'React 19, TypeScript, Tailwind CSS, Vite, Express.js & Netlify Serverless Functions', xOffset: 40 },
      { label: 'Veritabanı & Kimlik:', value: 'Google Cloud Firestore & Firebase Authentication (Google + E-posta Hesapları)', xOffset: 51 },
      { label: 'AI API & E-posta:', value: 'Google Gemini API (gemini-3.8-flash, sunucu taraflı @google/genai SDK) & Resend API', xOffset: 48 },
      { label: 'Yayın:', value: 'Netlify (HTTPS, CDN, Ortam Değişkenleri & Serverless API Rotaları)', xOffset: 32 }
    ],
    { height: 28 }
  );

  // Yayın adresi & Test hesabı (uydurma)
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 21, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('Yayın adresi:', 18, y + 7);
  doc.setTextColor(200, 125, 85);
  doc.text('https://nichecraftstudio.netlify.app', 42, y + 7);

  doc.setTextColor(74, 63, 58);
  doc.text('Test hesabı (uydurma):', 18, y + 14.5);
  doc.setFont('LiberationSans', 'normal');
  doc.text('E-posta: demo@nichecraft.studio   |   Şifre: Test1234!   (Veya Google ile Hızlı Giriş)', 55, y + 14.5);

  y += 26;

  // ------------------------------------------
  // BÖLÜM B: SON KONTROL LİSTESİ (3 KUTU)
  // ------------------------------------------
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(74, 63, 58);
  doc.text('SON KONTROL LİSTESİ ÖZETİ', 14, y);
  y += 3;

  const colW = 58;
  const gap = 4;

  // Box 1: Güvenlik
  doc.setFillColor(229, 247, 243);
  doc.setDrawColor(186, 228, 220);
  doc.roundedRect(14, y, colW, 33, 2, 2, 'FD');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 80, 72);
  doc.text('Güvenlik', 18, y + 5.5);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.5);
  doc.text('[x] Kodda gizli anahtar yok (.env)', 18, y + 11.5);
  doc.text('[x] GitHub deposu gizli (Private)', 18, y + 17);
  doc.text('[x] Güvenlik kuralları yazılı', 18, y + 22.5);
  doc.text('[x] İkinci hesapla test edildi', 18, y + 28);

  // Box 2: Yapay zekâ
  doc.setFillColor(239, 232, 250);
  doc.setDrawColor(208, 193, 235);
  doc.roundedRect(14 + colW + gap, y, colW, 33, 2, 2, 'FD');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(68, 52, 102);
  doc.text('Yapay zekâ', 18 + colW + gap, y + 5.5);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.5);
  doc.text('[x] Çıktı etiketli (uyarı notu var)', 18 + colW + gap, y + 11.5);
  doc.text('[x] Bekleme animasyonu & yedek yanıt', 18 + colW + gap, y + 17);
  doc.text('[x] Kullanım sınırı (saatlik/IP kota)', 18 + colW + gap, y + 22.5);
  doc.text('[x] Kişisel veri modele gitmiyor', 18 + colW + gap, y + 28);

  // Box 3: Yayın
  doc.setFillColor(227, 245, 231);
  doc.setDrawColor(183, 224, 191);
  doc.roundedRect(14 + (colW + gap) * 2, y, colW, 33, 2, 2, 'FD');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(39, 84, 51);
  doc.text('Yayın', 18 + (colW + gap) * 2, y + 5.5);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.5);
  doc.text('[x] HTTPS ve SSL kilidi aktif', 18 + (colW + gap) * 2, y + 11.5);
  doc.text('[x] Telefonda & masaüstünde uyumlu', 18 + (colW + gap) * 2, y + 17);
  doc.text('[x] Google & E-posta girişi çalışıyor', 18 + (colW + gap) * 2, y + 22.5);
  doc.text('[x] Test hesabı kartta hazır', 18 + (colW + gap) * 2, y + 28);

  // Bottom Footer Bar
  doc.setFillColor(74, 63, 58);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(244, 181, 154);
  doc.text('Niche Craft Studio · Bitirme Projesi Kartı · https://nichecraftstudio.netlify.app · Sayfa 1/1', 35, 293.5);

  const outputPath = path.resolve(__dirname, '..', 'public', 'NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
  console.log('Successfully generated final Ödev 4 Project Card PDF at:', outputPath);
}

generatePdf();
