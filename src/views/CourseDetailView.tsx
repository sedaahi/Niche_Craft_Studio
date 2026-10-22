import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { STUDIO_INFO } from '../data/initialData';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  Users,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface CourseDetailViewProps {
  courseId: string;
  autoSelectSessionId?: string;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  autoSelectSessionId,
}) => {
  const { courses, sessions, setCurrentView, getAvailableSeats } = useStore();

  const course = courses.find((c) => c.id === courseId) || courses[0];
  const courseSessions = sessions
    .filter((s) => s.courseId === course.id)
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    autoSelectSessionId || (courseSessions[0]?.id ?? '')
  );

  const selectedSession = courseSessions.find((s) => s.id === selectedSessionId) || courseSessions[0];
  const selectedAvailable = selectedSession ? getAvailableSeats(selectedSession.id) : 0;
  const isSelectedSoldOut = selectedAvailable <= 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleBookNow = () => {
    if (!selectedSession || isSelectedSoldOut) return;
    setCurrentView({
      view: 'checkout',
      sessionId: selectedSession.id,
      initialQuantity: 1,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => setCurrentView({ view: 'courses' })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7E7067] hover:text-[#4A3F3A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Atölyelere Dön</span>
        </button>
      </div>

      {/* Main Grid: Left Details & Right Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7 cols): Visuals, Descriptions, Instructor */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Photo Card */}
          <div className="rounded-3xl overflow-hidden border border-[#E7DDCE] shadow-sm bg-[#F3EADF] aspect-16/10 relative">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 bg-[#FAF7F2]/90 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-semibold text-[#4A3F3A] border border-[#E7DDCE]">
              {course.categoryLabel}
            </div>
          </div>

          {/* Title & Metadata Strip */}
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#4A3F3A] leading-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#7E7067]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#DE997C]" />
                {course.durationMinutes} Dakika
              </span>
              <span aria-hidden="true" className="text-[#DE997C]">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true" className="text-[#DE997C]">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#DE997C]" />
                Tunalı Hilmi, Ankara
              </span>
            </div>
          </div>

          {/* Long Description */}
          <div className="space-y-3 border-t border-[#E7DDCE] pt-6">
            <h2 className="font-display text-lg font-semibold text-[#4A3F3A]">Atölye Hakkında</h2>
            <p className="text-sm text-[#7E7067] leading-relaxed whitespace-pre-line">
              {course.longDescription}
            </p>
          </div>

          {/* Included Items List */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] space-y-3">
            <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
              Atölye Ücretine Neler Dahil?
            </h3>
            <p className="text-xs text-[#7E7067]">
              Atölyeye sadece kendinizi ve merakınızı getirmeniz yeterli. Tüm profesyonel malzemeler ve ikramlar stüdyomuz tarafından sağlanır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {course.includedItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#4A3F3A]">
                  <div className="w-4 h-4 rounded-full bg-[#A8BFA0]/20 flex items-center justify-center text-[#8AA481] shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#DE997C]/20 border border-[#DE997C]/30 flex items-center justify-center text-lg font-display font-bold text-[#DE997C] shrink-0">
              {course.instructor.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <span className="text-xs text-[#7E7067]">Atölye Eğitmeni</span>
              <h4 className="font-display text-base font-semibold text-[#4A3F3A]">
                {course.instructor.name}
              </h4>
              <span className="text-xs text-[#DE997C] font-medium block">
                {course.instructor.title}
              </span>
              <p className="text-xs text-[#7E7067] leading-relaxed pt-1">
                {course.instructor.bio}
              </p>
            </div>
          </div>

          {/* Studio & Address Guarantee */}
          <div className="p-4 rounded-2xl bg-[#F3EADF]/60 border border-[#E7DDCE] text-xs text-[#7E7067] space-y-2">
            <div className="flex items-center gap-2 text-[#4A3F3A] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#8AA481]" />
              <span>48 Saat Öncesine Kadar Koşulsuz İade</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Planlarınız değişirse, seans tarihinden 48 saat öncesine kadar admin paneli üzerinden veya bize ulaşarak biletinizi tek tıkla iptal edebilir ve tam iadenizi alabilirsiniz.
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Available Sessions & Purchase Module */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#E7DDCE] shadow-sm space-y-6">
            <div className="flex items-baseline justify-between border-b border-[#E7DDCE] pb-4">
              <div>
                <span className="text-xs text-[#7E7067]">Kişi Başı Seans Fiyatı</span>
                <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                  {(selectedSession?.price || course.basePrice).toLocaleString('tr-TR')} TRY
                </span>
              </div>
              <span className="text-xs text-[#8AA481] font-medium">Tüm Malzemeler Dahil</span>
            </div>

            {/* Session Selector List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#4A3F3A] uppercase tracking-wider block">
                  Tarih & Seans Seçiniz
                </label>
                <span className="text-[11px] text-[#7E7067]">
                  {courseSessions.length} Seans Mevcut
                </span>
              </div>

              {courseSessions.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-[#E7DDCE] text-center text-xs text-[#7E7067]">
                  Şu anda bu atölye için planlanmış aktif seans bulunmuyor. Yeni tarihler yakında duyurulacaktır.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {courseSessions.map((session) => {
                    const available = getAvailableSeats(session.id);
                    const isSoldOut = available <= 0;
                    const isSelected = selectedSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          if (!isSoldOut) {
                            setSelectedSessionId(session.id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSoldOut
                            ? 'bg-[#EBE0D2]/40 border-[#E7DDCE] opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-white border-[#DE997C] ring-2 ring-[#DE997C]/20 shadow-xs cursor-pointer'
                            : 'bg-white/80 border-[#E7DDCE] hover:border-[#DE997C]/50 hover:bg-white cursor-pointer'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A3F3A]">
                            <Calendar className="w-3.5 h-3.5 text-[#DE997C]" />
                            <span>{formatDate(session.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#7E7067]">
                            <Clock className="w-3 h-3" />
                            <span>{session.startTime} - {session.endTime}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-[#4A3F3A] block">
                            {session.price.toLocaleString('tr-TR')} TRY
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              isSoldOut
                                ? 'text-red-700'
                                : available <= 3
                                ? 'text-[#DE997C]'
                                : 'text-[#8AA481]'
                            }`}
                          >
                            {isSoldOut ? 'Tükendi' : `Son ${available} Koltuk`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Session Callout */}
            {selectedSession && !isSelectedSoldOut && (
              <div className="p-3 bg-[#FBF6EF] rounded-xl border border-[#E7DDCE] text-xs text-[#7E7067] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#DE997C] shrink-0" />
                <span>
                  Satın alma adımında koltuğunuz <strong>10 dakika</strong> süreyle geçici olarak adınıza rezerve edilir.
                </span>
              </div>
            )}

            {/* Primary Action Button */}
            <div>
              <button
                disabled={isSelectedSoldOut || !selectedSession}
                onClick={handleBookNow}
                className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isSelectedSoldOut || !selectedSession
                    ? 'bg-[#EBE0D2] text-[#7E7067] cursor-not-allowed opacity-60'
                    : 'bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] cursor-pointer'
                }`}
              >
                <span>{isSelectedSoldOut ? 'Kontenjan Tükendi' : 'Yerini Ayır'}</span>
                {!isSelectedSoldOut && selectedSession && <span>→</span>}
              </button>
            </div>

            <div className="text-center text-[11px] text-[#7E7067] space-y-1">
              <span>Hem misafir hem üye olarak devam edebilirsiniz.</span>
              <span className="block text-[10px] text-[#7E7067]/70">
                Tek siparişte en fazla 4 bilet satın alınabilir.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
