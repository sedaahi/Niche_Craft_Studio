import React from 'react';
import { useStore } from '../context/StoreContext';
import { CourseCategory } from '../types';
import { STUDIO_INFO, heroCraftStudioImg } from '../data/initialData';
import { Calendar, Clock, MapPin, ArrowRight, Sparkles, Check, Users } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { courses, sessions, setCurrentView, getAvailableSeats } = useStore();

  const featuredCourses = courses.filter((c) => c.featured);

  // Sort upcoming sessions chronologically
  const upcomingSessions = [...sessions]
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
    .slice(0, 6);

  const getCourseForSession = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Warm Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-medium tracking-wider uppercase text-[#7E7067]">
                Tunalı Hilmi · Çankaya, Ankara
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#4A3F3A] leading-[1.15] text-balance">
                Ellerinizle üreteceğiniz dingin saatler.
              </h1>

              <p className="text-base sm:text-lg text-[#7E7067] leading-relaxed max-w-xl">
                Seramikten botanik suluboyaya, lif sanatından reçine takıya tek seferlik deneyim atölyeleri. Deneyim gerekmez; tüm malzemeler dahil, sakin bir ortamda kendi eserinizi üretin.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => setCurrentView({ view: 'courses' })}
                  className="px-6 py-3.5 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Atölye Seanslarını Keşfet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentView({ view: 'about' })}
                  className="px-5 py-3.5 bg-[#F3EADF] hover:bg-[#EBE0D2] text-[#4A3F3A] font-medium text-sm rounded-2xl border border-[#E7DDCE] transition-colors text-center cursor-pointer"
                >
                  Stüdyoyu & Konumu Gör
                </button>
              </div>

              {/* Unboxed Trust Markers */}
              <div className="pt-4 border-t border-[#E7DDCE]/70 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#7E7067]">
                <span>Maksimum 8–10 Kişi</span>
                <span aria-hidden="true" className="text-[#DE997C]">·</span>
                <span>Tüm Malzemeler & İkramlar Dahil</span>
                <span aria-hidden="true" className="text-[#DE997C]">·</span>
                <span>48 Saat İptal/İade Garantisi</span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(74,63,58,0.08)] border border-[#E7DDCE] bg-[#F3EADF] aspect-16/10">
                <img
                  src={heroCraftStudioImg}
                  alt="Niche Craft Studio Tunalı iç mekan gün ışığı ve seramik tezgahı"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3F3A]/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-0.5">
                    <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Stüdyomuzdan Bir Kare</span>
                    <h3 className="font-display text-lg font-medium text-white">Doğal ışıklı ahşap tezgahlar & sakin ritim</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Öne Çıkan Atölyeler (Featured Workshops Grid) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Seçkimiz</span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A] mt-1">
              Öne Çıkan Atölyeler
            </h2>
          </div>
          <button
            onClick={() => setCurrentView({ view: 'courses' })}
            className="text-xs sm:text-sm font-semibold text-[#4A3F3A] hover:text-[#DE997C] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Tüm Atölyeleri İncele ({courses.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setCurrentView({ view: 'course-detail', courseId: course.id })}
              className="group bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#E7DDCE] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#F3EADF]">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3.5 left-3.5 bg-[#FAF7F2]/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-medium text-[#4A3F3A] border border-[#E7DDCE]">
                  {course.categoryLabel}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#7E7067]">
                    <span>{course.durationMinutes} Dakika</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.level}</span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-[#4A3F3A] group-hover:text-[#DE997C] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#7E7067] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E7DDCE]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#7E7067] block">Seans Ücreti</span>
                    <span className="font-display text-base font-bold text-[#4A3F3A]">
                      {course.basePrice.toLocaleString('tr-TR')} TRY
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#DE997C] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Seansları Seç →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Yaklaşan Seanslar Şeridi (Upcoming Sessions) */}
      <section className="bg-[#F3EADF]/60 border-y border-[#E7DDCE] py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Hemen Katıl</span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A] mt-1">
              Yaklaşan Seanslar
            </h2>
            <p className="text-xs text-[#7E7067] mt-1">
              Kontenjan dolmadan yerinizi 10 dakikalık geçici rezervasyonla ayırtın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingSessions.map((session) => {
              const course = getCourseForSession(session.courseId);
              if (!course) return null;
              const available = getAvailableSeats(session.id);
              const isSoldOut = available <= 0;

              return (
                <div
                  key={session.id}
                  className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E7DDCE] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#7E7067]">
                      <span className="font-semibold text-[#4A3F3A]">{course.categoryLabel}</span>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#DE997C]" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                    </div>

                    <h4 className="font-display text-base font-semibold text-[#4A3F3A] leading-tight">
                      {course.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-[#7E7067]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Maks {session.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E7DDCE]/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-display text-base font-bold text-[#4A3F3A] block">
                        {session.price.toLocaleString('tr-TR')} TRY
                      </span>
                      <span className={`text-[11px] font-medium ${
                        isSoldOut 
                          ? 'text-red-700 font-semibold' 
                          : available <= 3 
                            ? 'text-[#DE997C] font-semibold' 
                            : 'text-[#8AA481]'
                      }`}>
                        {isSoldOut ? 'Tükendi' : `Son ${available} Koltuk`}
                      </span>
                    </div>

                    {isSoldOut ? (
                      <button
                        disabled
                        className="px-3.5 py-2 text-xs font-medium text-[#7E7067] bg-[#EBE0D2] rounded-xl cursor-not-allowed opacity-60"
                      >
                        Tükendi
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setCurrentView({
                            view: 'checkout',
                            sessionId: session.id,
                            initialQuantity: 1,
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        Yerini Ayır
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Nasıl Çalışır? (3 Adım) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Adım Adım</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A]">
            Nasıl Çalışır?
          </h2>
          <p className="text-xs sm:text-sm text-[#7E7067]">
            Karmaşık kayıt prosedürleri yok. Bir kahve molası verir gibi atölyenizi seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E7DDCE] space-y-3.5">
            <div className="font-display text-2xl font-bold text-[#DE997C]">01</div>
            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">Atölyeni & Seansını Seç</h3>
            <p className="text-xs text-[#7E7067] leading-relaxed">
              Seramik, suluboya, takı veya örgü atölyelerimiz arasından ilgini çeken konuyu ve takvimine uyan günü belirle.
            </p>
          </div>

          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E7DDCE] space-y-3.5">
            <div className="font-display text-2xl font-bold text-[#DE997C]">02</div>
            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">10 Dakika Güvenli Kilit</h3>
            <p className="text-xs text-[#7E7067] leading-relaxed">
              Koltuk seçtiğinde kontenjan 10 dakika boyunca adına ayrılır. Misafir veya üye olarak iyzico güvencesiyle biletini al.
            </p>
          </div>

          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E7DDCE] space-y-3.5">
            <div className="font-display text-2xl font-bold text-[#DE997C]">03</div>
            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">Stüdyoda Buluşalım</h3>
            <p className="text-xs text-[#7E7067] leading-relaxed">
              Tunalı atölyemize gel; tüm kaliteli malzemeler, fırınlama ve kahve ikramı hazır. Kendi el emeğinle eve dön.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Tunalı Adres & Stüdyo Bölümü */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#F3EADF] rounded-3xl p-6 sm:p-10 border border-[#E7DDCE] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Tek Adres · Butik Deneyim</span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A]">
                Tunalı Hilmi’nin Kalbinde Sakin Bir Atölye
              </h2>
              <p className="text-xs sm:text-sm text-[#7E7067] leading-relaxed">
                Tüm atölyelerimiz Ankara Çankaya’da, Kuğulu Park’a yürüme mesafesinde yer alan tek adresimizde gerçekleştirilir. Avlu içindeki dingin alanımız ve geniş pencerelerimiz doğal ışıkla üretim yapmak için özel tasarlandı.
              </p>

              <div className="space-y-2 text-xs text-[#4A3F3A]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#DE997C] shrink-0 mt-0.5" />
                  <span><strong>Adres:</strong> {STUDIO_INFO.address} ({STUDIO_INFO.landmark})</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#DE997C] shrink-0" />
                  <span><strong>Çalışma Saatleri:</strong> {STUDIO_INFO.hours}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={STUDIO_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-medium rounded-xl transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Google Haritalarda Aç</span>
                </a>
                <button
                  onClick={() => setCurrentView({ view: 'about' })}
                  className="px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#4A3F3A] text-xs font-medium rounded-xl border border-[#E7DDCE] transition-colors cursor-pointer"
                >
                  Ulaşım & Park Detayları
                </button>
              </div>
            </div>

            {/* Stylized Visual Map Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 border border-[#E7DDCE] shadow-sm space-y-4">
                <div className="h-44 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-[#DE997C]/20 flex items-center justify-center text-[#DE997C] mb-2">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-display text-sm font-semibold text-[#4A3F3A]">
                    Niche Craft Studio
                  </span>
                  <span className="text-[11px] text-[#7E7067] mt-0.5">
                    Tunalı Hilmi Cd. No: 48/B
                  </span>
                  <span className="text-[10px] text-[#A8BFA0] font-semibold mt-1">
                    Kuğulu Park yanı · Metro Kızılay aktarmalı
                  </span>
                </div>

                <div className="text-[11px] text-[#7E7067] leading-relaxed">
                  <strong>Toplu Taşıma:</strong> Kızılay’dan 114, 413 veya 408 no’lu otobüslerle Kuğulu durağında inebilirsiniz. Tunalı cadde otoparkları 100m mesafededir.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
