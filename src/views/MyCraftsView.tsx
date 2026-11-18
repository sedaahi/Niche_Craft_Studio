import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { CraftPost, PostStatus } from '../types';
import { ShareCraftModal } from '../components/ShareCraftModal';
import {
  Sparkles,
  Plus,
  Star,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const MyCraftsView: React.FC = () => {
  const { posts, currentUser, setCurrentView, deletePost } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [postToDelete, setPostToDelete] = useState<CraftPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CraftPost | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7DDCE] p-8 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#DE997C] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#4A3F3A]">
            Giriş Yapmanız Gerekiyor
          </h2>
          <p className="text-xs text-[#7E7067] leading-relaxed">
            Atölye günlüğünüzdeki eserleri incelemek ve yeni eser paylaşmak için lütfen giriş yapın.
          </p>
          <button
            onClick={() =>
              setCurrentView({ view: 'auth', initialTab: 'login', returnTo: { view: 'my-crafts' } })
            }
            className="w-full py-2.5 bg-[#4A3F3A] hover:bg-[#382F2A] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Giriş Yap veya Kayıt Ol
          </button>
        </div>
      </div>
    );
  }

  // Filter posts belonging to the current user
  const userPosts = useMemo(() => {
    return posts.filter((p) => p.authorId === currentUser.id);
  }, [posts, currentUser.id]);

  const filteredPosts = useMemo(() => {
    if (filterStatus === 'all') return userPosts;
    return userPosts.filter((p) => p.status === filterStatus);
  }, [userPosts, filterStatus]);

  const counts = useMemo(() => {
    return {
      all: userPosts.length,
      draft: userPosts.filter((p) => p.status === 'draft').length,
      pending: userPosts.filter((p) => p.status === 'pending').length,
      published: userPosts.filter((p) => p.status === 'published').length,
      rejected: userPosts.filter((p) => p.status === 'rejected').length,
    };
  }, [userPosts]);

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    const res = await deletePost(postToDelete.id);
    setIsDeleting(false);
    setPostToDelete(null);
    showToast(res.message);
  };

  const renderStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Yayında (Topluluk Vitrini)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Yönetici Onayı Bekliyor
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F2] text-[#7E7067] border border-[#E7DDCE]">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
            Taslak
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Düzeltme İsteniyor
          </span>
        );
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

        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4B59A]/30 text-[#DE997C]">
              <span>🎨 Katılımcı Atölye Günlüğü</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4A3F3A]">
              Eserlerim & Atölye Paylaşımlarım
            </h1>
            <p className="text-xs text-[#7E7067]">
              {currentUser.name} &bull; {currentUser.email} &bull; Atölyede yaptığınız eserleri ve deneyimlerinizi buradan yönetin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentView({ view: 'community' })}
              className="px-4 py-2.5 rounded-xl border border-[#E7DDCE] text-[#4A3F3A] text-xs font-medium hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Topluluk Vitrini
            </button>
            <button
              onClick={() => {
                setEditingPost(null);
                setIsShareModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Eser & Deneyim Paylaş</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-[#E7DDCE] shadow-2xs text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#4A3F3A] text-white shadow-xs'
                : 'text-[#7E7067] hover:bg-[#FAF7F2]'
            }`}
          >
            Tümü ({counts.all})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'draft'
                ? 'bg-[#4A3F3A] text-white shadow-xs'
                : 'text-[#7E7067] hover:bg-[#FAF7F2]'
            }`}
          >
            Taslaklar ({counts.draft})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-[#4A3F3A] text-white shadow-xs'
                : 'text-[#7E7067] hover:bg-[#FAF7F2]'
            }`}
          >
            Onay Bekleyenler ({counts.pending})
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'published'
                ? 'bg-[#4A3F3A] text-white shadow-xs'
                : 'text-[#7E7067] hover:bg-[#FAF7F2]'
            }`}
          >
            Yayındakiler ({counts.published})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'rejected'
                ? 'bg-[#4A3F3A] text-white shadow-xs'
                : 'text-[#7E7067] hover:bg-[#FAF7F2]'
            }`}
          >
            Düzeltme İstenenler ({counts.rejected})
          </button>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7DDCE] p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#DE997C] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-[#4A3F3A] text-base">
              Bu Kategoride Eseriniz Yok
            </h3>
            <p className="text-xs text-[#7E7067]">
              Katıldığınız bir atölyede ürettiğiniz eseri fotoğraflayıp toplulukla paylaşabilir veya taslak olarak günlüğünüze ekleyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setEditingPost(null);
                setIsShareModalOpen(true);
              }}
              className="px-4 py-2 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Yeni Eser & Deneyim Paylaş
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-[#E7DDCE] p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Status & Controls */}
                  <div className="flex items-center justify-between gap-2">
                    {renderStatusBadge(post.status)}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setIsShareModalOpen(true);
                        }}
                        className="p-1.5 text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Image & Title Card */}
                  <div className="flex gap-4 items-start">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-24 h-24 rounded-2xl object-cover bg-[#FAF7F2] border border-[#E7DDCE] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-[#DE997C] uppercase tracking-wider block">
                        {post.categoryLabel}
                      </span>
                      <h3 className="font-display text-base font-bold text-[#4A3F3A] leading-snug">
                        {post.title}
                      </h3>
                      {post.workshopTitle && (
                        <p className="text-[11px] text-[#7E7067] truncate">
                          Atölye: <strong className="text-[#4A3F3A]">{post.workshopTitle}</strong>
                        </p>
                      )}
                      {post.rating && (
                        <div className="flex items-center gap-1 pt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= post.rating!
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-[#7E7067] ml-1">
                            {post.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection notice */}
                  {post.status === 'rejected' && post.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-red-800 block">Yönetici Notu:</span>
                      <p className="text-red-700 leading-relaxed font-sans">{post.rejectionReason}</p>
                    </div>
                  )}

                  {/* Review / Description */}
                  {post.description && (
                    <p className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#7E7067] leading-relaxed italic border border-[#E7DDCE]/60">
                      "{post.description}"
                    </p>
                  )}
                </div>

                {/* Footer Info */}
                <div className="pt-2 border-t border-[#E7DDCE]/60 flex items-center justify-between text-[11px] text-[#7E7067]">
                  <span>📅 {post.createdAt}</span>
                  <span className="font-semibold text-[#DE997C]">♥ {post.likesCount} Beğeni</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {postToDelete && (
          <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E7DDCE] p-6 space-y-4 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#4A3F3A]">
                Eseri Silmek İstiyor musunuz?
              </h3>
              <p className="text-xs text-[#7E7067]">
                "{postToDelete.title}" kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E7DDCE] text-xs font-semibold text-[#4A3F3A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share & Edit Modal */}
        <ShareCraftModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setEditingPost(null);
          }}
          editPost={editingPost}
          onSuccess={(msg) => showToast(msg)}
        />
      </div>
    </div>
  );
};
