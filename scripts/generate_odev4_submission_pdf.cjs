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
  // PAGE 1: BİTİRME PROJESİ PROJE KARTI (1 SAYFA)
  // ==========================================

  // Header Bar
  doc.setFillColor(74, 63, 58); // #4A3F3A
  doc.rect(0, 0, 210, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.text('BİTİRME PROJESİ PROJE KARTI · AI Destekli Web Uygulaması Geliştirme', 14, 10);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.text('Ödev 4 Final Teslimi: Google Gemini API Entegrasyonu, Full-Stack Mimari & Canlı Dağıtım', 14, 17);

  // Meta Summary Box
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, 25, 182, 33, 2.5, 2.5, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(12);
  doc.text('Niche Craft Studio · Tunalı Butik Zanaat Atölyeleri Biletleme Platformu', 19, 32);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(126, 112, 103);
  doc.text('Konsept: Şehirli yetişkinler için sakinleştirici el sanatları atölyesi seçimi, biletleme ve AI zanaat ilhamı', 19, 37.5);

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.text('Katılımcı:', 19, 44);
  doc.setFont('LiberationSans', 'normal');
  doc.text('Seda Ahi', 35, 44);

  doc.setFont('LiberationSans', 'bold');
  doc.text('Teknoloji:', 70, 44);
  doc.setFont('LiberationSans', 'normal');
  doc.text('Gemini 3.8 Flash + Firestore + React 19 + Express (Node.js)', 86, 44);

  doc.setFont('LiberationSans', 'bold');
  doc.text('Canlı URL:', 19, 50);
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(200, 125, 85);
  doc.text('https://niche-craft-studio.ai.studio/', 35, 50);

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.text('Test Hesapları:', 110, 50);
  doc.setFont('LiberationSans', 'normal');
  doc.text('demo@nichecraft.studio / Test1234! (Admin: admin@nichecraft.studio)', 133, 50);

  let y = 62;

  // 1. PROBLEM VE HEDEF KİTLE
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(9);
  doc.text('1 · PROBLEM TANIMI VE HEDEF KİTLE', 18, y + 4.2);
  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 21, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('Problem:', 18, y + 5);
  doc.setFont('LiberationSans', 'normal');
  doc.setTextColor(90, 80, 75);
  doc.text('Hafta sonu veya akşamları zihnini dinlendirmek, ekran yorgunluğunu atmak isteyen bireyler;', 32, y + 5);
  doc.text('Ankara Tunalı’daki butik zanaat atölyelerine (seramik, botanik suluboya, reçine takı, ahşap mum, punch nakışı)', 18, y + 9.5);
  doc.text('hangi ruh haline veya seviyeye göre katılacaklarını bilememekte ve tek seans biletleme için dağınık kanallarla uğraşmaktadır.', 18, y + 14);
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.text('Hedef Kitle:', 18, y + 18.5);
  doc.setFont('LiberationSans', 'normal');
  doc.setTextColor(90, 80, 75);
  doc.text('Elleriyle üretmek isteyen şehirli yetişkinler, çiftler, hobi meraklıları ve zihnini dinlendirmek isteyenler.', 37, y + 18.5);
  y += 24;

  // 2. ÇÖZÜM VE TEMEL MODÜLLER
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(9);
  doc.text('2 · ÇÖZÜM VE UYGULAMA MODÜLLERİ (ÖDEV 1, 2, 3 ALTYAPISI)', 18, y + 4.2);
  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 26, 2, 2, 'FD');

  const modules = [
    ['• Atölye & Seans Kataloğu:', '6 farklı zanaat alanı, kontenjan sayacı, eğitmen profilleri, malzeme listesi ve seans takvimi.'],
    ['• Sepet & Rezervasyon:', 'Gerçek zamanlı sepet, kontenjan kontrolü, katılımcı bilgileri, QR/barkodlu bilet ve Resend e-postası.'],
    ['• Katılımcı Eser Vitrini:', 'Kullanıcıların ürettikleri eserleri fotoğrafla yüklemesi, 5 yıldızlı değerlendirme ve beğeni sistemi.'],
    ['• Yönetici (Admin) Paneli:', 'Gelen eserleri onaylama/reddetme, vitrine öne çıkarma, seans ekleme/düzenleme (Tam CRUD).']
  ];

  let modY = y + 5;
  modules.forEach(([title, desc]) => {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(74, 63, 58);
    doc.text(title, 18, modY);
    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(90, 80, 75);
    doc.text(desc, 56, modY);
    modY += 5;
  });
  y += 29;

  // 3. YAPAY ZEKÂ (GEMINI) ENTEGRASYONU (ÖDEV 4 ASIL İSTERİ)
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(9);
  doc.text('3 · YAPAY ZEKÂ (GEMINI API) ENTEGRASYONU · BİTİRME PROJESİ İSTERİ', 18, y + 4.2);
  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 54, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('Modül Adı: AI Zanaat İlhamı & Akıllı Atölye Eşleştirici', 18, y + 5);
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(200, 125, 85);
  doc.text('Kullanılan Model: gemini-3.8-flash (@google/genai SDK)', 106, y + 5);

  const aiDetails = [
    ['Çalışma Akışı:', 'Kullanıcı ruh halini (meditasyon, canlılık, doğallık vb.), deneyim düzeyini ve varsa özel arzusunu seçer.'],
    ['Sunucu Entegrasyonu:', 'İstek Express sunucusuna (/api/ai-recommend) gider. API anahtarı sunucuda process.env ile gizlidir.'],
    ['Akıllı Çıktı:', 'Gemini 3.8 Flash, 6 atölye arasından en uyumlu atölyeyi, seans boyunca üreteceği somut obje fikrini, '],
    ['', 'kişiye özel uyum gerekçesini, % uyum skorunu ve usta zanaatkar ipucunu yapılandırılmış JSON olarak döndürür.'],
    ['Güvenlik & Gizlilik:', 'Hiçbir kişisel veri (ad, e-posta, ödeme) modele iletilmez; yalnızca zanaat tercihleri işlenir.'],
    ['Yasal & UI İsterleri:', 'Çıktı altında zorunlu "✨ Yapay zekâ önerisidir, kontrol ediniz." ibaresi yer alır. Yükleme animasyonu'],
    ['', 've olası kota/ağ durumlarına karşı kural tabanlı yerel küratör yedek mekanizmasıyla sıfır kesinti sağlanır.']
  ];

  let aiY = y + 10.5;
  aiDetails.forEach(([tag, text]) => {
    if (tag) {
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(74, 63, 58);
      doc.text(tag, 18, aiY);
      doc.setFont('LiberationSans', 'normal');
      doc.setTextColor(90, 80, 75);
      doc.text(text, 54, aiY);
    } else {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(90, 80, 75);
      doc.text(text, 54, aiY);
    }
    aiY += 4.5;
  });
  y += 57;

  // 4. ÖDEV 4 KONTROL VE İSTER KARŞILAMA MATRİSİ
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 6, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(9);
  doc.text('4 · BİTİRME PROJESİ İSTERLERİ KONTROL MATRİSİ', 18, y + 4.2);
  y += 8;

  // Matrix Table
  const tableHeaderY = y;
  doc.setFillColor(235, 226, 214);
  doc.rect(14, tableHeaderY, 182, 5.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 63, 58);
  doc.text('KILAVUZ İSTERİ', 18, tableHeaderY + 4);
  doc.text('UYGULANAN ÇÖZÜM & BİLEŞEN', 65, tableHeaderY + 4);
  doc.text('DURUM', 170, tableHeaderY + 4);

  const checkItems = [
    ['1. LLM API Entegrasyonu', 'Express sunucusunda @google/genai & gemini-3.8-flash modeli kullanımı', 'TAMAM (100%)'],
    ['2. API Anahtarı Güvenliği', 'process.env.GEMINI_API_KEY sunucuda saklanır, istemciye asla sızdırılmaz', 'TAMAM (100%)'],
    ['3. Kullanıcı Arayüzü (UI)', 'HomeView sayfasında interaktif seçimler, görsel kartlar, doğrudan seans CTA', 'TAMAM (100%)'],
    ['4. Durum & Yükleme Göstergesi', 'Yükleniyor animasyonu, açıklayıcı durum metni ve Türkçe hata yönetimi', 'TAMAM (100%)'],
    ['5. Yasal Bilgilendirme Etiketi', '"✨ Yapay zekâ önerisidir, kontrol ediniz." ibaresi tüm çıktılarda görünür', 'TAMAM (100%)'],
    ['6. Veri Gizliliği Uyumu', 'Prompt içeriğinde sıfır kişisel veri (PII), yalnızca zanaat tercihleri aktarılır', 'TAMAM (100%)'],
    ['7. Canlı Yayında Çalışırlık', 'https://niche-craft-studio.ai.studio/ üzerinde aktif ve test edilebilir', 'TAMAM (100%)']
  ];

  let rowY = tableHeaderY + 5.5;
  checkItems.forEach(([req, sol, status], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 247, idx % 2 === 0 ? 255 : 242);
    doc.rect(14, rowY, 182, 5, 'F');
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(74, 63, 58);
    doc.text(req, 18, rowY + 3.5);
    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(90, 80, 75);
    doc.text(sol, 65, rowY + 3.5);
    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(46, 125, 50); // green
    doc.text(status, 170, rowY + 3.5);
    rowY += 5;
  });

  // Footer bar
  doc.setFillColor(74, 63, 58);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(244, 181, 154);
  doc.text('Niche Craft Studio · AI Destekli Web Uygulaması Geliştirme Atölyesi · Bitirme Projesi (Ödev 4) · Sayfa 1/1', 20, 293.5);

  const outputPath = path.resolve(__dirname, '..', 'public', 'NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
  console.log('Successfully generated Ödev 4 Project Card PDF at:', outputPath);

  // Also return base64 for embedding in client-side downloader
  const base64 = Buffer.from(pdfBytes).toString('base64');
  console.log('Base64 length:', base64.length);
  return base64;
}

generatePdf();
