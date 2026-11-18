import { GoogleGenAI, Type } from '@google/genai';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string | undefined>;
}

// In-memory rate limit store (best effort per warm function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(clientKey: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientKey);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

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

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const clientIp =
      event.headers['x-nf-client-connection-ip'] ||
      event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      'anonymous';

    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          rateLimited: true,
          error: 'Kısa süre içinde çok fazla öneri talebi gönderdiniz. Lütfen birkaç dakika bekleyiniz.',
          disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
        }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { mood, experienceLevel, timeBudget, userDesire } = body;

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
- Ruh Hali & Beklenti: ${mood ? String(mood).slice(0, 120) : 'Zihnimi dinlendirmek ve ellerimle üretmek istiyorum'}
- Deneyim Seviyesi: ${experienceLevel ? String(experienceLevel).slice(0, 100) : 'Başlangıç'}
- Zaman & Bütçe Tercihi: ${timeBudget ? String(timeBudget).slice(0, 100) : 'Esnek'}
- Özel Not / Arzu: ${userDesire ? String(userDesire).slice(0, 200) : 'Özel bir not belirtilmedi'}

Mevcut Atölye Kataloğu:
${catalogSummary}

Lütfen yanıtını geçerli bir JSON nesnesi olarak ver.`;

    if (ai) {
      try {
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
          setTimeout(() => reject(new Error('Gemini API request timed out (7s)')), 7000)
        );

        const response: any = await Promise.race([geminiCall, timeoutPromise]);
        const rawText = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            source: 'gemini-3.8-flash',
            remaining: rate.remaining,
            recommendation: parsed,
            disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
          }),
        };
      } catch (apiError: any) {
        console.warn('[Netlify AI Function Fallback]:', apiError?.message || apiError);
      }
    }

    const fallbackRecommendation = getFallbackRecommendation(mood, userDesire);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        source: ai ? 'gemini-fallback' : 'local-curator',
        remaining: rate.remaining,
        recommendation: fallbackRecommendation,
        disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
      }),
    };
  } catch (err: any) {
    console.error('[Netlify AI Function Error]:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        source: 'local-curator',
        recommendation: getFallbackRecommendation(),
        disclaimer: '✨ Yapay zekâ önerisidir, kontrol ediniz.',
      }),
    };
  }
};
