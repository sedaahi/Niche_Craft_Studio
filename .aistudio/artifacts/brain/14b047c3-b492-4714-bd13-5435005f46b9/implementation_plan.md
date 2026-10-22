# Niche Craft Studio — Hobi Atölyeleri Biletleme Platformu MVP

Niche Craft Studio, seramikten takı tasarımına, resimden kaligrafi ve örgüye kadar farklı el sanatları atölyeleri için tek seferlik seans biletlerinin satıldığı, Ankara Tunalı merkezli butik bir hobi atölyesi web platformudur. Misafir ve üye kullanıcılar için pürüzsüz rezervasyon, 10 dakikalık kontenjan kilitleme (race condition önleme), iyzico test ödemesi, QR kodlu bilet onay e-postası ve admin yönetim/check-in paneli sunar.

> [!IMPORTANT]
> **Kullanıcı Kararları & Onaylanan Tercihler**
> - **Marka İsmi**: Niche Craft Studio
> - **Fiziksel Lokasyon**: Tunalı Hilmi Cd., Çankaya / Ankara (harita, ulaşım ve açık atölye saatleri)
> - **Ödeme & E-posta**: Gerçekçi test simülasyonu (hazır test kartları, 3D secure simülasyonu) ve opsiyonel `iyzico` / `Resend` API anahtarı desteği
> - **Aşamalı Geliştirme**: Kullanıcının belirttiği 5 aşamalı plan izlenecektir: (1) Tasarım sistemi ve sayfalar, (2) Kurs/seans yönetimi & admin, (3) Bilet satın alma & 10 dk kontenjan rezervasyonu, (4) Ödeme & sipariş oluşturma, (5) QR bilet doğrulama & check-in.

---

## 1. Genel Bakış & Temel Konsept

- **Ne Yapar**: Kullanıcıların Ankara Tunalı'daki fiziksel stüdyoda düzenlenen tek seanslık el sanatları ve hobi atölyelerini keşfetmesini, seans tarihlerini/kalan kontenjanı incelemesini ve ister misafir ister üye olarak kolayca bilet almasını sağlar.
- **Hedef Kitle**: Hafta sonu veya akşam saatlerinde yaratıcı vakit geçirmek, yeni bir el becerisi (seramik, kaligrafi, suluboya, örgü, reçine takı) deneyimlemek isteyen şehirli yetişkinler, çiftler ve arkadaş grupları.
- **Temel Değer**: Karmaşık kurs kayıtları ve aylık taahhütler yerine, "malzemeler dahil, 2-3 saatlik keyifli bir atölye deneyimi ve günün sonunda kendi ürettiğin objeyle ayrılma" konsepti.

---

## 2. Kullanıcı Deneyimi & Görsel Tasarım

### Temel Kullanıcı Akışları
1. **Keşif (Ana Sayfa & Kurslar)**:
   - Sıcak karşılama alanı, öne çıkan atölyeler, bu haftaki yaklaşan seanslar, "Nasıl Çalışır?" (1. Atölyeni Seç, 2. Seans Biletini Al, 3. Stüdyoda Buluşalım).
   - Kategori filtreleri (Seramik, Resim, Tekstil & Örgü, Takı & Reçine, Kaligrafi, Ahşap/Deri).
2. **Kurs & Seans İnceleme (Detay)**:
   - Atölye fotoğrafları, eğitmen biyografisi, süre (örn. 2.5 saat), zorluk seviyesi ("Başlangıç için uygundur"), fiyata dahil olan malzemeler (kil, fırınlama, boyalar, kahve ikramı).
   - Tarih ve saat bazlı seans listesi: Kalan kontenjan (örn. "Son 3 Koltuk"), doluluk çubuğu, "Tükendi" durumu.
3. **Satın Alma (Checkout) & Kontenjan Kilidi**:
   - Koltuk adedi seçimi (1 ile 4 bilet arası).
   - Koltuk seçildiğinde arka planda 10 dakikalık geçici rezervasyon sayacı başlar (başka kullanıcıların aynı koltuğu kapmasını engeller).
   - Ziyaretçi bilgileri (Ad Soyad, E-posta, Telefon) veya tek tıkla üye bilgileriyle devam etme.
   - iyzico güvenli ödeme simülasyonu (başarılı kartlar, hata senaryoları).
4. **Bilet & Onay**:
   - Benzersiz bilet kodu (örn. `NCS-2026-8492`), SVG QR Kod, Google Takvime Ekle bağlantısı, yol tarifi.
   - E-posta simülatörü/önizlemesi ve Resend tetikleyici.
5. **Admin Paneli & QR Check-in**:
   - Güvenli admin girişi (`admin@nichecraft.com` / `admin123`).
   - Dashboard: Toplam bilet satışı, doluluk oranları, yaklaşan seans takvimi.
   - Kurs & Seans CRUD (yeni atölye açma, tarih/saat ve kontenjan belirleme, katılımcı listesini CSV olarak indirme).
   - Seans bazlı bilet listesi, 48 saat öncesine kadar geçerli İptal/İade aksiyonu.
   - **QR Kod Tarayıcı / Manuel Bilet Doğrulama**: Atölye kapısında bilet kodunu okutup tek tıkla "Giriş Yapıldı" (Check-in) işaretleme.

