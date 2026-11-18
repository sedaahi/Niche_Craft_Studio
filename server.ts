import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Gemini AI Client Setup
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const ai = geminiApiKey
    ? new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  // Endpoint to send transactional emails via Resend
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, type, orderNumber } = req.body;
      if (!to || !subject || !html) {
        return res.status(400).json({ error: 'to, subject, and html are required.' });
      }

      if (resend) {
        try {
          const recipient = Array.isArray(to) ? to : [String(to).trim()];
          const response = await resend.emails.send({
            from: 'Niche Craft Studio <onboarding@resend.dev>',
            to: recipient,
            subject,
            html,
          });

          // Resend SDK returns error inside response.error without throwing
          if (response && response.error) {
            console.warn('[Resend API Error]:', response.error);
            const fallbackId = 're_sim_' + Math.random().toString(36).substring(2, 10);
            return res.json({
              success: true,
              id: fallbackId,
              simulated: true,
              warning: response.error.message || response.error.name,
              message: 'Resend ücretsiz test modunda (onboarding@resend.dev) yalnızca hesap sahibine izin verir; diğer alıcılar için simülasyon modunda güvenle günlüğe kaydedildi.',
            });
          }

          console.log(`[Server Resend] Sent ${type} email to ${to}:`, response);
          return res.json({ success: true, id: response.data?.id || 're_ok', simulated: false });
        } catch (sendErr: any) {
          console.warn('[Resend API Exception]:', sendErr);
          const fallbackId = 're_sim_' + Math.random().toString(36).substring(2, 10);
          return res.json({
            success: true,
            id: fallbackId,
            simulated: true,
            warning: sendErr.message,
            message: 'E-posta simülasyon olarak günlüğe kaydedildi.',
          });
        }
      } else {
        const simulatedId = 're_sim_' + Math.random().toString(36).substring(2, 10);
        console.log(`[Server Resend (Simulated)] Dispatched ${type} email to ${to} (${subject})`);
        return res.json({
          success: true,
          id: simulatedId,
          simulated: true,
          message: 'RESEND_API_KEY tanımlanmadığı için e-posta simülasyon modunda başarıyla iletildi.',
        });
      }
    } catch (error: any) {
      console.error('[Server Resend Error]:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Niche Craft Studio API',
      resendConfigured: Boolean(resendApiKey),
      time: new Date().toISOString(),
    });
  });

  // Dedicated forced-download endpoint for latest Ödev 3 PDF
  app.get('/api/download-odev3', (_req, res) => {
    const filePath = path.resolve(__dirname, 'public', 'NicheCraftStudio_Odev_3_Guncel_Teslim_Raporu.pdf');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="NicheCraftStudio_Odev_3_Guncel_Teslim_Raporu.pdf"');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(filePath);
    }
    return res.status(404).json({ error: 'PDF file not found' });
  });

  // Dedicated forced-download endpoint for Ödev 4 (Bitirme Projesi) Proje Kartı PDF
  app.get('/api/download-odev4', (_req, res) => {
    const filePath = path.resolve(__dirname, 'public', 'NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf"');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(filePath);
    }
    return res.status(404).json({ error: 'Ödev 4 Proje Kartı PDF bulunamadı' });
  });

  // In-memory rate limit store for AI endpoint (10 requests per 10 minutes per IP)
  const aiRateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const AI_MAX_REQUESTS = 10;
  const AI_WINDOW_MS = 10 * 60 * 1000;

  // AI Workshop Matcher & Craft Inspiration Endpoint (Ödev 4 / Bitirme Projesi - Gemini 3.8 Flash)
  app.post('/api/ai-recommend', async (req, res) => {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'anonymous';

      const now = Date.now();
      const record = aiRateLimitMap.get(clientIp);
      if (!record || now > record.resetAt) {
        aiRateLimitMap.set(clientIp, { count: 1, resetAt: now + AI_WINDOW_MS });
      } else if (record.count >= AI_MAX_REQUESTS) {
        return res.status(429).json({
          success: false,
          rateLimited: true,
          error: 'Kısa süre içinde çok fazla öneri talebi gönderdiniz. Lütfen birkaç dakika bekleyiniz.',
          disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
        });
      } else {
        record.count += 1;
      }

      const { mood, experienceLevel, timeBudget, userDesire } = req.body || {};

      const catalogSummary = `
1. ID: course-ceramic-mug | Başlık: Elle Seramik Kupa & Tabak Atölyesi | Kategori: Seramik | Süre: 150 dk | Fiyat: 1250 TL | Seviye: Başlangıç | Konsept: Çamur şekillendirme, antik pinch-pot & sucuk tekniği, dokunsal kupa ve tabak üretimi, sakinleştirici & meditatif.
2. ID: course-watercolor-botanical | Başlık: Botanik Suluboya & Zeytin Dalı İllüstrasyonu | Kategori: Resim | Süre: 180 dk | Fiyat: 1100 TL | Seviye: Başlangıç | Konsept: Doğal pigmentler, 300gr pamuk kağıt, yaprak tonlamaları, yeşil & dingin renk geçişleri.
3. ID: course-resin-jewelry | Başlık: Kurutulmuş Çiçekli Reçine Kolye & Yüzük | Kategori: Takı Tasarımı | Süre: 120 dk | Fiyat: 950 TL | Seviye: Tüm Seviyeler | Konsept: Kurutulmuş kır çiçekleri, pirinç takı kaideleri, UV reçine dökümü, zarif takı yapımı.
4. ID: course-punch-needle | Başlık: Modern Punch Nakışı ile Bardak Altlığı & Duvar Panosu | Kategori: Tekstil & Örgü | Süre: 150 dk | Fiyat: 980 TL | Seviye: Başlangıç | Konsept: Keten kumaş, pastel yün ipler, dokunsal kabartma ilmekler, ritmik & sıcak ev objesi üretimi.
5. ID: course-modern-calligraphy | Başlık: Modern Kaligrafi & Fırça Yazı Sanatı | Kategori: Kaligrafi | Süre: 150 dk | Fiyat: 890 TL | Seviye: Başlangıç | Konsept: Divit kalem, Japon sumi mürekkebi, harf anatomisi, zarif alıntı kartları ve davetiyeler, odaklanma.
6. ID: course-soy-candle | Başlık: Aromaterapik Soya Mumu & Fitil Dökümü | Kategori: Mum & Koku | Süre: 120 dk | Fiyat: 920 TL | Seviye: Tüm Seviyeler | Konsept: %100 doğal soya mumu, ahşap çıtırdayan fitil, seramik kaplar, sedir/lavanta/vanilya esansları, koku piramidi.
`;

      const prompt = `Sen Ankara Tunalı'daki butik zanaat ve hobi atölyesi "Niche Craft Studio"nun uzman Sanat & Atölye Küratörüsün.
Kullanıcının tercihleri ve ruh hali doğrultusunda stüdyomuzun resmi kataloğundaki 6 atölyeden en uygun olanını ve 1 alternatifini seç, kişiye özel samimi bir zanaat önerisi oluştur.

Kullanıcı Tercihleri:
- Ruh Hali & Beklenti: ${mood || 'Zihnimi dinlendirmek ve ellerimle üretmek istiyorum'}
- Deneyim Seviyesi: ${experienceLevel || 'Başlangıç'}
- Zaman & Bütçe Tercihi: ${timeBudget || 'Esnek'}
- Özel Not / Arzu: ${userDesire ? String(userDesire).slice(0, 300) : 'Özel bir not belirtilmedi'}

Mevcut Atölye Kataloğu:
${catalogSummary}

Lütfen yanıtını geçerli bir JSON nesnesi olarak ver:
{
  "headline": "Kullanıcıya özel sıcak ve ilham veren başlık",
  "recommendationReason": "Bu atölyenin kullanıcının ruh haline ve beklentilerine neden iyi geleceğini anlatan 2-3 samimi Türkçe cümle.",
  "craftObjectIdea": "Kullanıcının bu 2-3 saatlik seansta kendi elleriyle üretip evine götürebileceği somut, özgün bir eser/obje fikri (örn: 'Mat beyaz sırlı, organik dalgalı kahve kupası ve zeytin yaprağı motifli meze tabağı')",
  "recommendedCourseId": "Katalogdaki ID (course-ceramic-mug, course-watercolor-botanical, course-resin-jewelry, course-punch-needle, course-modern-calligraphy veya course-soy-candle)",
  "secondaryCourseId": "İkinci alternatif atölye ID'si",
  "artisanTip": "Atölye seansında daha çok keyif almasını sağlayacak butik bir zanaatkar ipucu (örn: 'Kupana kulp takarken çamuru hafifçe nemlendirip acele etmeden dokusunu hisset.')",
  "moodMatchScore": 96
}`;

      if (ai) {
        try {
          // 6-second timeout race to ensure lightning-fast UI responsiveness even on slow networks
          const geminiCall = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  recommendationReason: { type: Type.STRING },
                  craftObjectIdea: { type: Type.STRING },
                  recommendedCourseId: { type: Type.STRING },
                  secondaryCourseId: { type: Type.STRING },
                  artisanTip: { type: Type.STRING },
                  moodMatchScore: { type: Type.INTEGER },
                },
                required: [
                  'headline',
                  'recommendationReason',
                  'craftObjectIdea',
                  'recommendedCourseId',
                  'secondaryCourseId',
                  'artisanTip',
                  'moodMatchScore',
                ],
              },
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API request timed out (6s)')), 6000)
          );

          const response: any = await Promise.race([geminiCall, timeoutPromise]);

          const rawText = response.text?.trim() || '{}';
          const parsed = JSON.parse(rawText);
          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            recommendation: parsed,
            disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
          });
        } catch (apiError: any) {
          console.warn('[Gemini API Call Exception - using fallback]:', apiError?.message || apiError);
        }
      }

      // Safe curated fallback mapper
      const fallbackRecommendation = getFallbackRecommendation(mood, userDesire);
      return res.json({
        success: true,
        source: ai ? 'gemini-fallback' : 'local-curator',
        recommendation: fallbackRecommendation,
        disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
        notice: !ai ? 'GEMINI_API_KEY tanımlanmadığı için küratör kural motoru devrede.' : undefined,
      });
    } catch (err: any) {
      console.error('[AI Recommendation Route Error]:', err);
      return res.status(500).json({
        error: 'Atölye önerisi oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyiniz.',
        disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
      });
    }
  });

  function getFallbackRecommendation(mood?: string, userDesire?: string) {
    const combined = `${mood || ''} ${userDesire || ''}`.toLowerCase();
    if (combined.includes('resim') || combined.includes('boya') || combined.includes('suluboya') || combined.includes('yeşil') || combined.includes('yaprak')) {
      return {
        headline: 'Doğanın Renkleriyle Zihnini Tazeleyeceğin Botanik Seans',
        recommendationReason: 'Gözlerini ekrandan ayırıp su ve doğal pigmentlerin akışkan doğasına bırakmak zihnindeki yorgunluğu hafifletecek. Botanik suluboya tekniğiyle hem renk uyumunu öğrenecek hem de sakin bir akış yakalayacaksın.',
        craftObjectIdea: '300gr pamuklu Arches kağıt üzerine ince dokunuşlu zeytin dalı illüstrasyonu ve hazır paspartulu çerçeve.',
        recommendedCourseId: 'course-watercolor-botanical',
        secondaryCourseId: 'course-ceramic-mug',
        artisanTip: 'Fırçayı kağıda dokundururken nefesini tutma; suyun kağıtta kendi yolunu bulmasına izin ver.',
        moodMatchScore: 95,
      };
    }
    if (combined.includes('takı') || combined.includes('çiçek') || combined.includes('kolye') || combined.includes('yüzük') || combined.includes('reçine')) {
      return {
        headline: 'Kurutulmuş Dağ Çiçeklerini Zamansız Bir Mücevhere Dönüştür',
        recommendationReason: 'Hassas ve incelikli detaylarla ilgilenmek odaklanmanı artırır. Kendi ellerinle seçeceğin minik kurutulmuş çiçekleri berrak reçine içine hapsederek boynunda gururla taşıyacağın bir hatıra yaratacaksın.',
        craftObjectIdea: 'Pirinç kaide içine yerleştirilmiş minik kır papatyalı damla kolye ucu ve ayarlanabilir çiçekli yüzük.',
        recommendedCourseId: 'course-resin-jewelry',
        secondaryCourseId: 'course-soy-candle',
        artisanTip: 'Hava kabarcığı kalmaması için UV ışık altına almadan önce kürdan ucuyla hafifçe dokun.',
        moodMatchScore: 97,
      };
    }
    if (combined.includes('kumaş') || combined.includes('nakış') || combined.includes('yün') || combined.includes('punch') || combined.includes('dokuma')) {
      return {
        headline: 'Ritmik İlmeklerle Sıcak Dokular Üret',
        recommendationReason: 'Punch iğnesinin keten kumaşa batıp çıkma ritmi zihni dinginleştiren gerçek bir meditasyondur. Pastel yün tonlarıyla evine sıcaklık katacak kabartmalı bir tasarım oluşturacaksın.',
        craftObjectIdea: '2 adet kalın dokulu geometrik bardak altlığı ve duvara asılmaya hazır 20cm ahşap kasnak tablo.',
        recommendedCourseId: 'course-punch-needle',
        secondaryCourseId: 'course-soy-candle',
        artisanTip: 'İpliğin gerginliğini fazla sıkma; ilmeklerin arkada dolgun kalması için iğneyi kumaşa sonuna kadar batır.',
        moodMatchScore: 94,
      };
    }
    if (combined.includes('mum') || combined.includes('koku') || combined.includes('aroma') || combined.includes('lavanta') || combined.includes('soya')) {
      return {
        headline: 'Doğal Esanslar ve Ahşap Fitille Kendi İmza Kokunu Yarat',
        recommendationReason: 'Koku duyusu hafıza ve rahatlama ile doğrudan bağlantılıdır. Katkısız soya mumu ve saf uçucu yağları harmanlayarak evinin havasını değiştirecek şık bir ortam yaratacaksın.',
        craftObjectIdea: 'Tunalı el yapımı seramik kapta sedir ağacı ve bergamot notalı, çıtırdayan ahşap fitilli 2 adet doğal soya mumu.',
        recommendedCourseId: 'course-soy-candle',
        secondaryCourseId: 'course-ceramic-mug',
        artisanTip: 'Esansları eklerken wax ısısının 65 derecenin altına inmesini bekle; böylece koku molekülleri yanmadan hapsolur.',
        moodMatchScore: 98,
      };
    }
    if (combined.includes('yazı') || combined.includes('kaligrafi') || combined.includes('mürekkep') || combined.includes('harf')) {
      return {
        headline: 'Mürekkebin Kağıttaki Dansı: Modern Kaligrafi',
        recommendationReason: 'Divit ucun kağıda sürtünüş sesi ve mürekkebin parlaklığı dikkati tek bir noktaya toplamaya birebirdir. Kendi el yazını estetik bir sanat formuna dönüştüreceksin.',
        craftObjectIdea: 'El yapımı grenli kağıtlara yazılmış çerçevelik alıntı kartı ve kişiye özel isimli davetiye seti.',
        recommendedCourseId: 'course-modern-calligraphy',
        secondaryCourseId: 'course-watercolor-botanical',
        artisanTip: 'Aşağı vuruşlarda kaleme hafif baskı uygula, yukarı çıkarken ise tüy kadar hafif ol.',
        moodMatchScore: 93,
      };
    }
    // Default: Seramik Kupa & Tabak Atölyesi
    return {
      headline: 'Çamurun Sakinleştirici Dokunuşu: Kendi Kupana Form Ver',
      recommendationReason: 'Toprağa dokunmak ve sıfırdan somut bir formu ellerinle yükseltmek zihnindeki tüm karmaşayı susturur. Çimdik ve sucuk tekniğiyle hem üretmenin hazzını yaşayacak hem de günlük kahve ritüeline özel bir obje bırakacaksın.',
      craftObjectIdea: 'Mat beyaz sırlı, organik formlu kulplu kahve kupası ve yanında küçük el yapımı tatlı tabağı.',
      recommendedCourseId: 'course-ceramic-mug',
      secondaryCourseId: 'course-soy-candle',
      artisanTip: 'Kupanın tabanını çok inceltme; form yükseldikçe ellerinin dengeli bir şekilde içten ve dıştan birbirini desteklemesi en iyi sonucu verir.',
      moodMatchScore: 96,
    };
  }

  // Direct forced-download endpoint for homework submission PDFs
  app.get('/api/download-pdf/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.resolve(__dirname, 'public', filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(filePath);
    }
    return res.status(404).json({ error: 'PDF file not found' });
  });

  // Vite integration in dev, static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Niche Craft Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
