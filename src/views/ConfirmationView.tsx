import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { QrCodeSvg } from '../components/QrCodeSvg';
import { EmailModal } from '../components/EmailModal';
import { STUDIO_INFO } from '../data/initialData';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Download,
  ArrowRight,
  ExternalLink,
  Printer,
} from 'lucide-react';

interface ConfirmationViewProps {
  orderId: string;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ orderId }) => {
  const { orders, courses, sessions, setCurrentView, currentUser, setCurrentUser } = useStore();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [accountSaved, setAccountSaved] = useState(false);

  const order = orders.find((o) => o.id === orderId);
  const session = order ? sessions.find((s) => s.id === order.sessionId) : null;
  const course = order ? courses.find((c) => c.id === order.courseId) : null;

  if (!order || !session || !course) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-sm text-[#7E7067]">Sipariş kaydı bulunamadı.</p>
        <button
          onClick={() => setCurrentView({ view: 'home' })}
          className="px-4 py-2 bg-[#F4B59A] text-xs font-semibold rounded-xl text-[#4A3F3A]"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const formattedDate = new Date(session.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountPassword) return;
    setCurrentUser({
      id: 'usr-' + Date.now(),
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
    setAccountSaved(true);
  };

  // Google Calendar URL generator
  const createGoogleCalendarLink = () => {
    const title = encodeURIComponent(`Niche Craft Studio — ${course.title}`);
    const details = encodeURIComponent(
      `Atölye: ${course.title}\nEğitmen: ${course.instructor.name}\nSipariş No: ${order.orderNumber}\nAdres: ${STUDIO_INFO.address}`
    );
    const location = encodeURIComponent(STUDIO_INFO.address);

    const startIso = session.date.replace(/-/g, '') + 'T' + session.startTime.replace(':', '') + '00';
    const endIso = session.date.replace(/-/g, '') + 'T' + session.endTime.replace(':', '') + '00';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Success Hero Badge */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#E7DDCE] text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#A8BFA0]/20 text-[#8AA481] flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">
          Ödeme Başarılı · Biletiniz Hazır
        </span>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#4A3F3A]">
          Rezervasyonunuz Onaylandı!
        </h1>

        <p className="text-xs sm:text-sm text-[#7E7067] max-w-md mx-auto">
          Tebrikler <strong>{order.customerName}</strong>. Bilet detaylarınız ve giriş QR kodunuz <strong>{order.customerEmail}</strong> adresine gönderildi.
        </p>

        {/* Action Button: View Email */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setEmailModalOpen(true)}
            className="px-4 py-2.5 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#F4B59A]" />
            <span>Gönderilen E-postayı Görüntüle</span>
          </button>

          <a
            href={createGoogleCalendarLink()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white hover:bg-[#F3EADF] text-[#4A3F3A] text-xs font-medium rounded-xl border border-[#E7DDCE] transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#DE997C]" />
            <span>Google Takvime Ekle</span>
          </a>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white hover:bg-[#F3EADF] text-[#4A3F3A] text-xs font-medium rounded-xl border border-[#E7DDCE] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#7E7067]" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#4A3F3A]">
            Atölye Giriş Biletleri ({order.tickets.length} Adet)
          </h2>
          <span className="text-xs text-[#7E7067]">
            Sipariş Kodu: <strong className="font-mono text-[#4A3F3A]">{order.orderNumber}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.tickets.map((ticket, idx) => (
            <div
              key={ticket.id}
              className="bg-white rounded-3xl p-6 border border-[#E7DDCE] shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Decorative top ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F4B59A]" />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#DE997C] uppercase tracking-wider block">
                    Koltuk #{ticket.seatNumber}
                  </span>
                  <h3 className="font-display text-base font-semibold text-[#4A3F3A] leading-tight">
                    {course.title}
                  </h3>
                  <span className="text-xs text-[#7E7067] block">
                    Katılımcı: <strong>{ticket.attendeeName}</strong>
                  </span>
                </div>

                <div className="shrink-0 text-center">
                  <QrCodeSvg value={ticket.ticketCode} size={90} />
                  <span className="text-[9px] text-[#7E7067] font-mono mt-1 block">Giriş QR Kodu</span>
                </div>
              </div>

              {/* Date, Time, Venue */}
              <div className="pt-3 border-t border-[#E7DDCE]/60 space-y-1.5 text-xs text-[#7E7067]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#DE997C]" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#DE997C]" />
                  <span>{session.startTime} – {session.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#DE997C]" />
                  <span className="truncate">{STUDIO_INFO.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7DDCE]/60 flex items-center justify-between text-xs">
                <span className="font-mono text-xs font-bold text-[#4A3F3A]">
                  {ticket.ticketCode}
                </span>
                <span className={`text-[11px] font-medium ${ticket.checkedIn ? 'text-[#8AA481]' : 'text-[#7E7067]'}`}>
                  {ticket.checkedIn ? '✓ Giriş Yapıldı' : 'Kapıda Doğrulama'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest to Member Prompt (if not already logged in) */}
      {!currentUser && !accountSaved && (
        <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E7DDCE] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-display text-base font-semibold text-[#4A3F3A] block">
              Biletinizi Hesabınıza Kaydedin
            </span>
            <p className="text-xs text-[#7E7067] max-w-md">
              Şifre belirleyerek üyeliğinizi tamamlayın. Bir sonraki atölyede bilgilerinizi tekrar girmeden tek tıkla bilet alın.
            </p>
          </div>

          <form onSubmit={handleSaveAccount} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="password"
              required
              value={accountPassword}
              onChange={(e) => setAccountPassword(e.target.value)}
              placeholder="Yeni Şifre Belirleyin"
              className="px-3.5 py-2 text-xs rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold text-xs rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            >
              Hesabı Kaydet
            </button>
          </form>
        </div>
      )}

      {accountSaved && (
        <div className="p-4 bg-[#A8BFA0]/20 rounded-2xl border border-[#A8BFA0]/40 text-xs text-[#4A3F3A] text-center">
          Hesabınız başarıyla oluşturuldu! Artık "Hesabım" sekmesinden biletlerinizi dilediğiniz zaman görüntüleyebilirsiniz.
        </div>
      )}

      {/* Navigation options */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E7DDCE]">
        <button
          onClick={() => setCurrentView({ view: 'courses' })}
          className="text-xs font-semibold text-[#7E7067] hover:text-[#4A3F3A] transition-colors cursor-pointer"
        >
          ← Başka Bir Atölye Keşfet
        </button>

        <button
          onClick={() => setCurrentView({ view: 'account' })}
          className="px-5 py-2.5 bg-[#F3EADF] hover:bg-[#EBE0D2] text-[#4A3F3A] text-xs font-medium rounded-xl border border-[#E7DDCE] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Biletlerimi Hesabımda Gör</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Simulated Email Modal */}
      {emailModalOpen && (
        <EmailModal
          order={order}
          course={course}
          session={session}
          onClose={() => setEmailModalOpen(false)}
        />
      )}
    </div>
  );
};