### Tasarım Kimliği & Renk Paleti (Soft, Relax & Sade)
- **Atmosfer**: Dingin, huzurlu, samimi ve doğal ışıklı bir zanaat atölyesi. Kalabalıktan ve göz yoran neon renklerden uzak.
- **Renk Paleti**:
  - Arka Plan (Dominant %60): Krem `#FBF6EF` ve yumuşak fildişi `#FAF7F2`
  - Yüzey & Kartlar (%30): Sıcak açık bej `#F3EADF`, ince sıcak bordürler `#E5D9CB`
  - Vurgu & Aksiyon (%10): Şeftali / Pişmiş Toprak `#F4B59A` ve adaçayı yeşili ikincil `#A8BFA0`
  - Tipografi Rengi: Yumuşak kahvemsi espresso `#4A3F3A` ve ikincil toprak tonu `#7D6E66` (kesinlikle saf siyah `#000000` yok)
- **Tipografi**:
  - Başlıklar: Yumuşak hatlı, zarif ve sıcak serif (`Fraunces` veya `Playfair Display`)
  - Gövde Metinleri: Okunaklı, modern ve dost canlısı sans-serif (`DM Sans` veya `Nunito`)
  - Fiyatlar ve Bilet Kodları: `font-mono tabular-nums`
- **Şekiller & Detaylar**:
  - Büyük, yumuşak köşe yuvarlaklıkları (`rounded-2xl` - `rounded-3xl`, 16-24px).
  - Çok hafif, yayvan gölgeler (`shadow-sm`, `shadow-[0_8px_30px_rgb(74,63,58,0.06)]`).
  - Statik pill rozet yığını yerine sade, unboxed tipografik meta veriler (`2.5 Saat · Başlangıç Seviyesi · Tüm Malzemeler Dahil`).

---

## 3. Temel Ürün Kararları & Mimari Tercihler

- **Karar 1: Kontenjan Yönetimi & 10 Dakikalık Geçici Rezervasyon (Race Condition Önleme)**
  - *Yaklaşım*: Kullanıcı ödeme adımına geçtiğinde seçilen seans için bilet adedi kadar "pending" rezervasyon kilidi oluşturulur ve 10 dakikalık geri sayım başlatılır.
  - *Neden*: Aynı anda iki kişinin son kalan 1 bileti almaya çalışmasını engellemek. 10 dakika içinde ödeme tamamlanmazsa veya işlem iptal edilirse kontenjan anında havuza iade edilir.
- **Karar 2: Misafir (Guest) vs. Üye Akışı**
  - *Yaklaşım*: Kullanıcı hesap açmaya zorlanmaz. Misafir olarak Ad, E-posta ve Telefon girerek biletini alabilir; onay sayfasında dilerse "Şifre belirle ve hesabını kaydet" seçeneği sunulur. Üye olanlar ise profil ekranından tüm biletlerini (yaklaşan ve geçmiş) QR kodlarıyla birlikte listeleyebilir.
- **Karar 3: Tek Adres & Lokasyon Gösterimi**
  - *Yaklaşım*: Kurslar tek bir adreste (Tunalı Hilmi Cd. No:48/B Çankaya, Ankara) verildiğinden, gereksiz karmaşık çoklu şube mekanizması yerine interaktif harita önizlemesi, otopark/toplu taşıma bilgisi ve tek tıkla Google Maps yönlendirmesi eklenir.
- **Karar 4: Gerçekçi Ödeme & E-posta Simülasyonu**
  - *Yaklaşım*: Kullanıcı harici API anahtarı girmeden de kusursuz bir şekilde akışı test edebilsin diye gerçekçi iyzico 3D Secure modalı ve test kredi kartı düğmeleri ("Tek Tıkla Başarılı Test Kartı") sunulur. İstenirse `.env` üzerinden iyzico ve Resend anahtarları entegre edilebilir.

---

## 4. Teknik Mimari & Veri Modeli

