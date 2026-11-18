import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { workshopCeramicImg } from '../data/initialData';
import { Course, Session, CourseCategory, CraftPost } from '../types';
import { QrCodeSvg } from '../components/QrCodeSvg';
import {
  Shield,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  QrCode,
  Download,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  LogOut,
  X,
  CreditCard,
  Search,
  ExternalLink,
  RefreshCw,
  UserCheck,
  Mail,
  Phone,
  Send,
  Database,
  Sparkles,
  Inbox,
  AtSign,
  Star,
} from 'lucide-react';
import { sendWelcomeEmail, sendTicketConfirmationEmail } from '../services/emailService';

export const AdminView: React.FC = () => {
  const {
    courses,
    sessions,
    orders,
    users,
    emailLogs,
    posts,
    reviewPost,
    togglePostShowOnHome,
    syncUsersToCloud,
    syncCoursesToCloud,
    isAdminLoggedIn,
    currentUser,
    setCurrentView,
    logoutUser,
    loginUser,
    loginAsAdmin,
    logoutAdmin,
    addCourse,
    updateCourse,
    deleteCourse,
    addSession,
    updateSession,
    deleteSession,
    cancelOrRefundOrder,
    checkInTicket,
    exportAttendeesCsv,
    resetToSampleData,
  } = useStore();

  const [adminEmailInput, setAdminEmailInput] = useState('admin@nichecraft.studio');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sessions' | 'courses' | 'orders' | 'checkin' | 'emails' | 'approvals'>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isSyncingCourses, setIsSyncingCourses] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('demo@nichecraft.studio');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [rejectingPost, setRejectingPost] = useState<CraftPost | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('pending');

  // Check-in state
  const [checkInCode, setCheckInCode] = useState('');
  const [checkInFeedback, setCheckInFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New/Edit Session state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    courseId: courses[0]?.id || '',
    date: '2026-11-05',
    startTime: '14:00',
    endTime: '16:30',
    price: 1250,
    capacity: 8,
  });

  // New/Edit Course state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'ceramic' as CourseCategory,
    categoryLabel: 'Seramik',
    description: '',
    longDescription: '',
    durationMinutes: 150,
    level: 'Başlangıç' as 'Başlangıç' | 'Orta Seviye' | 'Tüm Seviyeler',
    includedItems: '1 kg taş çamuru, Şekillendirme araçları, 2 kez fırınlama, Kahve ikramı',
    instructorName: 'Selin Arslan',
    imageUrl: workshopCeramicImg,
    basePrice: 1250,
  });

  // Selected session for attendee modal
  const [selectedSessionForAttendees, setSelectedSessionForAttendees] = useState<Session | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Feedback toast for refunds/actions
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Unified single-session authorization barrier
  if (!isAdminLoggedIn) {
    if (currentUser) {
      // Customer is currently logged in: prevent simultaneous conflicting logins
      return (
        <div className="max-w-md mx-auto py-16 px-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E7DDCE] shadow-sm space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C] block mb-1">
                Erişim Kısıtlaması & Tek Oturum
              </span>
              <h1 className="font-display text-2xl font-semibold text-[#4A3F3A]">
                Yönetici Yetkisi Gereklidir
              </h1>
            </div>
            <p className="text-xs text-[#7E7067] leading-relaxed">
              Şu anda katılımcı hesabınızdasınız (<strong>{currentUser.name}</strong> · {currentUser.email}). 
              Sistemimizde tek oturum kuralı geçerlidir; müşteri oturumu açıkken aynı anda arka planda bağımsız bir yönetici oturumu çalışamaz.
            </p>
            <div className="p-3.5 bg-white rounded-2xl border border-[#E7DDCE] text-xs text-[#4A3F3A] text-left space-y-1.5">
              <div className="font-semibold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Yönetim Paneline Geçiş:
              </div>
              <p className="text-[11px] text-[#7E7067] leading-relaxed">
                Aşağıdaki butona tıkladığınızda mevcut katılımcı oturumu sonlandırılarak tek giriş kapısından yetkili yönetici hesabıyla (<strong>admin@nichecraft.studio</strong>) giriş yapılır.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setCurrentView({ view: 'auth', initialTab: 'login', returnTo: { view: 'admin' } });
                }}
                className="w-full py-3 bg-[#4A3F3A] hover:bg-[#382F2A] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#DE997C]" />
                <span>Oturumu Kapat ve Yönetici Girişine Git</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView({ view: 'account' })}
                className="w-full py-2.5 bg-white hover:bg-[#F3EADF] text-[#4A3F3A] font-medium text-xs rounded-xl border border-[#E7DDCE] transition-all cursor-pointer"
              >
                Katılımcı Biletlerime & Profilime Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Guest state (not logged in)
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E7DDCE] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#DE997C]/20 text-[#DE997C] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-[#4A3F3A]">
              Stüdyo Yönetim Girişi
            </h1>
            <p className="text-xs text-[#7E7067] leading-relaxed">
              Atölye takvimi, kontenjanlar, kapı check-in ve katılımcı listeleri tek bir merkezi giriş üzerinden yönetilir.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setCurrentView({ view: 'auth', initialTab: 'login', returnTo: { view: 'admin' } })}
              className="w-full py-3 bg-[#4A3F3A] hover:bg-[#382F2A] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#DE997C]" />
              <span>Giriş Yaparak Devam Et</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Metrics
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalTicketsSold = paidOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
  const totalBooked = sessions.reduce((sum, s) => sum + s.bookedCount, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  // Handle Door QR / Code Check-in
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCode.trim()) return;

    const res = checkInTicket(checkInCode.trim());
    if (res.success) {
      setCheckInFeedback({ type: 'success', message: res.message });
      setCheckInCode('');
    } else {
      setCheckInFeedback({ type: 'error', message: res.message });
    }
  };

  // Handle Session creation
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      courseId: sessionForm.courseId,
      date: sessionForm.date,
      startTime: sessionForm.startTime,
      endTime: sessionForm.endTime,
      price: Number(sessionForm.price),
      capacity: Number(sessionForm.capacity),
    });
    setIsSessionModalOpen(false);
    setActionNotice({ type: 'success', message: 'Yeni seans başarıyla takvime eklendi.' });
  };

  const openNewCourseModal = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      category: 'ceramic',
      categoryLabel: 'Seramik',
      description: '',
      longDescription: '',
      durationMinutes: 120,
      level: 'Başlangıç',
      includedItems: '1 kg kil, Şekillendirme aletleri, 2 kez fırınlama, Kahve ikramı',
      instructorName: 'Selin Arslan',
      imageUrl: workshopCeramicImg,
      basePrice: 1250,
    });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      category: course.category,
      categoryLabel: course.categoryLabel,
      description: course.description,
      longDescription: course.longDescription || course.description,
      durationMinutes: course.durationMinutes,
      level: course.level,
      includedItems: course.includedItems ? course.includedItems.join(', ') : '',
      instructorName: course.instructor?.name || 'Selin Arslan',
      imageUrl: course.imageUrl || workshopCeramicImg,
      basePrice: course.basePrice,
    });
    setIsCourseModalOpen(true);
  };

  // Handle Course creation or update (Full CRUD)
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse(editingCourse.id, {
        title: courseForm.title,
        slug: courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: courseForm.category,
        categoryLabel: courseForm.categoryLabel,
        description: courseForm.description,
        longDescription: courseForm.longDescription || courseForm.description,
        durationMinutes: Number(courseForm.durationMinutes),
        level: courseForm.level,
        includedItems: courseForm.includedItems.split(',').map((s) => s.trim()),
        instructor: {
          id: editingCourse.instructor?.id || 'inst-custom',
          name: courseForm.instructorName,
          title: editingCourse.instructor?.title || 'Atölye Eğitmeni',
          bio: editingCourse.instructor?.bio || 'Niche Craft Studio bünyesinde atölyeler düzenliyor.',
        },
        imageUrl: courseForm.imageUrl,
        basePrice: Number(courseForm.basePrice),
      });
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      setActionNotice({ type: 'success', message: `"${courseForm.title}" atölyesi başarıyla güncellendi.` });
    } else {
      addCourse({
        title: courseForm.title,
        slug: courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: courseForm.category,
        categoryLabel: courseForm.categoryLabel,
        description: courseForm.description,
        longDescription: courseForm.longDescription || courseForm.description,
        durationMinutes: Number(courseForm.durationMinutes),
        level: courseForm.level,
        includedItems: courseForm.includedItems.split(',').map((s) => s.trim()),
        instructorId: 'inst-custom',
        instructor: {
          id: 'inst-custom',
          name: courseForm.instructorName,
          title: 'Atölye Eğitmeni',
          bio: 'Niche Craft Studio bünyesinde atölyeler düzenliyor.',
        },
        imageUrl: courseForm.imageUrl,
        basePrice: Number(courseForm.basePrice),
        featured: false,
        maxCapacityPerSession: 8,
      });
      setIsCourseModalOpen(false);
      setActionNotice({ type: 'success', message: 'Yeni atölye kursu başarıyla sisteme eklendi.' });
    }
  };

  // Handle Refund
  const handleRefund = (orderId: string) => {
    const res = cancelOrRefundOrder(orderId);
    if (res.success) {
      setActionNotice({ type: 'success', message: res.message });
    } else {
      setActionNotice({ type: 'error', message: res.message });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DDCE]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A8BFA0]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">
              Yönetici Paneli
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A]">
            Atölye & Katılımcı Yönetimi
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Örnek veriler sıfırlansın mı?')) {
                resetToSampleData();
              }
            }}
            className="px-3 py-1.5 text-xs text-[#7E7067] hover:text-[#4A3F3A] bg-[#F3EADF] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Sıfırla</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Çıkış</span>
          </button>
        </div>
      </div>

      {/* Global Action Banner */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E7DDCE]/60">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Genel Özet</span>
        </button>

        {/* 2. TAB: ESER & YORUM ONAY MASASI (Öncelikli Sıraya Alındı) */}
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'approvals'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : posts.filter((p) => p.status === 'pending').length > 0
              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${posts.filter((p) => p.status === 'pending').length > 0 ? 'text-amber-600' : 'text-amber-500'}`} />
          <span>Eser & Yorum Onay Masası</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              posts.filter((p) => p.status === 'pending').length > 0
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {posts.filter((p) => p.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'checkin'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Kapı Check-in & QR</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Seanslar ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Atölyeler ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Kayıtlı Kullanıcılar ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Siparişler & Biletler ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'emails'
              ? 'bg-[#4A3F3A] text-white shadow-xs'
              : 'bg-[#F3EADF] text-[#7E7067] hover:text-[#4A3F3A]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>E-posta & Bildirimler ({emailLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD ÖZET */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1">
              <span className="text-[11px] font-semibold text-[#7E7067] uppercase">Toplam Satış</span>
              <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                {totalRevenue.toLocaleString('tr-TR')} TRY
              </span>
              <span className="text-[10px] text-[#8AA481]">Ödenmiş bilet cirosu</span>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1">
              <span className="text-[11px] font-semibold text-[#7E7067] uppercase">Satılan Bilet</span>
              <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                {totalTicketsSold} Adet
              </span>
              <span className="text-[10px] text-[#7E7067]">Toplam katılımcı kaydı</span>
            </div>

            <div
              onClick={() => setActiveTab('users')}
              className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1 hover:border-[#DE997C] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7E7067] uppercase">Kayıtlı Kullanıcı</span>
                <Users className="w-3.5 h-3.5 text-[#DE997C] group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                {users.length} Üye
              </span>
              <span className="text-[10px] text-[#DE997C] font-semibold flex items-center gap-1">
                Firestore Bulut ↗
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1">
              <span className="text-[11px] font-semibold text-[#7E7067] uppercase">Doluluk Oranı</span>
              <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                %{overallOccupancy}
              </span>
              <span className="text-[10px] text-[#7E7067]">
                {totalBooked} / {totalCapacity} koltuk dolu
              </span>
            </div>

            <div
              onClick={() => setActiveTab('approvals')}
              className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1 hover:border-amber-400 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7E7067] uppercase">Onay Kuyruğu</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                {posts.filter((p) => p.status === 'pending').length} Bekliyor
              </span>
              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                {posts.filter((p) => p.status === 'published').length} Yayında ↗
              </span>
            </div>
          </div>

          {/* DİREKT DASHBOARD ÖNÜ: KATILIMCI ESER & ATÖLYE YORUMLARI ONAY MASASI */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border-2 border-[#DE997C]/60 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7DDCE] pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Katılımcı Eser & Atölye Yorumları Kontrol Paneli</span>
                  {posts.filter((p) => p.status === 'pending').length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] animate-pulse">
                      {posts.filter((p) => p.status === 'pending').length} Yeni İnceleme
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F3A]">
                  Eser & Yorum Onay Masası (Dashboard Önü)
                </h3>
                <p className="text-xs sm:text-sm text-[#7E7067] mt-1 max-w-2xl leading-relaxed">
                  Biletli katılımcıların atölye sonrası bilgisayarlarından yüklediği eser fotoğrafları, 1-5 yıldız puanları ve deneyim yorumları doğrudan buraya düşer. Onayladıklarınız tüm kullanıcılara ve ana sayfaya anında yansır.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('approvals')}
                  className="px-4 py-2 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Detaylı Masayı Aç ({posts.length})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pending approvals cards */}
            {(() => {
              const pendingList = posts.filter((p) => p.status === 'pending');

              if (pendingList.length === 0) {
                const publishedList = posts.filter((p) => p.status === 'published');

                return (
                  <div className="space-y-4">
                    <div className="p-5 bg-white rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#4A3F3A] block">
                            Şu An Onay Bekleyen Paylaşım Bulunmuyor
                          </span>
                          <span className="text-[#7E7067]">
                            Tüm katılımcı fotoğrafları ve atölye yorumları incelendi. Yeni bir eser gönderildiğinde canlı olarak bu masaya düşecektir.
                          </span>
                        </div>
                      </div>
                      <div className="text-emerald-700 font-semibold shrink-0">
                        ✓ {publishedList.length} Eser Yayında
                      </div>
                    </div>

                    {/* Quick switch for published crafts on Home Page */}
                    {publishedList.length > 0 && (
                      <div className="bg-white rounded-2xl border border-[#E7DDCE] p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#4A3F3A]">
                            Yayındaki Eserler & Ana Sayfa Gösterim Durumu:
                          </span>
                          <span className="text-[11px] text-[#7E7067]">
                            Ana sayfada görünmesini istediklerinizi tek tıkla açıp kapatabilirsiniz.
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {publishedList.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] flex items-center gap-3 justify-between"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {post.imageUrl && (
                                  <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-11 h-11 rounded-lg object-cover border border-[#E7DDCE] shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-[#4A3F3A] truncate">
                                    {post.title}
                                  </p>
                                  <div className="flex items-center gap-1 text-[10px] text-[#DE997C]">
                                    <span>★ {post.rating || 5}/5</span>
                                    <span>·</span>
                                    <span className="truncate text-[#7E7067]">{post.authorName}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  const res = await togglePostShowOnHome(post.id);
                                  setActionNotice({
                                    type: 'success',
                                    message: res.showOnHome
                                      ? `"${post.title}" ana sayfa vitrinine eklendi.`
                                      : `"${post.title}" ana sayfa vitrininden kaldırıldı (toplulukta kalmaya devam eder).`,
                                  });
                                }}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-colors shrink-0 cursor-pointer ${
                                  post.showOnHome
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-white text-[#7E7067] border-[#E7DDCE] hover:bg-stone-50'
                                }`}
                              >
                                {post.showOnHome ? '✓ Ana Sayfada' : '+ Ana Sayfaya Ekle'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl font-medium">
                    <span>
                      🔔 İncelemenizi bekleyen <strong>{pendingList.length} adet yeni eser ve yorum</strong> var:
                    </span>
                    <span>Lütfen fotoğrafı ve atölye yorumunu kontrol edip onaylayın.</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingList.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white rounded-2xl border-2 border-amber-300/80 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                ⏳ ONAY BEKLİYOR
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF7F2] text-[#4A3F3A] border border-[#E7DDCE]">
                                {post.categoryLabel || 'Atölye'}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#7E7067]">
                              Tarih: {post.createdAt}
                            </span>
                          </div>

                          <div className="flex gap-4">
                            {post.imageUrl && (
                              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#E7DDCE] shrink-0 bg-[#FAF7F2]">
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-[9px] text-white rounded">
                                  Fotoğraf
                                </span>
                              </div>
                            )}

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <h4 className="font-display text-base font-bold text-[#4A3F3A] leading-snug">
                                {post.title}
                              </h4>
                              {post.workshopTitle && (
                                <p className="text-[11px] text-[#DE997C] font-semibold truncate">
                                  Atölye: {post.workshopTitle}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5">
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
                                </div>
                                <span className="text-xs font-bold text-[#4A3F3A]">
                                  {post.rating || 5} / 5 Yıldız
                                </span>
                                <span className="text-[10px] text-[#7E7067]">
                                  ({post.authorName})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Review comment quote */}
                          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-xs text-[#4A3F3A] italic leading-relaxed">
                            "{post.description}"
                          </div>
                        </div>

                        {/* Approval Action Buttons */}
                        <div className="pt-2 border-t border-[#E7DDCE] flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await reviewPost(post.id, 'publish', undefined, true);
                              setActionNotice({
                                type: res.success ? 'success' : 'error',
                                message: res.success
                                  ? `"${post.title}" onaylandı ve hem vitrinde hem de ANA SAYFADA yayına alındı!`
                                  : res.message,
                              });
                            }}
                            className="flex-1 min-w-[150px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Onayla & Ana Sayfaya Gönder</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              const res = await reviewPost(post.id, 'publish', undefined, false);
                              setActionNotice({
                                type: res.success ? 'success' : 'error',
                                message: res.success
                                  ? `"${post.title}" onaylandı ve Topluluk Vitrininde yayına alındı.`
                                  : res.message,
                              });
                            }}
                            className="py-2 px-3 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Sadece Vitrinde Yayınla</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRejectingPost(post)}
                            className="py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Gerekçe ile Reddet</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick sessions overview */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
                  Yaklaşan Seansların Durumu & Katılımcı Listeleri
                </h3>
                <p className="text-[11px] text-[#7E7067]">
                  Kontenjan doluluk oranları, kapı giriş durumları ve biletli katılımcı detayları.
                </p>
              </div>
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="px-3 py-1.5 bg-[#F4B59A] text-xs font-semibold rounded-xl text-[#4A3F3A] hover:bg-[#DE997C] transition-colors cursor-pointer"
              >
                + Yeni Seans Aç
              </button>
            </div>

            <div className="space-y-3">
              {sessions.slice(0, 6).map((session) => {
                const course = courses.find((c) => c.id === session.courseId);
                const isFull = session.bookedCount >= session.capacity;
                const sessionTickets = orders
                  .filter((o) => o.sessionId === session.id && o.status === 'paid')
                  .flatMap((o) => o.tickets);
                const checkedInCount = sessionTickets.filter((t) => t.checkedIn).length;
                const isExpanded = expandedSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    className="p-4 bg-white rounded-2xl border border-[#E7DDCE] space-y-3 transition-all hover:shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#4A3F3A]">
                            {course?.title || 'Atölye'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isFull ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isFull ? 'KONTENJAN DOLDU' : `${session.capacity - session.bookedCount} Boş Yer`}
                          </span>
                        </div>
                        <span className="text-[#7E7067] text-[11px]">
                          📅 {formatDate(session.date)} · ⏰ {session.startTime} - {session.endTime} · 👤 Eğitmen: {course?.instructor?.name || 'Selin Arslan'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="font-bold text-sm text-[#4A3F3A]">
                              {session.bookedCount} / {session.capacity}
                            </span>
                            <span className="text-[11px] text-[#7E7067]">Dolu</span>
                          </div>
                          <span className="text-[10px] text-[#7E7067] block">
                            {checkedInCount} Giriş / {sessionTickets.length - checkedInCount} Bekleniyor
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                              isExpanded
                                ? 'bg-[#4A3F3A] text-white border-[#4A3F3A]'
                                : 'bg-[#FAF7F2] text-[#4A3F3A] border-[#E7DDCE] hover:bg-[#F3EADF]'
                            }`}
                          >
                            {isExpanded ? 'Gizle' : `Katılımcılar (${sessionTickets.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSessionForAttendees(session)}
                            className="px-3 py-1.5 bg-[#F3EADF] hover:bg-[#DE997C] hover:text-white text-[#4A3F3A] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Yönet & CSV
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Katılımcı Önizleme Rozetleri */}
                    {sessionTickets.length > 0 ? (
                      <div className="pt-2 border-t border-[#E7DDCE]/60">
                        <div className="flex items-center justify-between text-[11px] text-[#7E7067] mb-1.5">
                          <span className="font-semibold text-[#4A3F3A]">
                            👥 Kayıtlı Katılımcılar ({sessionTickets.length} Kişi):
                          </span>
                          <span className="text-[10px]">
                            {checkedInCount} kişi kapıdan giriş yaptı
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {sessionTickets.map((t) => (
                            <span
                              key={t.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                                t.checkedIn
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-[#FAF7F2] text-[#4A3F3A] border-[#E7DDCE]'
                              }`}
                            >
                              <span className="font-bold text-[#DE997C]">#{t.seatNumber}</span>
                              <span>{t.attendeeName}</span>
                              {t.checkedIn && (
                                <span className="text-[9px] text-emerald-700 font-semibold">✓ Giriş</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[#E7DDCE]/60 text-[11px] text-[#7E7067] italic">
                        Bu seans için henüz rezervasyon bulunmuyor.
                      </div>
                    )}

                    {/* Açılır / Genişleyen Detaylı Katılımcı Tablosu */}
                    {isExpanded && sessionTickets.length > 0 && (
                      <div className="pt-3 border-t border-[#E7DDCE] space-y-2">
                        <div className="bg-[#FAF7F2] rounded-xl p-3 border border-[#E7DDCE]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {sessionTickets.map((t) => (
                              <div
                                key={t.id}
                                className="p-2.5 bg-white rounded-lg border border-[#E7DDCE] flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-[#4A3F3A] flex items-center gap-1">
                                    <span className="px-1.5 py-0.2 bg-[#DE997C]/20 text-[#DE997C] rounded text-[10px] font-bold">
                                      #{t.seatNumber}
                                    </span>
                                    <span>{t.attendeeName}</span>
                                  </div>
                                  <div className="text-[10px] text-[#7E7067]">
                                    {t.attendeeEmail} · {t.attendeePhone}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#DE997C]">
                                    {t.ticketCode}
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  {t.checkedIn ? (
                                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 block">
                                      ✓ Giriş Yapıldı
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const res = checkInTicket(t.ticketCode);
                                        setActionNotice({
                                          type: res.success ? 'success' : 'error',
                                          message: res.message,
                                        });
                                      }}
                                      className="px-2 py-1 rounded-md bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-[10px] font-semibold cursor-pointer transition-colors"
                                    >
                                      Giriş Al
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QR CHECK-IN & DOĞRULAMA */}
      {activeTab === 'checkin' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E7DDCE] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DE997C]/20 text-[#DE997C] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <h2 className="font-display text-xl font-semibold text-[#4A3F3A]">
              Kapıda Bilet Doğrulama & Check-in
            </h2>
            <p className="text-xs text-[#7E7067] max-w-md mx-auto">
              Katılımcının bilet onay e-postasındaki QR kodun altındaki bilet kodunu (örn. NCS-TK-84920-1) girin veya taranan kodu yapıştırın.
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4 pt-2">
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  required
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                  placeholder="NCS-TK-XXXXX-X"
                  className="flex-1 px-4 py-3 text-center font-mono text-base font-bold uppercase rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#4A3F3A] hover:bg-[#382F2A] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Doğrula
                </button>
              </div>

              {/* Sample Ticket Code Fast-Test buttons */}
              <div className="pt-2 text-xs text-[#7E7067]">
                <span>Hızlı test için hazır bilet kodları:</span>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  {paidOrders.flatMap((o) => o.tickets).slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCheckInCode(t.ticketCode)}
                      className="px-2.5 py-1 font-mono text-[11px] bg-white hover:bg-[#F3EADF] rounded-lg border border-[#E7DDCE] text-[#4A3F3A] cursor-pointer"
                    >
                      {t.ticketCode} ({t.attendeeName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Check-in result alert */}
            {checkInFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold border ${
                  checkInFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {checkInFeedback.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SEANSLAR */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#4A3F3A]">
              Tüm Planlanmış Seanslar
            </h2>
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className="px-4 py-2 bg-[#F4B59A] hover:bg-[#DE997C] text-xs font-semibold rounded-xl text-[#4A3F3A] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Seans Oluştur</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7DDCE] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E7DDCE] text-[#7E7067] font-semibold uppercase">
                  <tr>
                    <th className="p-4">Atölye</th>
                    <th className="p-4">Tarih</th>
                    <th className="p-4">Saat</th>
                    <th className="p-4">Fiyat</th>
                    <th className="p-4">Kontenjan</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DDCE]/60">
                  {sessions.map((session) => {
                    const course = courses.find((c) => c.id === session.courseId);
                    const isFull = session.bookedCount >= session.capacity;

                    return (
                      <tr key={session.id} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-4 font-semibold text-[#4A3F3A]">{course?.title}</td>
                        <td className="p-4 text-[#7E7067]">{formatDate(session.date)}</td>
                        <td className="p-4 text-[#7E7067]">{session.startTime} - {session.endTime}</td>
                        <td className="p-4 font-mono font-semibold text-[#4A3F3A]">
                          {session.price.toLocaleString('tr-TR')} TRY
                        </td>
                        <td className="p-4 font-medium text-[#4A3F3A]">
                          {session.bookedCount} / {session.capacity}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isFull ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isFull ? 'Dolu' : 'Satışta'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedSessionForAttendees(session)}
                            className="px-2.5 py-1 bg-[#F3EADF] hover:bg-[#EBE0D2] rounded-lg text-[#4A3F3A] transition-colors cursor-pointer"
                          >
                            Katılımcılar
                          </button>
                          <button
                            onClick={() => exportAttendeesCsv(session.id)}
                            className="p-1 text-[#7E7067] hover:text-[#4A3F3A]"
                            title="CSV İndir"
                          >
                            <Download className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bu seansı silmek istediğinize emin misiniz?')) {
                                deleteSession(session.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KURSLAR (WORKSHOPS) */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Firebase Firestore Bulut Veritabanı
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[#4A3F3A]">
                Kurs / Atölye Yönetimi ({courses.length})
              </h2>
              <p className="text-xs text-[#7E7067]">
                Atölyeler Firestore bulutunda <code className="font-mono text-[#DE997C]">/courses</code> koleksiyonunda saklanır ve stüdyo paneliyle canlı eşitlenir.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  setIsSyncingCourses(true);
                  const res = await syncCoursesToCloud();
                  setIsSyncingCourses(false);
                  if (res.success) {
                    setActionNotice({
                      type: 'success',
                      message: `${res.count} atölye ve seanslar Firestore bulut veritabanı ile başarıyla senkronize edildi.`,
                    });
                  } else {
                    setActionNotice({
                      type: 'error',
                      message: 'Atölyeleri buluta eşitlerken bir hata oluştu.',
                    });
                  }
                }}
                disabled={isSyncingCourses}
                className="px-3.5 py-2 bg-[#4A3F3A] hover:bg-[#382F2B] text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCourses ? 'animate-spin' : ''}`} />
                <span>{isSyncingCourses ? 'Eşitleniyor...' : 'Atölyeleri Buluta Eşitle'}</span>
              </button>

              <button
                onClick={openNewCourseModal}
                className="px-4 py-2 bg-[#F4B59A] hover:bg-[#DE997C] text-xs font-semibold rounded-xl text-[#4A3F3A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Atölye Ekle</span>
              </button>
            </div>
          </div>

          {/* Courses Management Info Bar */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7DDCE] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-[#4A3F3A]">Atölye & Kurs Yönetimi (Tam CRUD)</span>
              <p className="text-[#7E7067]">
                Atölyeleri listeleyebilir, yeni atölye ekleyebilir, mevcut bir atölyeyi anında düzenleyebilir veya silebilirsiniz. Değişiklikler Firestore veritabanına anlık işlenir.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Firestore CRUD Aktif
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E7DDCE] flex gap-4 items-start justify-between hover:border-[#DE997C]/60 transition-colors"
              >
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-20 h-20 rounded-2xl object-cover bg-[#F3EADF] border border-[#E7DDCE] shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-[#DE997C] uppercase">
                    {course.categoryLabel} · {course.level}
                  </span>
                  <h3 className="font-display text-base font-semibold text-[#4A3F3A] leading-tight truncate">
                    {course.title}
                  </h3>
                  <span className="text-xs text-[#7E7067] block">Eğitmen: {course.instructor.name}</span>
                  <span className="font-display text-sm font-bold text-[#4A3F3A] block">
                    {course.basePrice.toLocaleString('tr-TR')} TRY ({course.durationMinutes} dk)
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditCourseModal(course)}
                    className="p-2 text-[#4A3F3A] hover:text-[#DE997C] hover:bg-white rounded-xl border border-transparent hover:border-[#E7DDCE] transition-all cursor-pointer"
                    title="Atölyeyi Düzenle (Fiyat, Süre, Eğitmen vs.)"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`${course.title} atölyesini silmek istediğinize emin misiniz?`)) {
                        deleteCourse(course.id);
                        setActionNotice({ type: 'success', message: `"${course.title}" atölyesi silindi.` });
                      }
                    }}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Atölyeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SİPARİŞLER & BİLETLER */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#4A3F3A]">
                Siparişler & Bilet Listesi
              </h2>
              <p className="text-xs text-[#7E7067]">
                Seanstan 48 saat öncesine kadar admin iptal/iade işlemi yapılabilir.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7DDCE] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E7DDCE] text-[#7E7067] font-semibold uppercase">
                  <tr>
                    <th className="p-4">Sipariş No</th>
                    <th className="p-4">Müşteri</th>
                    <th className="p-4">E-posta & Tel</th>
                    <th className="p-4">Atölye</th>
                    <th className="p-4">Adet / Tutar</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DDCE]/60">
                  {orders.map((order) => {
                    const course = courses.find((c) => c.id === order.courseId);
                    const session = sessions.find((s) => s.id === order.sessionId);

                    return (
                      <tr key={order.id} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-4 font-mono font-semibold text-[#4A3F3A]">
                          {order.orderNumber}
                        </td>
                        <td className="p-4 font-medium text-[#4A3F3A]">{order.customerName}</td>
                        <td className="p-4 text-[#7E7067]">
                          <div>{order.customerEmail}</div>
                          <div className="text-[11px] text-[#7E7067]/70">{order.customerPhone}</div>
                        </td>
                        <td className="p-4 text-[#4A3F3A]">
                          <span className="font-medium block">{course?.title}</span>
                          <span className="text-[11px] text-[#7E7067]">
                            {session ? formatDate(session.date) : ''}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-semibold text-[#4A3F3A]">
                            {order.totalAmount.toLocaleString('tr-TR')} TRY
                          </span>
                          <span className="text-[11px] text-[#7E7067] block">
                            ({order.quantity} Bilet)
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.status === 'paid' ? 'Ödendi' : 'İade Edildi'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {order.status === 'paid' ? (
                            <button
                              onClick={() => handleRefund(order.id)}
                              className="px-2.5 py-1 text-[11px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                            >
                              İptal & İade Et
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#7E7067] italic">İade Tamamlandı</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: KAYITLI KULLANICILAR & FIRESTORE YÖNETİMİ */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header & Cloud Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Firebase Firestore Bulut Veritabanı
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#4A3F3A]">
                Kayıtlı Kullanıcılar & Üye Yönetimi
              </h2>
              <p className="text-xs text-[#7E7067]">
                Tüm kayıtlı kullanıcılar Google Cloud Firestore bulutunda saklanır ve stüdyo paneline anlık yansır.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  setIsSyncingCloud(true);
                  const res = await syncUsersToCloud();
                  setIsSyncingCloud(false);
                  if (res.success) {
                    setActionNotice({
                      type: 'success',
                      message: `${res.count} kayıtlı kullanıcı veritabanı ile başarıyla senkronize edildi.`,
                    });
                  } else {
                    setActionNotice({
                      type: 'error',
                      message: 'Bulut eşitlemesi sırasında bir sorun oluştu.',
                    });
                  }
                }}
                disabled={isSyncingCloud}
                className="px-3.5 py-2 bg-[#4A3F3A] hover:bg-[#382F2B] text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Eşitleniyor...' : 'Verileri Senkronize Et'}</span>
              </button>
            </div>
          </div>

          {/* Search bar & Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7E7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="İsim, kullanıcı adı (@...) veya e-posta ile ara..."
                className="w-full pl-10 pr-8 py-2 bg-white rounded-xl border border-[#E7DDCE] text-xs text-[#4A3F3A] focus:outline-none focus:border-[#DE997C]"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E7067] hover:text-[#4A3F3A]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-[#7E7067]">
              Toplam <span className="font-semibold text-[#4A3F3A]">{users.length}</span> kayıtlı kullanıcı
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-[#E7DDCE] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E7DDCE] text-[#7E7067] font-semibold uppercase">
                  <tr>
                    <th className="p-4">Kullanıcı</th>
                    <th className="p-4">Kullanıcı Adı</th>
                    <th className="p-4">İletişim Bilgileri</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Bilet / Sipariş</th>
                    <th className="p-4">Kayıt Tarihi</th>
                    <th className="p-4 text-right">Bulut Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DDCE]/60">
                  {users
                    .filter((u) => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        (u.username && u.username.toLowerCase().includes(q)) ||
                        (u.phone && u.phone.includes(q))
                      );
                    })
                    .map((user) => {
                      const userOrders = orders.filter(
                        (o) =>
                          o.userId === user.id ||
                          o.customerEmail.toLowerCase() === user.email.toLowerCase()
                      );
                      const totalTickets = userOrders.reduce((sum, o) => sum + o.quantity, 0);

                      return (
                        <tr key={user.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#E7DDCE] text-[#4A3F3A] font-semibold flex items-center justify-center text-xs shrink-0">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <span className="font-medium text-[#4A3F3A] block">{user.name}</span>
                                <span className="text-[10px] text-[#7E7067] font-mono">{user.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[#4A3F3A]">
                            <span className="text-[#DE997C] font-semibold">
                              @{user.username || user.email.split('@')[0]}
                            </span>
                          </td>

                          <td className="p-4 text-[#7E7067]">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-[#DE997C]" />
                              <a href={`mailto:${user.email}`} className="hover:underline text-[#4A3F3A]">
                                {user.email}
                              </a>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] text-[#7E7067] mt-0.5">
                                <Phone className="w-3 h-3 text-[#8AA481]" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                user.role === 'admin'
                                  ? 'bg-[#DE997C]/20 text-[#DE997C]'
                                  : 'bg-[#A8BFA0]/20 text-[#6B8562]'
                              }`}
                            >
                              {user.role === 'admin' ? 'Yönetici' : 'Müşteri'}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-[#4A3F3A] block">
                              {totalTickets} Bilet
                            </span>
                            <span className="text-[11px] text-[#7E7067]">
                              {userOrders.length} Sipariş
                            </span>
                          </td>

                          <td className="p-4 text-[#7E7067] font-mono text-[11px]">
                            {user.createdAt || '2026-10-18'}
                          </td>

                          <td className="p-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Firestore'da Aktif
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: E-POSTA & BİLDİRİM TETİKLEYİCİLERİ (RESEND & FIREBASE FUNCTIONS) */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Otomatik E-posta Tetikleyici Mimarisi
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#4A3F3A]">
                Firebase Functions & Resend E-posta Bildirimleri
              </h2>
              <p className="text-xs text-[#7E7067]">
                Kullanıcı kaydı ve bilet satın alımlarında otomatik tetiklenen e-postaların canlı durumu ve geçmiş günlükleri.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resend & Triggerlar Aktif</span>
              </span>
            </div>
          </div>

          {/* Architecture Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E7DDCE] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#F4B59A]/30 flex items-center justify-center text-[#DE997C]">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#4A3F3A]">
                1. Hoş Geldin Tetikleyicisi
              </h3>
              <p className="text-xs text-[#7E7067] leading-relaxed">
                Kullanıcı e-posta/şifre veya Google ile ilk defa üye olduğunda otomatik tetiklenir. Marka tanıtımı ve ilk rezervasyon rehberi içerir.
              </p>
              <div className="pt-1 text-[11px] font-mono text-[#DE997C]">
                Tetikleyici: onUserCreated / Resend
              </div>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E7DDCE] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#A8BFA0]/30 flex items-center justify-center text-[#6E8864]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#4A3F3A]">
                2. Bilet & Giriş Kartı Tetikleyicisi
              </h3>
              <p className="text-xs text-[#7E7067] leading-relaxed">
                Atölye seansı için bilet satın alındığında tetiklenir. Seans tarihi, stüdyo adresi, getirilmesi gerekenler ve bilet kodlarını içerir.
              </p>
              <div className="pt-1 text-[11px] font-mono text-[#6E8864]">
                Tetikleyici: onOrderCreated / Resend
              </div>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E7DDCE] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#E7DDCE] flex items-center justify-center text-[#4A3F3A]">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#4A3F3A]">
                3. Firestore Bildirim Günlüğü
              </h3>
              <p className="text-xs text-[#7E7067] leading-relaxed">
                Tüm giden e-postaların gönderim durumu ve yanıt kodları Firestore bulutunda <code className="text-[#DE997C]">/email_logs</code> altında saklanır.
              </p>
              <div className="pt-1 text-[11px] font-mono text-[#4A3F3A]">
                Koleksiyon: /email_logs
              </div>
            </div>
          </div>

          {/* Test Trigger Control Box */}
          <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DDCE]/60 pb-3">
              <div>
                <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
                  Canlı E-posta Tetikleyici Test Aracı
                </h3>
                <p className="text-xs text-[#7E7067]">
                  İstediğiniz e-posta adresini girip Resend ve şablon entegrasyonunu anında test edebilirsiniz.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#7E7067] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E7DDCE]">
                API: POST /api/send-email
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <AtSign className="w-4 h-4 text-[#7E7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="test@ornek.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-xs text-[#4A3F3A] focus:outline-none focus:border-[#DE997C]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    if (!testEmailAddress || !testEmailAddress.includes('@')) {
                      setActionNotice({ type: 'error', message: 'Lütfen geçerli bir e-posta adresi girin.' });
                      return;
                    }
                    setTestEmailSending(true);
                    const res = await sendWelcomeEmail({ to: testEmailAddress, name: 'Test Katılımcı' });
                    setTestEmailSending(false);
                    if (res.success) {
                      setActionNotice({
                        type: 'success',
                        message: `Hoş Geldin e-postası ${testEmailAddress} adresine başarıyla tetiklendi. (${res.resendId || 'Tamamlandı'})`,
                      });
                    } else {
                      setActionNotice({ type: 'error', message: 'Gönderim başarısız oldu.' });
                    }
                  }}
                  disabled={testEmailSending}
                  className="px-4 py-2.5 bg-[#F4B59A] hover:bg-[#DE997C] text-xs font-semibold text-[#4A3F3A] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <Send className={`w-3.5 h-3.5 ${testEmailSending ? 'animate-bounce' : ''}`} />
                  <span>Hoş Geldin E-postası Test Et</span>
                </button>

                <button
                  onClick={async () => {
                    if (!testEmailAddress || !testEmailAddress.includes('@')) {
                      setActionNotice({ type: 'error', message: 'Lütfen geçerli bir e-posta adresi girin.' });
                      return;
                    }
                    const sampleCourse = courses[0];
                    const sampleSession = sessions[0];
                    if (!sampleCourse || !sampleSession) {
                      setActionNotice({ type: 'error', message: 'Test için en az 1 atölye ve seans bulunmalıdır.' });
                      return;
                    }
                    setTestEmailSending(true);
                    const mockOrder = {
                      id: 'ord-test-demo',
                      orderNumber: 'NC-DEMO-2026',
                      customerName: 'Test Katılımcı',
                      customerEmail: testEmailAddress,
                      customerPhone: '0555 123 45 67',
                      sessionId: sampleSession.id,
                      courseId: sampleCourse.id,
                      quantity: 2,
                      totalAmount: sampleSession.price * 2,
                      currency: 'TRY' as const,
                      status: 'paid' as const,
                      createdAt: new Date().toISOString(),
                      paymentMethod: 'Kredi Kartı',
                      paymentId: 'pay-test-123',
                      tickets: [
                        {
                          id: 't-test-1',
                          ticketCode: 'NCS-TEST-01',
                          orderId: 'ord-test-demo',
                          sessionId: sampleSession.id,
                          courseId: sampleCourse.id,
                          attendeeName: 'Test Katılımcı',
                          attendeeEmail: testEmailAddress,
                          attendeePhone: '0555 123 45 67',
                          checkedIn: false,
                          seatNumber: 1,
                        },
                        {
                          id: 't-test-2',
                          ticketCode: 'NCS-TEST-02',
                          orderId: 'ord-test-demo',
                          sessionId: sampleSession.id,
                          courseId: sampleCourse.id,
                          attendeeName: 'Misafir Katılımcı',
                          attendeeEmail: testEmailAddress,
                          attendeePhone: '0555 123 45 67',
                          checkedIn: false,
                          seatNumber: 2,
                        },
                      ],
                    };
                    const res = await sendTicketConfirmationEmail({
                      to: testEmailAddress,
                      customerName: 'Test Katılımcı',
                      order: mockOrder,
                      course: sampleCourse,
                      session: sampleSession,
                    });
                    setTestEmailSending(false);
                    if (res.success) {
                      setActionNotice({
                        type: 'success',
                        message: `Bilet Onay e-postası ${testEmailAddress} adresine başarıyla tetiklendi. (${res.resendId || 'Tamamlandı'})`,
                      });
                    } else {
                      setActionNotice({ type: 'error', message: 'Gönderim başarısız oldu.' });
                    }
                  }}
                  disabled={testEmailSending}
                  className="px-4 py-2.5 bg-[#A8BFA0] hover:bg-[#8AA481] text-xs font-semibold text-[#4A3F3A] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <Send className={`w-3.5 h-3.5 ${testEmailSending ? 'animate-bounce' : ''}`} />
                  <span>Bilet Onayı Test Et</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="bg-white rounded-3xl border border-[#E7DDCE] overflow-hidden shadow-2xs space-y-2">
            <div className="p-4 sm:p-5 border-b border-[#E7DDCE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
                  Gönderilen E-posta Günlükleri ({emailLogs.length})
                </h3>
                <p className="text-xs text-[#7E7067]">
                  Resend üzerinden iletilen ve Firestore <code className="font-mono text-[#DE997C]">/email_logs</code> koleksiyonunda saklanan canlı kayıtlar.
                </p>
              </div>
              <span className="text-xs text-[#7E7067]">
                Gerçek Zamanlı Güncelleme
              </span>
            </div>

            {emailLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7E7067] space-y-2">
                <Inbox className="w-8 h-8 text-[#DE997C] mx-auto opacity-60" />
                <p>Henüz tetiklenmiş e-posta kaydı bulunmuyor.</p>
                <p className="text-[11px] text-[#7E7067]/70">
                  Yukarıdaki test aracını kullanarak ilk e-postanızı gönderebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E7DDCE] text-[#7E7067] font-semibold uppercase">
                    <tr>
                      <th className="p-4">Tetikleyici Türü</th>
                      <th className="p-4">Alıcı E-posta</th>
                      <th className="p-4">E-posta Konusu</th>
                      <th className="p-4">Tarih & Saat</th>
                      <th className="p-4">Mesaj / Takip ID</th>
                      <th className="p-4 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DDCE]/60">
                    {emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              log.type === 'welcome'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.type === 'welcome' ? '🎉 Hoş Geldin' : '🎟️ Bilet Onayı'}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-[#4A3F3A]">
                          {log.recipientEmail}
                        </td>
                        <td className="p-4 text-[#4A3F3A]">
                          {log.subject}
                        </td>
                        <td className="p-4 text-[#7E7067] font-mono text-[11px]">
                          {new Date(log.sentAt).toLocaleString('tr-TR', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-[#7E7067]">
                          {log.id.slice(0, 16)}...
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                              log.status === 'sent'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : 'text-amber-700 bg-amber-50 border border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                log.status === 'sent' ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                            />
                            {log.status === 'sent' ? 'Başarıyla İletildi' : 'Geliştirme / Simüle'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: ESER & YORUM ONAY MASASI (ÖDEV 3 - SEÇENEK B) */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">
                  Yönetici İnceleme & Onay Masası
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#4A3F3A]">
                Eser Fotoğrafları & Atölye Yorumları Onay Kuyruğu
              </h2>
              <p className="text-xs text-[#7E7067] mt-1">
                Biletli katılımcıların atölye sonrası paylaştığı fotoğrafları, 1-5 yıldız puanlarını ve yorumlarını inceleyin. Tek tıkla onaylayarak Topluluk Vitrininde ve Ana Sayfada yayınlayın veya zorunlu gerekçe ile düzeltme isteyin.
              </p>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#F3EADF] p-1.5 rounded-xl text-xs">
              <button
                onClick={() => setApprovalStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  approvalStatusFilter === 'pending'
                    ? 'bg-[#4A3F3A] text-white shadow-xs'
                    : 'text-[#7E7067] hover:text-[#4A3F3A]'
                }`}
              >
                Onay Bekleyenler ({posts.filter((p) => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setApprovalStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  approvalStatusFilter === 'published'
                    ? 'bg-[#4A3F3A] text-white shadow-xs'
                    : 'text-[#7E7067] hover:text-[#4A3F3A]'
                }`}
              >
                Yayındakiler ({posts.filter((p) => p.status === 'published').length})
              </button>
              <button
                onClick={() => setApprovalStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  approvalStatusFilter === 'rejected'
                    ? 'bg-[#4A3F3A] text-white shadow-xs'
                    : 'text-[#7E7067] hover:text-[#4A3F3A]'
                }`}
              >
                Reddedilenler ({posts.filter((p) => p.status === 'rejected').length})
              </button>
              <button
                onClick={() => setApprovalStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  approvalStatusFilter === 'all'
                    ? 'bg-[#4A3F3A] text-white shadow-xs'
                    : 'text-[#7E7067] hover:text-[#4A3F3A]'
                }`}
              >
                Tümü ({posts.length})
              </button>
            </div>
          </div>

          {/* Posts List */}
          {(() => {
            const list = posts.filter((p) => {
              if (approvalStatusFilter === 'all') return true;
              return p.status === approvalStatusFilter;
            });

            if (list.length === 0) {
              return (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#E7DDCE] text-xs text-[#7E7067] space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#7E7067] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="font-semibold text-sm text-[#4A3F3A]">Kuyrukta Eser Bulunmuyor</div>
                  <p className="max-w-md mx-auto">
                    {approvalStatusFilter === 'pending'
                      ? 'Harika! Onay bekleyen hiçbir eser kalmadı. Katılımcılar yeni eser gönderdikçe anlık olarak burada listelenecektir.'
                      : 'Bu filtreye uygun eser kaydı bulunmuyor.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {list.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-[#E7DDCE] p-6 shadow-xs space-y-4 hover:border-[#DE997C]/50 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {post.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Onay Bekliyor
                            </span>
                          )}
                          {post.status === 'published' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Yayında (Topluluk Vitrini)
                            </span>
                          )}
                          {post.status === 'published' && post.showOnHome && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                              ★ Ana Sayfada Öne Çıkıyor
                            </span>
                          )}
                          {post.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Reddedildi / Düzeltme İsteniyor
                            </span>
                          )}
                          {post.status === 'draft' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3EADF] text-[#7E7067]">
                              Taslak (Kullanıcı Paneli)
                            </span>
                          )}
                          <span className="text-xs text-[#7E7067]">&bull;</span>
                          <span className="text-xs font-semibold text-[#4A3F3A]">{post.categoryLabel}</span>
                          <span className="text-xs text-[#7E7067]">&bull;</span>
                          <span className="text-xs text-[#7E7067]">📅 {post.createdAt}</span>
                        </div>

                        <div className="flex gap-4 items-start pt-1">
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-20 h-20 rounded-2xl object-cover bg-[#FAF7F2] border border-[#E7DDCE] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">
                              {post.title}
                            </h3>
                            <p className="text-xs text-[#7E7067]">
                              Katılımcı: <strong className="text-[#4A3F3A]">{post.authorName}</strong> (ID: {post.authorId})
                              {post.workshopTitle && <> &bull; Atölye: <strong className="text-[#4A3F3A]">{post.workshopTitle}</strong></>}
                            </p>
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
                                <span className="text-[11px] font-bold text-[#DE997C] ml-1">
                                  {post.rating}/5 Katılımcı Puanı
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={async () => {
                                const res = await reviewPost(post.id, 'publish', undefined, true);
                                setActionNotice({
                                  type: res.success ? 'success' : 'error',
                                  message: res.message,
                                });
                              }}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Onayla & Vitrinde Yayınla</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectingPost(post);
                                setRejectionReasonInput('');
                              }}
                              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reddet / Gerekçe İlet</span>
                            </button>
                          </>
                        )}

                        {post.status === 'published' && (
                          <>
                            <button
                              onClick={async () => {
                                const res = await togglePostShowOnHome(post.id);
                                if (res.success) {
                                  setActionNotice({
                                    type: 'success',
                                    message: res.showOnHome
                                      ? 'Eser ana sayfada öne çıkarılanlar vitrinine eklendi.'
                                      : 'Eser ana sayfadan kaldırıldı.',
                                  });
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                                post.showOnHome
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                                  : 'bg-white border-[#E7DDCE] text-[#4A3F3A] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              {post.showOnHome ? '★ Ana Sayfada (Kaldır)' : '☆ Ana Sayfaya Ekle'}
                            </button>
                            <button
                              onClick={async () => {
                                const res = await reviewPost(post.id, 'reject', 'Yönetici tarafından revizyon amacıyla yayından kaldırıldı.');
                                setActionNotice({
                                  type: 'success',
                                  message: 'Eser yayından kaldırıldı ve düzeltme durumuna alındı.',
                                });
                              }}
                              className="px-3 py-1.5 text-xs text-[#7E7067] hover:text-red-700 border border-[#E7DDCE] hover:border-red-200 rounded-xl transition-colors cursor-pointer"
                            >
                              Yayından Kaldır
                            </button>
                          </>
                        )}

                        {post.status === 'rejected' && (
                          <button
                            onClick={async () => {
                              const res = await reviewPost(post.id, 'publish');
                              setActionNotice({
                                type: 'success',
                                message: 'Eser onaylanarak tekrar yayına alındı.',
                              });
                            }}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Tekrar Onayla & Yayınla
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Existing Rejection Notice */}
                    {post.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs space-y-1">
                        <span className="font-semibold text-red-800 block">Kayıtlı Reddetme Sebebi:</span>
                        <p className="text-red-700 leading-relaxed font-sans">{post.rejectionReason}</p>
                        {post.reviewedBy && (
                          <span className="text-[10px] text-red-600 block pt-0.5">
                            İnceleyen: {post.reviewedBy} &bull; {post.reviewedAt}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {post.description && (
                      <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#4A3F3A] leading-relaxed italic border border-[#E7DDCE]/60">
                        "{post.description}"
                      </div>
                    )}

                    {/* Materials & Steps grid if present */}
                    {((post.materials && post.materials.length > 0) || (post.steps && post.steps.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                        {post.materials && post.materials.length > 0 && (
                          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE]/60 space-y-1.5">
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#7E7067] block">
                              Gerekli Malzemeler ({post.materials.length})
                            </span>
                            <ul className="list-disc list-inside text-[#4A3F3A] space-y-1">
                              {post.materials.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {post.steps && post.steps.length > 0 && (
                          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE]/60 space-y-1.5">
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#7E7067] block">
                              Yapılış Adımları ({post.steps.length} Aşamalı)
                            </span>
                            <ol className="list-decimal list-inside text-[#4A3F3A] space-y-1">
                              {post.steps.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Reddetme Gerekçesi Modalı */}
      {rejectingPost && (
        <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E7DDCE] shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                  Eser Reddetme / Düzeltme Talebi
                </span>
                <h3 className="font-display text-xl font-semibold text-[#4A3F3A] mt-0.5">
                  "{rejectingPost.title}"
                </h3>
              </div>
              <button
                onClick={() => setRejectingPost(null)}
                className="p-1.5 text-[#7E7067] hover:text-[#4A3F3A] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#7E7067] leading-relaxed">
              Katılımcıya eserin neden onaylanmadığını ve nelerin düzeltilmesi gerektiğini açıklayın.
              Örnek: <em>"Yapılış adımları en az 3 detaylı aşamayı içermelidir."</em>
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#4A3F3A] uppercase mb-1.5">
                Red Gerekçesi / Düzeltme Notu <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Örn: Yapılış adımları en az 3 detaylı aşamayı ve kullanılan divit ucu ölçüsünü içermelidir. Lütfen düzenleyip tekrar gönderiniz."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] focus:outline-none focus:ring-2 focus:ring-[#DE997C]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPost(null)}
                className="flex-1 py-2.5 border border-[#E7DDCE] text-[#7E7067] text-xs font-semibold rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!rejectionReasonInput.trim()) {
                    alert('Lütfen bir reddetme gerekçesi giriniz.');
                    return;
                  }
                  const res = await reviewPost(rejectingPost.id, 'reject', rejectionReasonInput);
                  setRejectingPost(null);
                  setActionNotice({
                    type: res.success ? 'success' : 'error',
                    message: res.message,
                  });
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Reddi Onayla ve İlet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Katılımcı Listesi Modalı (CSV İndirmeli & Canlı Check-in) */}
      {selectedSessionForAttendees && (() => {
        const modalCourse = courses.find((c) => c.id === selectedSessionForAttendees.courseId);
        const modalTickets = orders
          .filter((o) => o.sessionId === selectedSessionForAttendees.id && o.status === 'paid')
          .flatMap((o) => o.tickets);
        const modalCheckedInCount = modalTickets.filter((t) => t.checkedIn).length;

        return (
          <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E7DDCE] shadow-2xl p-6 sm:p-8 space-y-5 relative">
              <button
                onClick={() => setSelectedSessionForAttendees(null)}
                className="absolute top-4 right-4 p-1.5 text-[#7E7067] hover:text-[#4A3F3A] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">
                  Resmi Katılımcı & Kapı Kontrol Listesi
                </span>
                <h3 className="font-display text-xl font-semibold text-[#4A3F3A]">
                  {modalCourse?.title || 'Atölye Seansı'}
                </h3>
                <p className="text-xs text-[#7E7067]">
                  📅 {formatDate(selectedSessionForAttendees.date)} · ⏰ {selectedSessionForAttendees.startTime} - {selectedSessionForAttendees.endTime} · 👤 Eğitmen: {modalCourse?.instructor?.name || 'Selin Arslan'}
                </p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-center">
                  <span className="text-[10px] text-[#7E7067] uppercase font-semibold block">Kontenjan</span>
                  <span className="text-base font-bold text-[#4A3F3A]">{selectedSessionForAttendees.capacity} Kişi</span>
                </div>
                <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-center">
                  <span className="text-[10px] text-[#7E7067] uppercase font-semibold block">Kayıtlı Bilet</span>
                  <span className="text-base font-bold text-[#DE997C]">{modalTickets.length} Bilet</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Giriş Yapan</span>
                  <span className="text-base font-bold text-emerald-800">{modalCheckedInCount} Kişi</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-700 uppercase font-semibold block">Beklenen</span>
                  <span className="text-base font-bold text-amber-800">{modalTickets.length - modalCheckedInCount} Kişi</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#7E7067]">
                  Toplam <strong>{modalTickets.length}</strong> biletli katılımcı listeleniyor:
                </span>
                <button
                  onClick={() => exportAttendeesCsv(selectedSessionForAttendees.id)}
                  className="px-3.5 py-1.5 bg-[#A8BFA0] hover:bg-[#8AA481] text-[#4A3F3A] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV Olarak İndir</span>
                </button>
              </div>

              {/* Attendees list */}
              <div className="max-h-80 overflow-y-auto border border-[#E7DDCE] rounded-2xl divide-y divide-[#E7DDCE]/60">
                {modalTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#7E7067]">
                    Bu seansa henüz kayıtlı biletli katılımcı bulunmuyor.
                  </div>
                ) : (
                  modalTickets.map((t) => (
                    <div key={t.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#FAF7F2]/50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#DE997C]/20 text-[#DE997C] font-bold rounded-md text-[10px]">
                            Koltuk #{t.seatNumber}
                          </span>
                          <span className="font-semibold text-sm text-[#4A3F3A]">
                            {t.attendeeName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7E7067]">
                          ✉️ {t.attendeeEmail} · 📞 {t.attendeePhone}
                        </div>
                        <div className="text-[10px] font-mono text-[#7E7067]">
                          Bilet: <strong>{t.ticketCode}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:self-center self-end">
                        {t.checkedIn ? (
                          <div className="text-right">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Giriş Yaptı</span>
                            </span>
                            {t.checkedInAt && (
                              <span className="text-[10px] text-[#7E7067] block mt-0.5">Saat: {t.checkedInAt}</span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const res = checkInTicket(t.ticketCode);
                              setActionNotice({
                                type: res.success ? 'success' : 'error',
                                message: res.message,
                              });
                            }}
                            className="px-3 py-1.5 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Kapıda Giriş Al
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Yeni Seans Modalı */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E7DDCE] shadow-2xl p-6 space-y-4 relative">
            <button
              onClick={() => setIsSessionModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#7E7067] hover:text-[#4A3F3A] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">
              Yeni Seans Oluştur
            </h3>

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3F3A] mb-1">Atölye Seçin</label>
                <select
                  value={sessionForm.courseId}
                  onChange={(e) => setSessionForm({ ...sessionForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3F3A] mb-1">Tarih</label>
                <input
                  type="date"
                  required
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Başlangıç Saati</label>
                  <input
                    type="time"
                    required
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Bitiş Saati</label>
                  <input
                    type="time"
                    required
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Kişi Başı Fiyat (TRY)</label>
                  <input
                    type="number"
                    required
                    value={sessionForm.price}
                    onChange={(e) => setSessionForm({ ...sessionForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Kontenjan (Kişi)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={sessionForm.capacity}
                    onChange={(e) => setSessionForm({ ...sessionForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Seansı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni / Düzenle Atölye Kursu Modalı */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E7DDCE] shadow-2xl p-6 space-y-4 relative my-8">
            <button
              onClick={() => {
                setIsCourseModalOpen(false);
                setEditingCourse(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-[#7E7067] hover:text-[#4A3F3A] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">
              {editingCourse ? 'Atölyeyi Düzenle' : 'Yeni Atölye Tanımla'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3F3A] mb-1">Atölye Başlığı</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Örn. Doğal Taş Takı Atölyesi"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Kategori</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as CourseCategory;
                      const labels: Record<CourseCategory, string> = {
                        ceramic: 'Seramik',
                        painting: 'Resim',
                        jewelry: 'Takı Tasarımı',
                        textile: 'Tekstil & Örgü',
                        calligraphy: 'Kaligrafi',
                        candle: 'Mum & Koku',
                      };
                      setCourseForm({ ...courseForm, category: cat, categoryLabel: labels[cat] });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  >
                    <option value="ceramic">Seramik</option>
                    <option value="painting">Resim</option>
                    <option value="jewelry">Takı Tasarımı</option>
                    <option value="textile">Tekstil & Örgü</option>
                    <option value="calligraphy">Kaligrafi</option>
                    <option value="candle">Mum & Koku</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Eğitmen Adı</label>
                  <input
                    type="text"
                    required
                    value={courseForm.instructorName}
                    onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3F3A] mb-1">Kısa Açıklama</label>
                <textarea
                  required
                  rows={2}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Süre (Dk)</label>
                  <input
                    type="number"
                    value={courseForm.durationMinutes}
                    onChange={(e) => setCourseForm({ ...courseForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Seviye</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  >
                    <option value="Başlangıç">Başlangıç</option>
                    <option value="Orta Seviye">Orta Seviye</option>
                    <option value="Tüm Seviyeler">Tüm Seviyeler</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3F3A] mb-1">Fiyat (TRY)</label>
                  <input
                    type="number"
                    value={courseForm.basePrice}
                    onChange={(e) => setCourseForm({ ...courseForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3F3A] mb-1">Dahil Olan Malzemeler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={courseForm.includedItems}
                  onChange={(e) => setCourseForm({ ...courseForm, includedItems: e.target.value })}
                  placeholder="Kullanılacak malzemeler, ikramlar vb."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {editingCourse ? 'Değişiklikleri Güncelle' : 'Atölyeyi Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
