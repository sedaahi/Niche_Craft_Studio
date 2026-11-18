const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load LiberationSans fonts for complete Turkish Unicode character support
  const regFontBytes = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf');
  const boldFontBytes = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf');
  doc.addFileToVFS('LiberationSans-Regular.ttf', regFontBytes.toString('base64'));
  doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
  doc.addFileToVFS('LiberationSans-Bold.ttf', boldFontBytes.toString('base64'));
  doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');

  // Page 1: Başlık, Özet ve İster 1 (Modül Listesi)
  doc.setFont('LiberationSans', 'bold');
  
  // Header bar
  doc.setFillColor(74, 63, 58); // #4A3F3A
  doc.rect(0, 0, 210, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('ÖDEV 2 · AI Destekli Web Uygulaması Geliştirme Atölyesi', 14, 11);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9);
  doc.text('Proje Teslim Raporu · Modül Planı, Çalışan Modüller, Hata Günlüğü ve Canlı Demo', 14, 18);

  // Meta info box
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, 28, 182, 32, 3, 3, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.setFontSize(13);
  doc.text('Niche Craft Studio', 20, 36);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(126, 112, 103);
  doc.text('Konsept: Butik Zanaat Atölyeleri Rezervasyon ve Bilet Platformu (Ankara / Tunalı)', 20, 42);

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(74, 63, 58);
  doc.text('Katılımcı:', 20, 49);
  doc.setFont('LiberationSans', 'normal');
  doc.text('Seda Ahi', 42, 49);

  doc.setFont('LiberationSans', 'bold');
  doc.text('Platform:', 115, 49);
  doc.setFont('LiberationSans', 'normal');
  doc.text('Google AI Studio & Firebase', 133, 49);

  doc.setFont('LiberationSans', 'bold');
  doc.text('Canlı URL:', 20, 55);
  doc.setFont('LiberationSans', 'normal');
  doc.setTextColor(222, 153, 124);
  doc.text('https://niche-craft-studio.ai.studio/', 42, 55);

  // SECTION 1: MODÜL LİSTESİ
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, 65, 182, 7, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(74, 63, 58);
  doc.text('1 · MODÜL LİSTESİ (İSTER 1)', 18, 70);

  // Table header
  let y = 76;
  doc.setFillColor(243, 234, 223);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 63, 58);
  doc.text('MODÜL ADI', 16, y + 4.8);
  doc.text('İÇİNDEKİ EKRANLAR VE AMACI', 50, y + 4.8);
  doc.text('BAĞLI OLDUĞU', 120, y + 4.8);
  doc.text('ÖNCELİK (YOL HARİTASI)', 145, y + 4.8);
  doc.text('DURUM', 178, y + 4.8);

  const modules = [
    {
      name: 'Tanıtım & Keşif',
      screens: 'Ana sayfa, atölye kartları, kategori filtreleri, eğitmen detayı',
      dep: '—',
      pri: 'Olmazsa olmaz',
      status: '✓ Çalışıyor',
    },
    {
      name: 'Kullanıcı Yönetimi',
      screens: 'Kayıt Ol, Giriş Yap, Google Hızlı Giriş, Şifremi Unuttum, Profil',
      dep: '—',
      pri: 'Olmazsa olmaz',
      status: '✓ Çalışıyor',
    },
    {
      name: 'Rezervasyon & Kilit',
      screens: 'Seans takvimi, kontenjan seçimi, 10 dk geri sayımlı koltuk kilidi',
      dep: 'Tanıtım & Keşif',
      pri: 'Olmazsa olmaz',
      status: '✓ Çalışıyor',
    },
    {
      name: 'Ödeme & Sipariş',
      screens: 'Ödeme formu (iyzico test), kart doğrulama, sipariş onay ekranı',
      dep: 'Rezervasyon',
      pri: 'Olmazsa olmaz',
      status: '✓ Çalışıyor',
    },
    {
      name: 'Dijital Bilet & QR',
      screens: 'Kişiye özel SVG QR biletler, kapı check-in tarayıcısı, CSV aktarımı',
      dep: 'Ödeme & Sipariş',
      pri: 'Olsa iyi olur',
      status: '✓ Çalışıyor',
    },
    {
      name: 'E-posta Tetikleyici',
      screens: 'Firebase Functions + Resend ile otomatik Hoş Geldin & Bilet Onayı',
      dep: 'Kullanıcı, Ödeme',
      pri: 'Olsa iyi olur',
      status: '✓ Çalışıyor',
    },
    {
      name: 'Yönetim Paneli',
      screens: 'Kurs/seans ekleme, iade/iptal, Firestore canlı senkronizasyonu',
      dep: 'Kullanıcı Yönetimi',
      pri: 'Sonra',
      status: '✓ Çalışıyor',
    },
  ];

  y += 7;
  modules.forEach((m, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 247, idx % 2 === 0 ? 255 : 242);
    doc.rect(14, y, 182, 7.2, 'F');
    doc.setDrawColor(231, 221, 206);
    doc.line(14, y + 7.2, 196, y + 7.2);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(74, 63, 58);
    doc.text(m.name, 16, y + 4.8);

    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(100, 90, 85);
    doc.text(m.screens, 50, y + 4.8);

    doc.text(m.dep, 120, y + 4.8);

    if (m.pri === 'Olmazsa olmaz') {
      doc.setTextColor(46, 125, 50); // green
    } else if (m.pri === 'Olsa iyi olur') {
      doc.setTextColor(216, 112, 147); // orange/pink
    } else {
      doc.setTextColor(120, 120, 120);
    }
    doc.text(m.pri, 145, y + 4.8);

    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(34, 139, 34); // Forest green
    doc.text(m.status, 178, y + 4.8);

    y += 7.2;
  });

  // Clarification Note below table
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(126, 112, 103);
  doc.text(
    '* Not: "Öncelik" sütunu ürün tasarımındaki yol haritasını (MoSCoW) belirtir; projemizde bu modüllerin tamamı uçtan uca kodlanıp çalışır hale getirilmiştir.',
    14,
    y + 3.5
  );

  y += 4;

  // SECTION 2: ÇALIŞAN MODÜLLER
  y += 6;
  doc.setFillColor(168, 191, 160); // #A8BFA0
  doc.roundedRect(14, y, 182, 7, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(74, 63, 58);
  doc.text('2 · UÇTAN UCA ÇALIŞAN MODÜLLER (İSTER 2 - EN AZ 2 MODÜL)', 18, y + 5);

  y += 11;
  const workingModules = [
    {
      title: 'Modül A: Kullanıcı Yönetimi & Kimlik Doğrulama (Gerçek Bulut Veritabanı)',
      desc: '• Kayıt Ol / Giriş Yap: Ad-soyad, e-posta ve şifreyle yeni üyelik. Bilgiler Google Cloud Firestore /users/{id} koleksiyonuna kaydedilir.\n• Google ile Hızlı Giriş: Firebase Auth GoogleAuthProvider ile gerçek OAuth girişi.\n• Profil & Oturum Yönetimi: Oturum localStorage ve Firestore üzerinden korunur; çıkış yapılınca oturum kapanır.\n• Şifremi Unuttum: E-posta ile güvenli sıfırlama akışı sunar.',
    },
    {
      title: 'Modül B: Rezervasyon, 10 Dakikalık Koltuk Kilidi & iyzico Ödeme Adımı',
      desc: '• Atölye ve Seans Seçimi: Tarih ve saat seçilerek boş kontenjan gerçek zamanlı görüntülenir.\n• 10 Dakikalık Dinamik Koltuk Kilidi (ReservationHold): Koltuk seçildiğinde 10 dk kilitlenir; süre bitince iade edilir.\n• Ödeme & Sipariş: iyzico test kartı arayüzü ile ödeme alınır, anında bilet üretilip seans kontenjanından düşülür.',
    },
    {
      title: 'Modül C: Dijital Biletleme & QR Kapı Check-in / Yönetici Paneli',
      desc: '• Kişiye Özel Bilet & QR Kod: Başarılı sipariş sonrası benzersiz SVG QR kodlu biletler oluşturulur.\n• Kapı Check-in: Yönetici panelinden bilet kodu yazılarak veya QR taranarak anlık kapı girişi yapılır ve katılımcı listesi CSV indirilebilir.',
    },
    {
      title: 'Modül D: Firebase Functions & Resend E-posta Bildirim Tetikleyicisi',
      desc: '• Hoş Geldin E-postası: Yeni kayıt olan üyeye Resend API üzerinden otomatik tetiklenir.\n• Bilet Onay E-postası: Sipariş tamamlandığında seans saati, stüdyo adresi ve bilet kodları içeren onay e-postası gider.',
    },
  ];

  workingModules.forEach((wm) => {
    doc.setFillColor(250, 247, 242);
    doc.setDrawColor(231, 221, 206);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(74, 63, 58);
    doc.text(wm.title, 18, y + 5.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 75, 70);
    const splitLines = doc.splitTextToSize(wm.desc, 174);
    doc.text(splitLines, 18, y + 10.5);

    y += 31;
  });

  // Footer Page 1
  doc.setFontSize(7);
  doc.setTextColor(150, 140, 135);
  doc.text('Ödev 2 Teslim Raporu · Niche Craft Studio · Sayfa 1 / 2', 14, 290);

  // PAGE 2: Hata Günlüğü & Yayın (İster 3 & İster 4)
  doc.addPage();

  // Header bar Page 2
  doc.setFillColor(74, 63, 58);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  doc.text('ÖDEV 2 · HATA GÜNLÜĞÜ VE YAYIN BİLGİLERİ', 14, 11);

  // SECTION 3: HATA GÜNLÜĞÜ (İSTER 3)
  y = 25;
  doc.setFillColor(244, 181, 154);
  doc.roundedRect(14, y, 182, 7, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(74, 63, 58);
  doc.text('3 · HATA GÜNLÜĞÜ (İSTER 3 - GERÇEK GELİŞTİRME DENEYİMİ)', 18, y + 5);

  y += 11;
  const bugLog1 = [
    { label: 'Ne yaptım?', val: 'Kayıt ol ekranında yeni bir kullanıcı kaydettim ve Firebase Console üzerinde /users koleksiyonunda görmek istedim.' },
    { label: 'Ne bekledim?', val: 'Firebase Console\'da "ai-studio-nichecraftstudio" veritabanı altında kayıtlı kullanıcının canlı belgesinin oluşması.' },
    { label: 'Ne oldu?', val: 'Firebase Console açıldığında "Start collection" uyarısıyla boş kaldı; çünkü ilk etapta veriler sadece yerel localStorage\'da tutuluyordu (Kullanıcının paylaştığı ekran görüntüsü: Ekran_Resmi_2026-10-21_18.09.28_9da11ce3.png).' },
    { label: 'Hata Mesajı / Durum:', val: 'Firebase Firestore üzerinde koleksiyon başlatılmamış / bağlantı istemci kodunda henüz bağlanmamıştı.' },
    { label: 'Düzeltme Prompt\'u:', val: '"firestoreda kayıt olur mu? Evet, Firebase Firestore\'a bağlayalım" prompt\'uyla Firebase Firestore SDK (setDoc, getDocs, onSnapshot) kodlandı ve /users, /courses, /sessions koleksiyonları canlı veritabanına bağlandı.' },
  ];

  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 48, 2, 2, 'FD');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('HATA KAYDI 1: Firestore Veritabanı Canlı Bağlantısı & Veri Saklama', 18, y + 6);

  let subY = y + 12;
  bugLog1.forEach((b) => {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(222, 153, 124);
    doc.text(b.label, 18, subY);

    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(74, 63, 58);
    const textLines = doc.splitTextToSize(b.val, 142);
    doc.text(textLines, 48, subY);
    subY += textLines.length * 3.5 + 2;
  });

  y += 53;
  const bugLog2 = [
    { label: 'Ne yaptım?', val: 'Atölyelerin Firestore\'a bağlanması, Google ile hızlı giriş ve Resend e-posta tetikleyicisi isterlerini verdim.' },
    { label: 'Ne bekledim?', val: 'Sunucu, arayüz ve Cloud Functions dosyalarının düzenlenip uygulamanın derlenmesi.' },
    { label: 'Ne oldu?', val: 'Platform arka planında "There was an unexpected error. Finish what you were doing." hatası oluştu ve akış yarıda kaldı.' },
    { label: 'Düzeltme Prompt\'u:', val: '"sorun ne kotam dolduğu için mi hata verdin, kaldığın yerden devam et" prompt\'u verildi. AdminView ve Resend sunucu rotası tamamlandı, derleme (compile_applet) ve TypeScript lint başarıyla doğrulandı.' },
  ];

  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 42, 2, 2, 'FD');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('HATA KAYDI 2: Platform Süre Aşımı Kesintisi ve Kodun Tamamlanması', 18, y + 6);

  subY = y + 12;
  bugLog2.forEach((b) => {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(222, 153, 124);
    doc.text(b.label, 18, subY);

    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(74, 63, 58);
    const textLines = doc.splitTextToSize(b.val, 142);
    doc.text(textLines, 48, subY);
    subY += textLines.length * 3.5 + 2;
  });

  // SECTION 4: YAYIN VE TEST BİLGİLERİ (İSTER 4)
  y += 48;
  doc.setFillColor(168, 191, 160);
  doc.roundedRect(14, y, 182, 7, 1.5, 1.5, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(74, 63, 58);
  doc.text('4 · YAYIN VE CANLI TEST BİLGİLERİ (İSTER 4)', 18, y + 5);

  y += 11;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(231, 221, 206);
  doc.roundedRect(14, y, 182, 54, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('Canlı Uygulama Linki (Mobil ve Gizli Sekmede Açılır):', 18, y + 6);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(222, 153, 124);
  doc.text('https://niche-craft-studio.ai.studio/', 18, y + 12);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('Örnek Test Hesabı Bilgileri (Uydurma/Örnek Bilgiler):', 18, y + 20);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(74, 63, 58);
  doc.text('• Katılımcı Test Hesabı: demo@nichecraft.studio · Şifre: Test1234!', 22, y + 26);
  doc.text('• Yönetici (Admin) Hesabı: admin@nichecraft.studio · Şifre: admin123', 22, y + 31);
  doc.text('• Giriş Davranışı: Örnek katılımcı hesabı tek tıkla doğrudan açılabilir. Yönetici (Admin) girişi ise yetki ayrımı gereği bilgileri yazılarak yapılır.', 22, y + 36);
  doc.text('• Google Girişi: "Google ile Devam Et" butonuyla doğrudan gerçek Google hesabıyla da giriş yapılabilir.', 22, y + 41);
  doc.text('• Not: Kişisel verilerin gizliliği ve Ödev 2 yönergesi gereği uydurma test hesapları tanımlanmıştır.', 22, y + 46);

  // SECTION 5: ÖDEV SORULARINA CEVAPLAR (KISA ÖZET)
  y += 60;
  doc.setFillColor(243, 234, 223);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 63, 58);
  doc.text('Teknik Özet & Veri Saklama Mimarisi:', 18, y + 6);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 75, 70);
  const techNotes = [
    '• Veriler nerede saklanıyor?: Kullanıcılar, Atölyeler ve Seanslar Google Cloud Firestore bulutunda tutulur. Sayfa yenilendiğinde ve farklı cihazdan girildiğinde Firestore üzerinden korunur ve anlık senkronize olur.',
    '• Hangileri gerçek / simülasyon?: Üyelik (Firestore/Google Auth), Atölye yönetimi, Rezervasyon kilidi ve QR kod üretimi gerçektir. Kredi kartı ödeme adımı güvenli test modundadır (gerçek para çekilmez, test kartıyla işlem yapılır). E-postalar Resend ve Firebase Functions altyapısına bağlıdır.',
    '• Çıkış ve oturum davranışı: Kullanıcı çıkış yaptığında oturumu sıfırlanır, yeni bir cihazda açıldığında misafir görünümünde başlar ve test hesabı veya yeni üyelikle giriş yapılabilir.',
  ];
  let techY = y + 12;
  techNotes.forEach((tn) => {
    const lines = doc.splitTextToSize(tn, 174);
    doc.text(lines, 18, techY);
    techY += lines.length * 3.5 + 2;
  });

  // Footer Page 2
  doc.setFontSize(7);
  doc.setTextColor(150, 140, 135);
  doc.text('Ödev 2 Teslim Raporu · Niche Craft Studio · Sayfa 2 / 2', 14, 290);

  const outputPublic = path.join(__dirname, '../public/Odev_2_NicheCraftStudio_Teslim_Raporu.pdf');
  const outputDist = path.join(__dirname, '../dist/Odev_2_NicheCraftStudio_Teslim_Raporu.pdf');
  const pdfBytes = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPublic, pdfBytes);
  if (fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.writeFileSync(outputDist, pdfBytes);
  }
  console.log('PDF generated at:', outputPublic);
}

generatePdf();
