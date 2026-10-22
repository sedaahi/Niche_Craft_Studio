import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { workshopCeramicImg } from '../data/initialData';
import { Course, Session, CourseCategory } from '../types';
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
} from 'lucide-react';
import { sendWelcomeEmail, sendTicketConfirmationEmail } from '../services/emailService';

export const AdminView: React.FC = () => {
  const {
    courses,
    sessions,
    orders,
    users,
    emailLogs,
    syncUsersToCloud,
    syncCoursesToCloud,
    isAdminLoggedIn,
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

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sessions' | 'courses' | 'orders' | 'checkin' | 'emails'>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isSyncingCourses, setIsSyncingCourses] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('demo@nichecraft.studio');
  const [testEmailSending, setTestEmailSending] = useState(false);

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

  // Feedback toast for refunds/actions
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // If not logged in, show sleek login form
  if (!isAdminLoggedIn) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const success = loginAsAdmin(passwordInput.trim());
      if (!success) {
        setLoginError('Hatalı şifre. (İpucu: admin123)');
      } else {
        setLoginError('');
      }
    };

    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E7DDCE] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#DE997C]/20 text-[#DE997C] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-[#4A3F3A]">
              Stüdyo Yönetim Girişi
            </h1>
            <p className="text-xs text-[#7E7067]">
              Atölye takvimi, kontenjanlar ve bilet doğrulaması için yetkili şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#4A3F3A] mb-1.5">
                Admin Şifresi
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Şifrenizi yazınız"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4A3F3A] hover:bg-[#382F2A] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Yönetici Paneline Gir
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setPasswordInput('admin123');
                  loginAsAdmin('admin123');
                }}
                className="text-xs text-[#DE997C] hover:underline cursor-pointer"
              >
                Hızlı Test Girişi (admin123)
              </button>
            </div>
          </form>
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

  // Handle Course creation
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
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
    setActionNotice({ type: 'success', message: 'Yeni atölye kursu sisteme kaydedildi.' });
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

        <div className="flex items-center gap-3">
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

            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] space-y-1">
              <span className="text-[11px] font-semibold text-[#7E7067] uppercase">Aktif Seans</span>
              <span className="font-display text-2xl font-bold text-[#4A3F3A] block">
                {sessions.length} Seans
              </span>
              <span className="text-[10px] text-[#DE997C] font-semibold">Tunalı Hilmi Stüdyosu</span>
            </div>
          </div>

          {/* Quick sessions overview */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
                Yaklaşan Seansların Durumu
              </h3>
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="px-3 py-1.5 bg-[#F4B59A] text-xs font-semibold rounded-xl text-[#4A3F3A] hover:bg-[#DE997C] transition-colors cursor-pointer"
              >
                + Yeni Seans Aç
              </button>
            </div>

            <div className="divide-y divide-[#E7DDCE]/60">
              {sessions.slice(0, 5).map((session) => {
                const course = courses.find((c) => c.id === session.courseId);
                const isFull = session.bookedCount >= session.capacity;

                return (
                  <div key={session.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-sm text-[#4A3F3A] block">
                        {course?.title || 'Atölye'}
                      </span>
                      <span className="text-[#7E7067]">
                        {formatDate(session.date)} · {session.startTime} - {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-[#4A3F3A] block">
                          {session.bookedCount} / {session.capacity} Dolu
                        </span>
                        <span className={`text-[10px] font-semibold ${isFull ? 'text-red-700' : 'text-[#8AA481]'}`}>
                          {isFull ? 'Kontenjan Doldu' : `${session.capacity - session.bookedCount} Boş Yer`}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedSessionForAttendees(session)}
                        className="px-3 py-1.5 bg-white hover:bg-[#F3EADF] text-[#4A3F3A] rounded-lg border border-[#E7DDCE] transition-colors cursor-pointer"
                      >
                        Katılımcılar
                      </button>
                    </div>
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
                onClick={() => setIsCourseModalOpen(true)}
                className="px-4 py-2 bg-[#F4B59A] hover:bg-[#DE997C] text-xs font-semibold rounded-xl text-[#4A3F3A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Atölye Ekle</span>
              </button>
            </div>
          </div>

          {/* Cloud Info Bar */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7DDCE] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#4A3F3A]">Firestore Koleksiyonları:</span>
                <code className="bg-[#E7DDCE]/60 text-[#4A3F3A] px-2 py-0.5 rounded font-mono text-[11px]">
                  /courses/{'{courseId}'}
                </code>
                <span className="text-[#7E7067]">&</span>
                <code className="bg-[#E7DDCE]/60 text-[#4A3F3A] px-2 py-0.5 rounded font-mono text-[11px]">
                  /sessions/{'{sessionId}'}
                </code>
              </div>
              <p className="text-[#7E7067]">
                Yeni bir atölye veya seans eklendiğinde otomatik olarak Firestore'a yazılır ve diğer cihazlara anlık iletilir.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Firestore Canlı Eşitli
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E7DDCE] flex gap-4 items-start justify-between"
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

                <button
                  onClick={() => {
                    if (window.confirm(`${course.title} atölyesini silmek istediğinize emin misiniz?`)) {
                      deleteCourse(course.id);
                    }
                  }}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <a
                href="https://console.firebase.google.com/project/industrial-result-1w2pc/firestore/databases/ai-studio-nichecraftstudio-14b047c3-b492-4714-bd13-5435005f46b9/data"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#F3EADF] hover:bg-[#E7DDCE] text-xs font-semibold text-[#4A3F3A] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Firebase Konsolunda Koleksiyonları Aç"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#DE997C]" />
                <span>Firebase Konsolunda Aç ↗</span>
              </a>

              <button
                onClick={async () => {
                  setIsSyncingCloud(true);
                  const res = await syncUsersToCloud();
                  setIsSyncingCloud(false);
                  if (res.success) {
                    setActionNotice({
                      type: 'success',
                      message: `${res.count} kayıtlı kullanıcı Firestore bulut veritabanı ile başarıyla senkronize edildi.`,
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
                <span>{isSyncingCloud ? 'Eşitleniyor...' : 'Buluta Senkronize Et'}</span>
              </button>
            </div>
          </div>

          {/* Cloud Status Info Card */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7DDCE] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#4A3F3A]">Aktif Firestore Veritabanı ID:</span>
                <code className="bg-[#E7DDCE]/60 text-[#4A3F3A] px-2 py-0.5 rounded font-mono text-[11px]">
                  ai-studio-nichecraftstudio-14b047c3-b492-4714-bd13-5435005f46b9
                </code>
              </div>
              <p className="text-[#7E7067]">
                Koleksiyon Yolu: <code className="font-mono text-[#DE997C]">/users/{'{userId}'}</code> · Canlı <code className="font-mono text-[#4A3F3A]">onSnapshot</code> dinleyicisi bağlı.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Firestore Canlı Bağlı
              </span>
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

      {/* Katılımcı Listesi Modalı (CSV İndirmeli) */}
      {selectedSessionForAttendees && (
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
                Katılımcı Listesi
              </span>
              <h3 className="font-display text-xl font-semibold text-[#4A3F3A]">
                {courses.find((c) => c.id === selectedSessionForAttendees.courseId)?.title}
              </h3>
              <p className="text-xs text-[#7E7067]">
                {formatDate(selectedSessionForAttendees.date)} · {selectedSessionForAttendees.startTime} - {selectedSessionForAttendees.endTime}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => exportAttendeesCsv(selectedSessionForAttendees.id)}
                className="px-4 py-2 bg-[#A8BFA0] hover:bg-[#8AA481] text-[#4A3F3A] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>CSV Olarak İndir</span>
              </button>
            </div>

            {/* Attendees list */}
            <div className="max-h-72 overflow-y-auto border border-[#E7DDCE] rounded-2xl divide-y divide-[#E7DDCE]/60">
              {orders
                .filter((o) => o.sessionId === selectedSessionForAttendees.id && o.status === 'paid')
                .flatMap((o) => o.tickets).length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7E7067]">
                  Bu seansa henüz kayıtlı biletli katılımcı bulunmuyor.
                </div>
              ) : (
                orders
                  .filter((o) => o.sessionId === selectedSessionForAttendees.id && o.status === 'paid')
                  .flatMap((o) => o.tickets)
                  .map((t) => (
                    <div key={t.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#4A3F3A] block">
                          {t.attendeeName} (Koltuk #{t.seatNumber})
                        </span>
                        <span className="text-[#7E7067]">{t.attendeeEmail} · {t.attendeePhone}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#4A3F3A] block">{t.ticketCode}</span>
                        <span className={`text-[10px] font-semibold ${t.checkedIn ? 'text-emerald-700' : 'text-[#7E7067]'}`}>
                          {t.checkedIn ? '✓ Giriş Yaptı' : 'Bekleniyor'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Yeni Atölye Kursu Modalı */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E7DDCE] shadow-2xl p-6 space-y-4 relative my-8">
            <button
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#7E7067] hover:text-[#4A3F3A] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">
              Yeni Atölye Tanımla
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
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
                  Atölyeyi Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
