import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Session, Course } from '../types';
import { Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

type WorkshopFilterCategory = 'all' | 'ceramic' | 'painting';

export const WorkshopCalendar: React.FC = () => {
  const { sessions, courses, getAvailableSeats, startReservationHold, setCurrentView } = useStore();

  // Filter state: all (ceramic & painting), ceramic only, or painting only
  const [categoryFilter, setCategoryFilter] = useState<WorkshopFilterCategory>('all');

  // Currently displayed month (defaults to November 2026 or current active sessions month)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 is November (0-indexed: 0=Jan, 10=Nov)

  // Selected date in YYYY-MM-DD format (defaults to the first upcoming date with a session, e.g. 2026-11-07)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-07');

  // Get courses map
  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  // Filter only Ceramic and Watercolor Painting sessions
  const relevantSessions = useMemo(() => {
    return sessions.filter((s) => {
      const course = courseMap.get(s.courseId);
      if (!course) return false;
      const isCeramicOrPainting = course.category === 'ceramic' || course.category === 'painting';
      if (!isCeramicOrPainting) return false;

      if (categoryFilter === 'ceramic') return course.category === 'ceramic';
      if (categoryFilter === 'painting') return course.category === 'painting';
      return true;
    });
  }, [sessions, courseMap, categoryFilter]);

  // Group sessions by date string (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    relevantSessions.forEach((s) => {
      const list = map.get(s.date) || [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, [relevantSessions]);

  // Calendar matrix calculation for currentYear and currentMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // In JS, getDay() returns 0 for Sunday. We want Monday as 0 (Pzt) to Sunday as 6 (Paz)
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Empty padding slots before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNumber: 0, dateStr: '', isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Sessions on the currently selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return (sessionsByDate.get(selectedDate) || []).sort(
      (a, b) => a.startTime.localeCompare(b.startTime)
    );
  }, [selectedDate, sessionsByDate]);

  // Formatted date string for selected header
  const formattedSelectedDateHeader = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  }, [selectedDate]);

  // Handle instant reservation
  const handleReserve = (session: Session) => {
    startReservationHold(session.id, 1);
    setCurrentView({
      view: 'checkout',
      sessionId: session.id,
      initialQuantity: 1,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7DDCE] shadow-sm overflow-hidden">
      {/* Top Header & Filter Controls */}
      <div className="p-6 sm:p-8 border-b border-[#E7DDCE]/70 bg-gradient-to-b from-[#FAF7F2] to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DE997C]/15 text-[#DE997C]">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Atölye Takvimi</span>
              </span>
              <span className="text-xs text-[#7E7067] font-medium">Tunalı / Ankara Stüdyosu</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A]">
              Seramik & Suluboya Seans Takvimi
            </h3>
            <p className="text-xs sm:text-sm text-[#7E7067] leading-relaxed">
              Tarihe göre planlanmış çömlek/seramik ve botanik suluboya atölyelerini keşfedin; kontenjan dolmadan yerinizi 10 dakikalık geçici kilit ile hemen ayırtın.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto bg-[#F3EADF] p-1.5 rounded-2xl text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#4A3F3A] text-white shadow-xs'
                  : 'text-[#7E7067] hover:text-[#4A3F3A]'
              }`}
            >
              Tümü (Seramik & Suluboya)
            </button>
            <button
              onClick={() => setCategoryFilter('ceramic')}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                categoryFilter === 'ceramic'
                  ? 'bg-[#DE997C] text-white shadow-xs'
                  : 'text-[#7E7067] hover:text-[#4A3F3A]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#DE997C] inline-block" />
              <span>Seramik & Çömlek</span>
            </button>
            <button
              onClick={() => setCategoryFilter('painting')}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                categoryFilter === 'painting'
                  ? 'bg-[#8AA481] text-white shadow-xs'
                  : 'text-[#7E7067] hover:text-[#4A3F3A]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8AA481] inline-block" />
              <span>Botanik Suluboya</span>
            </button>
          </div>
        </div>

        {/* Legend & Month Controls Strip */}
        <div className="mt-6 pt-5 border-t border-[#E7DDCE]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-[#E7DDCE] bg-white text-[#4A3F3A] hover:bg-[#F3EADF] transition-colors cursor-pointer"
              aria-label="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-display text-lg font-bold text-[#4A3F3A] min-w-[140px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-[#E7DDCE] bg-white text-[#4A3F3A] hover:bg-[#F3EADF] transition-colors cursor-pointer"
              aria-label="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(10); // Kasım 2026
                setSelectedDate('2026-11-07');
              }}
              className="text-xs px-2.5 py-1.5 text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#F3EADF] rounded-lg transition-colors cursor-pointer ml-1"
            >
              Kasım 2026'ya Dön
            </button>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-xs text-[#7E7067]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DE997C]" />
              <span>Seramik Seansı</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8AA481]" />
              <span>Botanik Suluboya</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-[#4A3F3A] bg-[#4A3F3A]" />
              <span>Seçili Gün</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Sessions List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E7DDCE]">
        {/* Left Column: Monthly Calendar Matrix */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-[#7E7067] uppercase tracking-wider pb-2 border-b border-[#E7DDCE]/50">
            <span>Pzt</span>
            <span>Sal</span>
            <span>Çar</span>
            <span>Per</span>
            <span>Cum</span>
            <span className="text-[#DE997C]">Cmt</span>
            <span className="text-[#DE997C]">Paz</span>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 pt-1">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[64px] sm:min-h-[82px] rounded-2xl bg-[#FAF7F2]/40 border border-transparent pointer-events-none"
                  />
                );
              }

              const daySessions = sessionsByDate.get(cell.dateStr) || [];
              const hasSessions = daySessions.length > 0;
              const isSelected = selectedDate === cell.dateStr;

              // Check what types of sessions exist on this day
              const hasCeramic = daySessions.some(
                (s) => courseMap.get(s.courseId)?.category === 'ceramic'
              );
              const hasPainting = daySessions.some(
                (s) => courseMap.get(s.courseId)?.category === 'painting'
              );

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[64px] sm:min-h-[82px] p-2 sm:p-2.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-[#4A3F3A] text-white shadow-md ring-2 ring-[#4A3F3A] scale-[1.02]'
                      : hasSessions
                      ? 'bg-[#FAF7F2] hover:bg-[#F3EADF] text-[#4A3F3A] border border-[#E7DDCE] hover:border-[#DE997C]'
                      : 'bg-white hover:bg-[#FAF7F2]/60 text-[#7E7067]/70 border border-[#E7DDCE]/40'
                  }`}
                >
                  {/* Top: Day Number and Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        isSelected
                          ? 'text-white'
                          : hasSessions
                          ? 'text-[#4A3F3A]'
                          : 'text-[#7E7067]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasSessions && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#DE997C]/15 text-[#DE997C]'
                        }`}
                      >
                        {daySessions.length}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Workshop Dots and Tiny Text */}
                  <div className="w-full space-y-1">
                    {hasSessions ? (
                      <div className="flex items-center gap-1">
                        {hasCeramic && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-[#F4B59A]' : 'bg-[#DE997C]'
                            }`}
                            title="Seramik Seansı"
                          />
                        )}
                        {hasPainting && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-[#A8BFA0]' : 'bg-[#8AA481]'
                            }`}
                            title="Botanik Suluboya Seansı"
                          />
                        )}
                        <span
                          className={`hidden sm:inline-block text-[10px] truncate ml-0.5 ${
                            isSelected ? 'text-white/80' : 'text-[#7E7067]'
                          }`}
                        >
                          {daySessions.length} seans
                        </span>
                      </div>
                    ) : (
                      <span className="block h-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-[#7E7067] flex items-center justify-between">
            <span>💡 İpucu: Herhangi bir güne tıklayarak o günkü seans saatlerini ve kalan kontenjanları sağ panelde görün.</span>
          </div>
        </div>

        {/* Right Column: Sessions on Selected Date */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FAF7F2]/60 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header of selected day */}
            <div className="border-b border-[#E7DDCE] pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#DE997C] block">
                Seçilen Günün Seansları
              </span>
              <h4 className="font-display text-lg sm:text-xl font-bold text-[#4A3F3A] mt-0.5">
                {formattedSelectedDateHeader}
              </h4>
            </div>

            {/* List of Sessions */}
            {selectedDateSessions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E7DDCE] space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#7E7067] flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-5 h-5 text-[#DE997C]" />
                </div>
                <h5 className="font-display text-sm font-semibold text-[#4A3F3A]">
                  Bu Güne Planlanmış Seans Yok
                </h5>
                <p className="text-xs text-[#7E7067] leading-relaxed max-w-xs mx-auto">
                  {categoryFilter === 'all'
                    ? 'Seçtiğiniz tarihte seramik veya suluboya atölyesi bulunmamaktadır. Renkli işaretli günlerden birini seçebilirsiniz.'
                    : `${categoryFilter === 'ceramic' ? 'Seramik' : 'Suluboya'} kategorisinde bu güne açık seans yoktur. Filtreyi değiştirebilir veya diğer günlere bakabilirsiniz.`}
                </p>

                {/* Quick button to jump to first available day */}
                <button
                  onClick={() => setSelectedDate('2026-11-07')}
                  className="mt-2 text-xs font-semibold text-[#DE997C] hover:underline"
                >
                  7 Kasım Cumartesi (Dolu Seanslara Git) →
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {selectedDateSessions.map((session) => {
                  const course = courseMap.get(session.courseId);
                  if (!course) return null;
                  const available = getAvailableSeats(session.id);
                  const isSoldOut = available <= 0;
                  const isCeramic = course.category === 'ceramic';

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl p-5 border border-[#E7DDCE] shadow-2xs hover:border-[#DE997C] transition-all space-y-3"
                    >
                      {/* Top badge and time */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isCeramic
                              ? 'bg-[#DE997C]/15 text-[#DE997C]'
                              : 'bg-[#8AA481]/15 text-[#8AA481]'
                          }`}
                        >
                          {course.categoryLabel}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3F3A]">
                          <Clock className="w-3.5 h-3.5 text-[#DE997C]" />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                      </div>

                      {/* Course Title and Instructor */}
                      <div>
                        <h5 className="font-display text-base font-semibold text-[#4A3F3A] leading-snug">
                          {course.title}
                        </h5>
                        <p className="text-xs text-[#7E7067] mt-0.5">
                          Eğitmen: <strong className="text-[#4A3F3A]">{course.instructor?.name || 'Selin Arslan'}</strong> &bull; Tunalı Stüdyo
                        </p>
                      </div>

                      {/* Price, Seats & Reserve Button */}
                      <div className="pt-3 border-t border-[#E7DDCE]/60 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-display text-base font-bold text-[#4A3F3A] block">
                            {session.price.toLocaleString('tr-TR')} TRY
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSoldOut
                                ? 'text-red-700'
                                : available <= 2
                                ? 'text-[#DE997C]'
                                : 'text-[#8AA481]'
                            }`}
                          >
                            {isSoldOut ? 'Kontenjan Tükendi' : `Son ${available} Koltuk`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentView({ view: 'course-detail', courseId: course.id, autoSelectSessionId: session.id })}
                            className="px-3 py-2 text-xs font-medium text-[#7E7067] hover:text-[#4A3F3A] bg-[#FAF7F2] hover:bg-[#F3EADF] rounded-xl border border-[#E7DDCE] transition-colors cursor-pointer"
                          >
                            İncele
                          </button>

                          {isSoldOut ? (
                            <button
                              disabled
                              className="px-3.5 py-2 text-xs font-medium text-[#7E7067] bg-[#EBE0D2] rounded-xl cursor-not-allowed opacity-60"
                            >
                              Tükendi
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReserve(session)}
                              className="px-4 py-2 text-xs font-semibold text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer hover:shadow-sm"
                            >
                              <span>Rezerve Et</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Studio Note */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E7DDCE] text-xs text-[#7E7067] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#8AA481] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Tüm seramik ve suluboya atölyelerimizde fırınlama, çamurlar, pigmentler ve sıcak kahve ikramı fiyata dahildir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