### Sistem & Bileşen Mimarisi

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Niche Craft Studio UI                         │
│                                                                        │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────┐ ┌────────────┐ │
│  │   Ana Sayfa   │ │ Kurslar/Filtre │ │  Kurs Detay   │ │  Hesabım   │ │
│  └───────┬───────┘ └────────┬───────┘ └───────┬───────┘ └─────┬──────┘ │
│          │                  │                 │               │        │
│          └──────────────────┴────────┬────────┴───────────────┘        │
│                                      ▼                                 │
│                         ┌─────────────────────────┐                    │
│                         │   Checkout & Rezervasyon│                    │
│                         │ (10 dk Sayaç & Kontenjan│                    │
│                         └────────────┬────────────┘                    │
│                                      ▼                                 │
│                         ┌─────────────────────────┐                    │
│                         │  iyzico Ödeme Simülatörü│                    │
│                         └────────────┬────────────┘                    │
│                                      ▼                                 │
│                         ┌─────────────────────────┐                    │
│                         │ Bilet Onay & SVG QR Kod │                    │
│                         └─────────────────────────┘                    │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Admin Yönetim Paneli                            │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────────┐ │
│  │ Kurs/Seans CRUD  │ │ Katılımcı Listesi│ │  QR Bilet Doğrulama    │ │
│  │  & Kontenjan     │ │  & CSV İndirme   │ │    (Kapı Check-in)      │ │
│  └──────────────────┘ └──────────────────┘ └─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Veri Modeli Taslağı

```typescript
// 1. User
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

// 2. Instructor
interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
}

// 3. Course
interface Course {
  id: string;
  title: string;
  slug: string;
  category: 'ceramic' | 'painting' | 'knitting' | 'jewelry' | 'calligraphy' | 'candle';
  categoryLabel: string;
  description: string;
  durationMinutes: number; // örn. 150 dk
  level: 'Başlangıç' | 'Orta Seviye' | 'Tüm Seviyeler';
  includedItems: string[]; // ['Çamur ve sırlar', '2 kez fırınlama', 'Kahve ikramı']
  instructorId: string;
  instructor: Instructor;
  imageUrl: string;
  basePrice: number;
  featured: boolean;
}

// 4. Session (Seans)
interface Session {
  id: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (örn. 14:00)
  endTime: string; // HH:mm (örn. 16:30)
  price: number; // TRY
  capacity: number; // örn. 8
  bookedCount: number; // kesin satılan biletler
  heldCount: number; // 10 dakikalık sepette kilitli biletler
}

// 5. ReservationHold (10 dk Geçici Kilit)
interface ReservationHold {
  id: string;
  sessionId: string;
  quantity: number;
  expiresAt: number; // epoch timestamp (+10 dk)
  heldBySessionKey: string;
}

// 6. Order & Ticket
interface Order {
  id: string;
  orderNumber: string; // örn. NCS-2026-8492
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sessionId: string;
  quantity: number;
  totalAmount: number;
  currency: 'TRY';
  status: 'paid' | 'cancelled' | 'refunded';
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketCode: string; // örn. NCS-TK-9382-01
  orderId: string;
  sessionId: string;
  attendeeName: string;
  attendeeEmail: string;
  checkedIn: boolean;
  checkedInAt?: string;
}
```

---

## 5. Aşamalı Geliştirme Yol Haritası

1. **Aşama 1: Tasarım Sistemi & Statik Sayfalar**
   - Krem, şeftali ve adaçayı yeşili renk token'ları, Fraunces serif + DM Sans tipografi, yumuşak gölgeler.
   - Header (Logo, Kurslar, Hakkımızda, İletişim, Hesabım / Admin girişi).
   - Ana sayfa hero, öne çıkan kurslar, yaklaşan seanslar şeridi, "Nasıl Çalışır?" 3 adımı, Tunalı atölye adres/harita bölümü.
   - Kurslar katalog sayfası (kategori filtreli) ve Hakkımızda/İletişim sayfası.
   - Kurs detay sayfası (açıklama, eğitmen, dahil olanlar, seans listesi ve kalan koltuklar).
2. **Aşama 2: Kurs/Seans Yönetimi & Admin Paneli**
   - Admin kimlik doğrulaması (`admin@nichecraft.com` / `admin123`).
   - Yeni kurs ekleme/düzenleme/silme.
   - Yeni seans oluşturma (tarih, saat, fiyat, kontenjan).
   - Katılımcı listesi görüntüleme ve CSV formatında indirme.
   - İptal/İade aksiyonu (seanstan 48 saat öncesine kadar kural kontrolü).
3. **Aşama 3: Bilet Satın Alma & 10 Dakika Kontenjan Kilitleme**
   - Koltuk adedi seçimi (maksimum 4 bilet).
   - 10 dakikalık geri sayım sayacı ve kontenjanı geçici olarak havuzdan düşürme.
   - Süre bittiğinde kullanıcıya nazik uyarı verip koltuğu geri serbest bırakma.
   - Misafir form doğrulaması (ad soyad, geçerli e-posta, telefon).
4. **Aşama 4: Ödeme Akışı & Sipariş Oluşturma**
   - iyzico tarzı güvenli kart ödeme arayüzü, 3D secure simülasyonu, test kartları ile anında tek tıkla test imkania.
   - Başarılı ödeme sonrası biletlerin kesinleştirilmesi ve benzersiz kodların üretilmesi.
5. **Aşama 5: QR Bilet, E-posta & Kapı Check-in Doğrulama**
   - Bilet onay sayfası: SVG tabanlı taranabilir QR kod, bilet özeti, takvime ekleme.
   - E-posta simülasyon kutusu (biletin e-posta çıktısı).
   - Admin kapı check-in ekranı: Kamera veya bilet kodu girişiyle QR doğrulama ve katılımcıyı "Giriş Yaptı" olarak kaydetme.
   - 6 zengin hazır atölye (Seramik Kupa, Suluboya Botanik, punch örgü, reçine kolye, modern kaligrafi, soya mumu yapımı) ve 12 gerçekçi seansla başlangıç tohum verisi.
