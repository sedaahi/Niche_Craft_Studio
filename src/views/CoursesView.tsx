import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CourseCategory } from '../types';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';

interface CoursesViewProps {
  initialCategory?: CourseCategory;
}

const CATEGORIES: { key: 'all' | CourseCategory; label: string }[] = [
  { key: 'all', label: 'Tüm Atölyeler' },
  { key: 'ceramic', label: 'Seramik' },
  { key: 'painting', label: 'Resim & Suluboya' },
  { key: 'jewelry', label: 'Takı & Reçine' },
  { key: 'textile', label: 'Tekstil & Örgü' },
  { key: 'calligraphy', label: 'Kaligrafi' },
  { key: 'candle', label: 'Mum & Koku' },
];

export const CoursesView: React.FC<CoursesViewProps> = ({ initialCategory }) => {
  const { courses, sessions, setCurrentView } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | CourseCategory>(
    initialCategory || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) => {
    const matchesCat = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesQuery =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getUpcomingSessionsCount = (courseId: string) => {
    return sessions.filter((s) => s.courseId === courseId).length;
  };

  const getNextSession = (courseId: string) => {
    const courseSessions = sessions
      .filter((s) => s.courseId === courseId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return courseSessions[0];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Title & Philosophy */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Katalog</span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#4A3F3A]">
          Atölyeler & Tek Seferlik Seanslar
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7067] leading-relaxed">
          Tüm malzemelerin stüdyomuz tarafından karşılandığı, 2–3 saatlik butik el sanatları atölyeleri. İlginizi çeken konuyu seçip size uygun seansa yerinizi ayırtın.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Category Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#4A3F3A] text-white shadow-xs'
                  : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#EBE0D2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#7E7067] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Atölye veya eğitmen ara..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF7F2] rounded-3xl border border-[#E7DDCE] space-y-3">
          <p className="text-sm text-[#7E7067]">Aramanızla eşleşen bir atölye bulunamadı.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-[#DE997C] underline cursor-pointer"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCourses.map((course) => {
            const nextSession = getNextSession(course.id);
            const sessionsCount = getUpcomingSessionsCount(course.id);

            return (
              <div
                key={course.id}
                onClick={() => setCurrentView({ view: 'course-detail', courseId: course.id })}
                className="group bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#E7DDCE] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image & Category */}
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

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#7E7067]">
                      <span>{course.durationMinutes} Dakika</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>Eğitmen: {course.instructor.name}</span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[#4A3F3A] group-hover:text-[#DE997C] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#7E7067] line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* What's included preview */}
                    <div className="pt-2 text-[11px] text-[#8AA481] flex items-center gap-1 font-medium">
                      <span>✓ Tüm malzemeler & ikram dahil</span>
                    </div>
                  </div>

                  {/* Next session & Price */}
                  <div className="pt-4 border-t border-[#E7DDCE]/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#7E7067] block">
                        {sessionsCount > 0 ? `${sessionsCount} Aktif Seans` : 'Yeni Seans Bekleniyor'}
                      </span>
                      <span className="font-display text-base font-bold text-[#4A3F3A]">
                        {course.basePrice.toLocaleString('tr-TR')} TRY
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#4A3F3A] group-hover:text-[#DE997C] transition-colors flex items-center gap-1">
                      Seansları Gör →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
