import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CourseCategory } from '../types';
import { STUDIO_INFO, heroCraftStudioImg } from '../data/initialData';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Check,
  Users,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Quote,
} from 'lucide-react';
import { WorkshopCalendar } from '../components/WorkshopCalendar';

export const HomeView: React.FC = () => {
  const {
    courses,
    sessions,
    posts,
    userLikes,
    toggleLikePost,
    setCurrentView,
    getAvailableSeats,
  } = useStore();

  const [activeCraftCategory, setActiveCraftCategory] = useState<string>('all');
  const [carouselPage, setCarouselPage] = useState<number>(0);

  // Filter approved crafts for Home carousel
  const publishedCrafts = posts.filter((p) => p.status === 'published');
  const homeEligibleCrafts = publishedCrafts.filter((p) => p.showOnHome !== false);
  const baseCraftList = homeEligibleCrafts.length > 0 ? homeEligibleCrafts : publishedCrafts;

  const filteredCraftPosts = baseCraftList.filter((p) => {
    if (activeCraftCategory === 'all') return true;
    return p.category === activeCraftCategory;
  });

  const craftsPerPage = 3;
  const totalCraftPages = Math.max(1, Math.ceil(filteredCraftPosts.length / craftsPerPage));
  const paginatedCraftPosts = filteredCraftPosts.slice(
    carouselPage * craftsPerPage,
    (carouselPage + 1) * craftsPerPage
  );

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

      {/* 2.5. Seramik & Suluboya Takvim Görünümü (Calendar View Component) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <WorkshopCalendar />
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

      {/* 4.5. Katılımcı Eserleri & Gerçek Atölye Yorumları Karoseli (Ödev 3) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#E7DDCE] space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E7DDCE] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4B59A]/30 text-[#DE997C] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Onaylı Katılımcı Deneyimleri & Eserleri</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A]">
                Katılımcılarımızın Elinden Çıkan Eserler & Yorumlar
              </h2>
              <p className="text-xs sm:text-sm text-[#7E7067] mt-1.5 max-w-2xl leading-relaxed">
                Tunalı stüdyomuzdaki atölyelere katılıp elleriyle üreten misafirlerimizin fotoğrafladığı gerçek eserler ve 5 yıldızlı deneyim notları. Kurs seçmeden önce ortaya çıkan ürünleri inceleyip ilham alın.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Carousel Previous / Next Controls */}
              <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-2xl border border-[#E7DDCE] shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCarouselPage((prev) => Math.max(0, prev - 1))}
                  disabled={carouselPage === 0}
                  aria-label="Önceki Eserler"
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    carouselPage === 0
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-[#4A3F3A] hover:bg-[#FAF7F2] hover:text-[#DE997C]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-[#7E7067] px-2 min-w-[55px] text-center">
                  {totalCraftPages > 0 ? `${carouselPage + 1} / ${totalCraftPages}` : '1 / 1'}
                </span>
                <button
                  type="button"
                  onClick={() => setCarouselPage((prev) => Math.min(totalCraftPages - 1, prev + 1))}
                  disabled={carouselPage >= totalCraftPages - 1}
                  aria-label="Sonraki Eserler"
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    carouselPage >= totalCraftPages - 1
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-[#4A3F3A] hover:bg-[#FAF7F2] hover:text-[#DE997C]'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setCurrentView({ view: 'community' })}
                className="px-4 py-2.5 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>Tüm Galeriyi Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-[#7E7067] uppercase tracking-wider shrink-0 mr-1">
              Kategori:
            </span>
            {[
              { key: 'all', label: 'Tüm Eserler' },
              { key: 'ceramic', label: 'Seramik' },
              { key: 'painting', label: 'Resim & Suluboya' },
              { key: 'jewelry', label: 'Takı Tasarımı' },
              { key: 'candle', label: 'Mum & Koku' },
              { key: 'textile', label: 'Tekstil & Nakış' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCraftCategory(cat.key);
                  setCarouselPage(0);
                }}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeCraftCategory === cat.key
                    ? 'bg-[#DE997C] text-white shadow-xs'
                    : 'bg-white text-[#7E7067] border border-[#E7DDCE] hover:text-[#4A3F3A] hover:border-[#DE997C]/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Carousel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
            {paginatedCraftPosts.length === 0 ? (
              <div className="col-span-full p-10 text-center bg-white rounded-3xl border border-[#E7DDCE] text-xs text-[#7E7067] space-y-2">
                <Sparkles className="w-6 h-6 text-[#DE997C] mx-auto" />
                <p className="font-semibold text-sm text-[#4A3F3A]">Bu kategoride henüz yayınlanmış eser bulunmuyor.</p>
                <p>Tüm kategorileri görmek için "Tüm Eserler" filtresine tıklayabilirsiniz.</p>
              </div>
            ) : (
              paginatedCraftPosts.map((post) => {
                const isLiked = userLikes.includes(post.id);

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-[#E7DDCE] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      {post.imageUrl && (
                        <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden border-b border-[#E7DDCE]">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/95 text-[#4A3F3A] backdrop-blur-xs shadow-xs border border-white/40">
                              {post.categoryLabel || 'Zanaat'}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Doğrulanmış Katılımcı</span>
                            </span>
                          </div>
                          {/* Floating Like Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikePost(post.id);
                            }}
                            className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer backdrop-blur-xs ${
                              isLiked
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-[#4A3F3A] hover:bg-white'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-red-500'}`} />
                            <span className="text-[11px]">{post.likesCount}</span>
                          </button>
                        </div>
                      )}

                      <div className="p-5 space-y-3">
                        {/* Rating & Author */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= (post.rating || 5)
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-[#DE997C] ml-1">
                              {post.rating || 5}.0
                            </span>
                          </div>
                          <span className="text-[10px] text-[#7E7067]">
                            Katılımcı: <strong className="text-[#4A3F3A]">{post.authorName}</strong>
                          </span>
                        </div>

                        {/* Title & Workshop Name */}
                        <div>
                          <h4 className="font-display text-base font-bold text-[#4A3F3A] leading-snug group-hover:text-[#DE997C] transition-colors">
                            {post.title}
                          </h4>
                          {post.workshopTitle && (
                            <span className="text-[11px] text-[#DE997C] font-semibold block mt-0.5 truncate">
                              Atölye: {post.workshopTitle}
                            </span>
                          )}
                        </div>

                        {/* Participant Review Quote */}
                        <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E7DDCE]/70 text-xs text-[#5A4E46] italic leading-relaxed relative">
                          <Quote className="w-3.5 h-3.5 text-[#DE997C]/50 absolute top-2 right-2" />
                          "{post.description}"
                        </div>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="p-4 bg-[#FAF7F2] border-t border-[#E7DDCE] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#7E7067]">
                        📅 {post.createdAt} · Tunalı
                      </span>
                      {post.workshopId ? (
                        <button
                          type="button"
                          onClick={() => setCurrentView({ view: 'course-detail', courseId: post.workshopId })}
                          className="px-3 py-1.5 bg-[#4A3F3A] hover:bg-[#DE997C] text-white text-[11px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <span>Bu Atölyeyi İncele & Bilet Al</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCurrentView({ view: 'courses' })}
                          className="text-xs font-semibold text-[#DE997C] hover:underline cursor-pointer"
                        >
                          Atölyeleri Gör →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dots pagination */}
          {totalCraftPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {Array.from({ length: totalCraftPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselPage(idx)}
                  aria-label={`Sayfa ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    carouselPage === idx
                      ? 'w-6 bg-[#DE997C]'
                      : 'w-2 bg-[#E7DDCE] hover:bg-[#DE997C]/50'
                  }`}
                />
              ))}
            </div>
          )}
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
