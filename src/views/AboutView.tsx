import React from 'react';
import { STUDIO_INFO, INITIAL_INSTRUCTORS } from '../data/initialData';
import { useStore } from '../context/StoreContext';
import { MapPin, Clock, Phone, Mail, Sparkles, Coffee, ShieldCheck, Heart } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setCurrentView } = useStore();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      {/* Hero Intro */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">
          Hakkımızda & Stüdyo Felsefesi
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#4A3F3A] leading-tight">
          Şehrin ritminden uzak, ellerin bilgeliğiyle dolu bir atölye.
        </h1>
        <p className="text-sm sm:text-base text-[#7E7067] leading-relaxed">
          Niche Craft Studio, 2024 yılında Ankara Tunalı Hilmi’deki sakin bir avluda kuruldu. Amacımız; yoğun şehir hayatında zihni yoran ekranlardan birkaç saatliğine uzaklaşıp, çamurun, mürekkebin, yünün ve doğal reçinenin dokusuyla buluşabileceğiniz huzurlu bir üretim sığınağı sunmaktır.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#E7DDCE] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4B59A]/30 flex items-center justify-center text-[#DE997C]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
            Deneyim Zorunluluğu Yok
          </h3>
          <p className="text-xs text-[#7E7067] leading-relaxed">
            Daha önce hiç fırça tutmamış ya da çamura dokunmamış olabilirsiniz. Eğitmenlerimiz her aşamayı sabırla ve adım adım gösterir.
          </p>
        </div>

        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#E7DDCE] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#A8BFA0]/30 flex items-center justify-center text-[#8AA481]">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
            Tüm Malzemeler & Kahve İkramı
          </h3>
          <p className="text-xs text-[#7E7067] leading-relaxed">
            Taş çamurundan fırınlamaya, Arches pamuk kağıtlardan pirinç takı kaidelerine tüm malzemeler hazır. Yanında taze demlenmiş kahveyle.
          </p>
        </div>

        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#E7DDCE] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4B59A]/30 flex items-center justify-center text-[#DE997C]">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
            Butik & Küçük Gruplar
          </h3>
          <p className="text-xs text-[#7E7067] leading-relaxed">
            Kalabalık ve gürültülü kurslar yerine maksimum 8–10 kişilik samimi masalar etrafında odaklanarak çalışıyoruz.
          </p>
        </div>
      </div>

      {/* Eğitmenlerimiz */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Ekibimiz</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A] mt-1">
            Atölye Eğitmenlerimiz
          </h2>
          <p className="text-xs text-[#7E7067] mt-1">
            Alanında uzman, tutkuyla üreten ve bildiklerini paylaşmaktan heyecan duyan zanaatkarlarımız.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_INSTRUCTORS.map((inst) => (
            <div
              key={inst.id}
              className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] space-y-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DE997C]/20 text-[#DE997C] font-display font-bold flex items-center justify-center text-lg">
                  {inst.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-[#4A3F3A]">{inst.name}</h4>
                  <span className="text-xs text-[#DE997C] font-medium block">{inst.title}</span>
                </div>
              </div>
              <p className="text-xs text-[#7E7067] leading-relaxed pt-1">{inst.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adres & Harita Bölümü */}
      <div className="bg-[#F3EADF] rounded-3xl p-6 sm:p-10 border border-[#E7DDCE]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Fiziksel Konum</span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A]">
              Tunalı Hilmi Caddesi No: 48/B
            </h2>
            <p className="text-xs sm:text-sm text-[#7E7067] leading-relaxed">
              Atölyemiz Ankara Çankaya’da, Kuğulu Park’ın hemen çaprazındaki pasajın sakin arka avlusunda yer almaktadır. Ulaşımı son derece rahattır.
            </p>

            <div className="space-y-3 text-xs text-[#4A3F3A]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DE997C] shrink-0 mt-0.5" />
                <span><strong>Adres:</strong> {STUDIO_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#DE997C] shrink-0" />
                <span><strong>Çalışma Saatleri:</strong> {STUDIO_INFO.hours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#DE997C] shrink-0" />
                <span><strong>Telefon & Danışma:</strong> {STUDIO_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#DE997C] shrink-0" />
                <span><strong>E-posta:</strong> {STUDIO_INFO.email}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={STUDIO_INFO.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F4B59A]" />
                <span>Google Haritalarda Yol Tarifi Al</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-5 border border-[#E7DDCE] shadow-sm space-y-3 text-xs">
              <span className="font-semibold text-[#4A3F3A] block">Ulaşım & Park İpuçları</span>
              <ul className="space-y-2 text-[#7E7067]">
                <li className="flex items-start gap-2">
                  <span className="text-[#DE997C] font-bold">·</span>
                  <span><strong>Toplu Taşıma:</strong> Kızılay Güvenpark’tan kalkan 114, 413, 408 no’lu EGO otobüsleri veya Tunalı dolmuşlarıyla Kuğulu Park durağında inebilirsiniz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DE997C] font-bold">·</span>
                  <span><strong>Otopark:</strong> Tunalı Hilmi Cd. üzerinde ücretli İspark noktaları ve Kuğulu İş Merkezi kapalı otoparkı mevcuttur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DE997C] font-bold">·</span>
                  <span><strong>Kapı Girişi:</strong> 48 numaralı binanın sol avlu kapısından girip zili çalabilirsiniz.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SSS (Sık Sorulan Sorular) */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-[#4A3F3A]">
          Sık Sorulan Sorular
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1.5">
            <span className="font-semibold text-sm text-[#4A3F3A] block">Daha önce hiç el sanatıyla uğraşmadım, gelebilir miyim?</span>
            <p className="text-[#7E7067] leading-relaxed">
              Kesinlikle evet! Atölyelerimizin %90’ı sıfır deneyimle gelen katılımcılar için tasarlanmıştır. Tüm teknikler başlangıç düzeyinden itibaren gösterilir.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1.5">
            <span className="font-semibold text-sm text-[#4A3F3A] block">Seramik ürünlerimi ne zaman teslim alabilirim?</span>
            <p className="text-[#7E7067] leading-relaxed">
              Seramik çamuru şekillendirildikten sonra yaklaşık 7 gün doğal kurumaya bırakılır, ardından bisküvi fırını ve sırlı pişirimden geçer. Yaklaşık 14–20 gün sonra ürününüz teslim edilmeye hazır olur.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1.5">
            <span className="font-semibold text-sm text-[#4A3F3A] block">Biletimi iptal edebilir veya seansımı değiştirebilir miyim?</span>
            <p className="text-[#7E7067] leading-relaxed">
              Evet. Seanstan 48 saat öncesine kadar bize ulaşarak veya admin/hesap üzerinden kesintisiz iptal ve iade hakkınız bulunmaktadır.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1.5">
            <span className="font-semibold text-sm text-[#4A3F3A] block">Atölyeye gelirken yanımda ne getirmeliyim?</span>
            <p className="text-[#7E7067] leading-relaxed">
              Sadece rahat edebileceğiniz kıyafetler. Önlükler, araçlar, malzemeler ve ikramlar stüdyomuz tarafından karşılanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
