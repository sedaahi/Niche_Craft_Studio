import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { CraftPost, CourseCategory } from '../types';
import { ShareCraftModal } from '../components/ShareCraftModal';
import {
  Sparkles,
  Star,
  Heart,
  CheckCircle2,
  ArrowRight,
  X,
  Search,
  Plus,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  const { posts, userLikes, toggleLikePost, setCurrentView, currentUser, courses } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'likes' | 'duration_asc' | 'duration_desc'>('newest');
  const [selectedPost, setSelectedPost] = useState<CraftPost | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Only published posts appear in community showcase
  const publishedPosts = useMemo(() => {
    return posts.filter((p) => p.status === 'published');
  }, [posts]);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'Tüm Eserler & Yorumlar' },
    { key: 'ceramic', label: 'Seramik' },
    { key: 'painting', label: 'Resim & İllüstrasyon' },
    { key: 'jewelry', label: 'Takı Tasarımı' },
    { key: 'textile', label: 'Tekstil & Nakış' },
    { key: 'candle', label: 'Mum & Koku' },
    { key: 'calligraphy', label: 'Kaligrafi' },
  ];

  const filteredPosts = useMemo(() => {
    return publishedPosts
      .filter((post) => {
        // Category filter
        if (selectedCategory !== 'all' && post.category !== selectedCategory) {
          return false;
        }
        // Search term filter (title, description, workshop title)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(q);
          const matchDesc = post.description.toLowerCase().includes(q);
          const matchWorkshop = post.workshopTitle?.toLowerCase().includes(q) || false;
          const matchAuthor = post.authorName.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchWorkshop || matchAuthor;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'likes') {
          return b.likesCount - a.likesCount;
        }
        if (sortBy === 'duration_asc') {
          return (a.durationMinutes || 0) - (b.durationMinutes || 0);
        }
        if (sortBy === 'duration_desc') {
          return (b.durationMinutes || 0) - (a.durationMinutes || 0);
        }
        return 0;
      });
  }, [publishedPosts, selectedCategory, searchTerm, sortBy]);

  const handleCreateClick = () => {
    if (!currentUser) {
      setCurrentView({ view: 'auth', initialTab: 'login', returnTo: { view: 'community' } });
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#4A3F3A] text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-[#E7DDCE] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-4 h-4 text-[#DE997C]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Hero */}
        <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 sm:p-10 shadow-2xs relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4B59A]/30 text-[#DE997C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Topluluk & Atölye Vitrini</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#4A3F3A] tracking-tight">
              Katılımcılarımızın Elinden Çıkan Eserler & Deneyimleri
            </h1>
            <p className="text-xs sm:text-sm text-[#7E7067] leading-relaxed">
              Niche Craft Studio atölyelerimizde katılımcılarımızın elleriyle şekillendirdiği özgün seramik fincanlar, botanik suluboya tablolar ve takı tasarımları. Gerçek katılımcı yorumlarını okuyun, fotoğrafları inceleyin ve atölye seçiminize ilham katın.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Kendi Eserini & Deneyimini Paylaş</span>
              </button>
              {currentUser && (
                <button
                  onClick={() => setCurrentView({ view: 'my-crafts' })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7DDCE] bg-[#FAF7F2] hover:bg-[#F3EADF] text-[#4A3F3A] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#DE997C]" />
                  <span>Eserlerim & Atölye Günlüğüm</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E7DDCE] p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E7067]" />
              <input
                type="text"
                placeholder="Eser adı, atölye veya katılımcı ara (örn: kupa, suluboya, fincan)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl text-[#4A3F3A] focus:outline-none focus:border-[#DE997C] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E7067] hover:text-[#4A3F3A] cursor-pointer"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="sort-select" className="text-xs text-[#7E7067] font-medium whitespace-nowrap">
                Sırala:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs py-2 px-3 bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl text-[#4A3F3A] focus:outline-none focus:border-[#DE997C]"
              >
                <option value="newest">En Yeni Eserler</option>
                <option value="likes">En Çok Beğenilenler</option>
                <option value="duration_asc">Süre (Kısa → Uzun)</option>
                <option value="duration_desc">Süre (Uzun → Kısa)</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#4A3F3A] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#7E7067] hover:bg-[#F3EADF] border border-[#E7DDCE]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#7E7067] px-1">
          <span>
            Toplam <strong className="text-[#4A3F3A]">{filteredPosts.length}</strong> onaylanmış katılımcı eseri sergileniyor
          </span>
          {searchTerm && <span>"{searchTerm}" için sonuçlar</span>}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7DDCE] p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#7E7067] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-display font-semibold text-[#4A3F3A] text-base">Eser Bulunamadı</h3>
            <p className="text-xs text-[#7E7067]">
              Arama kriterlerinize uyan eser bulunamadı. Filtreleri temizleyebilir veya ilk eseri siz paylaşabilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-xl transition-colors cursor-pointer"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const isLiked = userLikes.includes(post.id);
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl border border-[#E7DDCE] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image Showcase */}
                    {post.imageUrl && (
                      <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden border-b border-[#E7DDCE]">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-[#4A3F3A] backdrop-blur-xs shadow-xs border border-white/40">
                            {post.categoryLabel}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Katılımcı Eseri</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {/* Rating Stars & Duration */}
                      <div className="flex items-center justify-between text-xs">
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
                            {post.rating || 5}/5
                          </span>
                        </div>
                        {post.durationMinutes && (
                          <span className="text-[11px] text-[#7E7067]">
                            ⏱️ {post.durationMinutes} dk
                          </span>
                        )}
                      </div>

                      {/* Title & Workshop reference */}
                      <div>
                        <h3 className="font-display font-bold text-[#4A3F3A] text-base leading-snug group-hover:text-[#DE997C] transition-colors">
                          {post.title}
                        </h3>
                        {post.workshopTitle && (
                          <p className="text-[11px] text-[#7E7067] mt-0.5 truncate">
                            Atölye: <strong className="text-[#4A3F3A]">{post.workshopTitle}</strong>
                          </p>
                        )}
                      </div>

                      {/* Description / Review quote */}
                      <p className="text-xs text-[#7E7067] leading-relaxed line-clamp-3 italic">
                        "{post.description}"
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Author, Like Button & Details Action */}
                  <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#E7DDCE] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#4A3F3A] text-white flex items-center justify-center text-[11px] font-bold">
                        {post.authorName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#4A3F3A]">{post.authorName}</div>
                        <div className="text-[10px] text-[#7E7067]">{post.createdAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-white text-[#7E7067] border border-[#E7DDCE] hover:bg-[#F3EADF]'
                        }`}
                        title={isLiked ? 'Beğeniyi Kaldır' : 'Eseri Beğen'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#7E7067]'}`}
                        />
                        <span>{post.likesCount}</span>
                      </button>

                      <button
                        onClick={() => setSelectedPost(post)}
                        className="px-3 py-1.5 rounded-xl bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        İncele
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3F3A]/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E7DDCE] shadow-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#DE997C] text-xs font-semibold border border-[#E7DDCE] mb-2">
                    {selectedPost.categoryLabel}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[#4A3F3A]">
                    {selectedPost.title}
                  </h2>
                  <p className="text-xs text-[#7E7067] mt-0.5">
                    Katılımcı: <strong className="text-[#4A3F3A]">{selectedPost.authorName}</strong> &bull; Tarih: {selectedPost.createdAt}
                    {selectedPost.workshopTitle && <> &bull; Atölye: <strong className="text-[#4A3F3A]">{selectedPost.workshopTitle}</strong></>}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-xl text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              {selectedPost.imageUrl && (
                <div className="rounded-2xl overflow-hidden aspect-16/10 bg-[#FAF7F2] border border-[#E7DDCE]">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1.5 p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE]">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= (selectedPost.rating || 5)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#4A3F3A]">
                  {selectedPost.rating || 5} / 5 Yıldız Katılımcı Puanı
                </span>
              </div>

              {/* Review */}
              {selectedPost.description && (
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7DDCE] text-xs text-[#4A3F3A] leading-relaxed italic">
                  "{selectedPost.description}"
                </div>
              )}

              {/* Related Workshop Action */}
              {selectedPost.workshopId && (
                <div className="p-4 bg-[#F3EADF]/60 rounded-2xl border border-[#E7DDCE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#DE997C] block">
                      Bu Eser Hangi Atölyede Üretildi?
                    </span>
                    <strong className="text-[#4A3F3A] text-sm block">
                      {selectedPost.workshopTitle || 'Niche Craft Atölyesi'}
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setCurrentView({ view: 'course-detail', courseId: selectedPost.workshopId });
                    }}
                    className="px-4 py-2 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Atölyeyi İncele & Bilet Al</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E7DDCE]">
                <button
                  onClick={() => toggleLikePost(selectedPost.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    userLikes.includes(selectedPost.id)
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-[#FAF7F2] text-[#4A3F3A] hover:bg-[#F3EADF] border border-[#E7DDCE]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${userLikes.includes(selectedPost.id) ? 'fill-red-500 text-red-500' : 'text-[#7E7067]'}`}
                  />
                  <span>
                    {userLikes.includes(selectedPost.id) ? 'Beğendiniz' : 'Beğen'} ({selectedPost.likesCount})
                  </span>
                </button>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-5 py-2 bg-[#4A3F3A] text-white rounded-xl text-xs font-semibold hover:bg-[#382F2A] transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Craft Modal */}
        <ShareCraftModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      </div>
    </div>
  );
};
