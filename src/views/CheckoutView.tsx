import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { IyzicoModal } from '../components/iyzicoModal';
import { STUDIO_INFO } from '../data/initialData';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface CheckoutViewProps {
  sessionId: string;
  initialQuantity?: number;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  sessionId,
  initialQuantity = 1,
}) => {
  const {
    sessions,
    courses,
    currentUser,
    setCurrentView,
    activeHold,
    startReservationHold,
    releaseReservationHold,
    getAvailableSeats,
    createOrder,
  } = useStore();

  const session = sessions.find((s) => s.id === sessionId);
  const course = session ? courses.find((c) => c.id === session.courseId) : null;

  const [quantity, setQuantity] = useState<number>(Math.min(initialQuantity, 4));
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [formError, setFormError] = useState('');
  const [isIyzicoModalOpen, setIsIyzicoModalOpen] = useState(false);

  // Remaining hold time countdown
  const [secondsLeft, setSecondsLeft] = useState<number>(600); // 10 minutes default

  // Check or initialize 10-minute hold for this session
  useEffect(() => {
    if (!session) return;

    if (!activeHold || activeHold.sessionId !== sessionId) {
      const res = startReservationHold(sessionId, quantity);
      if (!res.success) {
        setFormError(res.message || 'Seçilen seans için kontenjan yetersiz.');
      }
    }
  }, [sessionId]);

  // Remount or sync when currentUser becomes available
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerEmail) setCustomerEmail(currentUser.email);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Update countdown
  useEffect(() => {
    if (!activeHold) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((activeHold.expiresAt - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        releaseReservationHold();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHold]);

  if (!session || !course) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-sm text-[#7E7067]">Seçilen seans bulunamadı veya süresi doldu.</p>
        <button
          onClick={() => setCurrentView({ view: 'courses' })}
          className="px-4 py-2 bg-[#F4B59A] text-xs font-semibold rounded-xl text-[#4A3F3A]"
        >
          Atölye Listesine Dön
        </button>
      </div>
    );
  }

  const availableSeats = getAvailableSeats(session.id);
  const isHoldExpired = secondsLeft <= 0;

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > 4) return;
    setQuantity(newQty);
    // Restart hold with new quantity
    startReservationHold(sessionId, newQty);
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isHoldExpired) {
      setFormError('10 dakikalık geçici rezervasyon süreniz doldu. Lütfen sayfayı yenileyip koltuğu tekrar seçiniz.');
      return;
    }

    if (!customerName.trim()) {
      setFormError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Lütfen biletinizin iletileceği geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setFormError('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    // Open realistic iyzico payment modal
    setIsIyzicoModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setIsIyzicoModalOpen(false);
    const newOrder = createOrder({
      sessionId: session.id,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      quantity,
      paymentMethod: 'iyzico Güvenli Ödeme (Kredi Kartı)',
    });

    if (newOrder) {
      setCurrentView({ view: 'confirmation', orderId: newOrder.id });
    }
  };

  const formattedDate = new Date(session.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const totalPrice = session.price * quantity;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => {
            releaseReservationHold();
            setCurrentView({ view: 'course-detail', courseId: course.id });
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7E7067] hover:text-[#4A3F3A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atölye Detayına Geri Dön</span>
        </button>
      </div>

      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">Güvenli Rezervasyon</span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A] mt-1">
          Bilet ve Katılımcı Bilgileri
        </h1>
      </div>

      {/* 10-Minute Hold Alert Notice */}
      <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3 text-xs ${
        isHoldExpired
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-[#F3EADF] border-[#E7DDCE] text-[#4A3F3A]'
      }`}>
        <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${isHoldExpired ? 'text-red-600' : 'text-[#DE997C]'}`} />
        <div className="space-y-0.5">
          <div className="font-semibold">
            {isHoldExpired ? (
              <span>Rezervasyon süresi doldu! Kontenjan serbest bırakıldı.</span>
            ) : (
              <span>
                Kontenjanınız adınıza ayrıldı. Kalan süre: <strong className="font-mono text-sm text-[#DE997C]">{formatTimer(secondsLeft)}</strong>
              </span>
            )}
          </div>
          <p className="text-[#7E7067] text-[11px]">
            Aynı anda iki kişinin son bileti almasını engellemek için koltuklar 10 dakika boyunca güvenle kilitlenir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleSubmitCheckout} className="space-y-6">
            {/* Step 1: Bilet Adedi Seçimi */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
                    Bilet Adedi Seçimi
                  </h3>
                  <span className="text-xs text-[#7E7067]">
                    Tek seferde en fazla 4 bilet alabilirsiniz.
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E7DDCE] p-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isHoldExpired}
                      onClick={() => handleQuantityChange(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        quantity === num
                          ? 'bg-[#4A3F3A] text-white shadow-xs'
                          : 'text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#F3EADF]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Katılımcı / İletişim Bilgileri */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-[#4A3F3A]">
                  Katılımcı & İletişim Bilgileri
                </h3>
                {currentUser && (
                  <span className="text-[11px] text-[#8AA481] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Üye Bilgileriyle Dolduruldu
                  </span>
                )}
              </div>

              {!currentUser && (
                <div className="p-3 bg-[#F3EADF]/80 rounded-2xl border border-[#E7DDCE] text-xs text-[#7E7067] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    Biletlerinizi hesabınızda toplamak ister misiniz?{' '}
                    <strong className="text-[#4A3F3A]">Misafir olarak devam edebilir</strong> veya:
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentView({
                          view: 'auth',
                          initialTab: 'login',
                          returnTo: { view: 'checkout', sessionId, initialQuantity: quantity },
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-lg transition-colors cursor-pointer"
                    >
                      Giriş Yap
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentView({
                          view: 'auth',
                          initialTab: 'register',
                          returnTo: { view: 'checkout', sessionId, initialQuantity: quantity },
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-[#4A3F3A] bg-white hover:bg-[#FAF7F2] border border-[#E7DDCE] rounded-lg transition-colors cursor-pointer"
                    >
                      Kayıt Ol
                    </button>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1.5">
                    Adınız Soyadınız <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Örn. Zeynep Kaya"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1.5">
                    E-posta Adresiniz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="zeynep@example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <span className="text-[11px] text-[#7E7067] mt-1 block">
                    Bilet ve QR giriş kodunuz anında bu e-postaya gönderilecektir.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1.5">
                    Telefon Numaranız <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0555 123 4567"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <span className="text-[11px] text-[#7E7067] mt-1 block">
                    Atölye günü veya olası saat güncellemelerinde SMS bilgilendirmesi için gereklidir.
                  </span>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div>
              <button
                type="submit"
                disabled={isHoldExpired}
                className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  isHoldExpired
                    ? 'bg-[#EBE0D2] text-[#7E7067] cursor-not-allowed opacity-60'
                    : 'bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>iyzico ile Güvenli Ödemeye Geç ({totalPrice.toLocaleString('tr-TR')} TRY)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Card (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] shadow-xs space-y-5">
            <h3 className="font-display text-base font-semibold text-[#4A3F3A] border-b border-[#E7DDCE] pb-3">
              Sipariş Özeti
            </h3>

            {/* Course card teaser */}
            <div className="flex gap-3 items-center">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-16 h-16 rounded-xl object-cover border border-[#E7DDCE] bg-[#F3EADF] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] text-[#7E7067] block">{course.categoryLabel}</span>
                <span className="font-semibold text-xs text-[#4A3F3A] block truncate">{course.title}</span>
                <span className="text-[11px] text-[#DE997C]">Eğitmen: {course.instructor.name}</span>
              </div>
            </div>

            {/* Session Time & Location */}
            <div className="space-y-2 pt-2 border-t border-[#E7DDCE]/60 text-xs text-[#7E7067]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#DE997C]" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#DE997C]" />
                <span>{session.startTime} – {session.endTime}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#DE997C] shrink-0 mt-0.5" />
                <span>{STUDIO_INFO.address}</span>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="pt-4 border-t border-[#E7DDCE] space-y-2 text-xs">
              <div className="flex justify-between text-[#7E7067]">
                <span>Bilet Fiyatı ({quantity} Adet × {session.price.toLocaleString('tr-TR')} TRY)</span>
                <span className="font-mono">{totalPrice.toLocaleString('tr-TR')} TRY</span>
              </div>
              <div className="flex justify-between text-[#7E7067]">
                <span>Tüm Malzemeler & Fırınlama</span>
                <span className="text-[#8AA481] font-medium">Dahil</span>
              </div>
              <div className="flex justify-between text-[#7E7067]">
                <span>Kahve & Bitki Çayı İkramı</span>
                <span className="text-[#8AA481] font-medium">Dahil</span>
              </div>
              <div className="pt-2 border-t border-[#E7DDCE] flex justify-between items-baseline">
                <span className="font-semibold text-sm text-[#4A3F3A]">Toplam Tutar</span>
                <span className="font-display text-xl font-bold text-[#4A3F3A]">
                  {totalPrice.toLocaleString('tr-TR')} TRY
                </span>
              </div>
            </div>

            {/* Trust markers */}
            <div className="p-3 bg-[#F3EADF]/60 rounded-xl border border-[#E7DDCE] text-[11px] text-[#7E7067] space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-[#4A3F3A]">
                <Shield className="w-3.5 h-3.5 text-[#8AA481]" />
                <span>48 Saat İptal/İade Güvencesi</span>
              </div>
              <p>
                Seanstan 48 saat öncesine kadar tek tıkla iade alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* iyzico Payment Modal */}
      {isIyzicoModalOpen && (
        <IyzicoModal
          amount={totalPrice}
          customerName={customerName}
          customerEmail={customerEmail}
          itemDescription={`${course.title} (${quantity} Bilet)`}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setIsIyzicoModalOpen(false)}
        />
      )}
    </div>
  );
};
