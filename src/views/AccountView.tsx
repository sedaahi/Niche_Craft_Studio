import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { QrCodeSvg } from '../components/QrCodeSvg';
import { Ticket, Order } from '../types';
import { STUDIO_INFO } from '../data/initialData';
import {
  User as UserIcon,
  Ticket as TicketIcon,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Mail,
  Phone,
  LogOut,
} from 'lucide-react';

export const AccountView: React.FC = () => {
  const { currentUser, setCurrentUser, orders, courses, sessions, setCurrentView } = useStore();
  const [selectedTicketModal, setSelectedTicketModal] = useState<{
    ticket: Ticket;
    order: Order;
  } | null>(null);

  // Filter orders for this user (or show all matching customerEmail)
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  const allUserTickets = userOrders.flatMap((order) =>
    order.tickets.map((ticket) => ({ ticket, order }))
  );

  const now = new Date();

  // Partition into upcoming and past
  const upcomingTickets = allUserTickets.filter(({ ticket, order }) => {
    const session = sessions.find((s) => s.id === ticket.sessionId);
    if (!session) return false;
    const sessionDate = new Date(`${session.date}T${session.endTime}`);
    return sessionDate >= now && order.status === 'paid';
  });

  const pastTickets = allUserTickets.filter(({ ticket, order }) => {
    const session = sessions.find((s) => s.id === ticket.sessionId);
    if (!session) return false;
    const sessionDate = new Date(`${session.date}T${session.endTime}`);
    return sessionDate < now || order.status !== 'paid';
  });

  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);
  const getSession = (sessionId: string) => sessions.find((s) => s.id === sessionId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Top Profile Header */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E7DDCE] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#DE997C]/20 border border-[#DE997C]/30 flex items-center justify-center text-2xl font-display font-bold text-[#DE997C]">
            {currentUser?.name?.charAt(0) || 'M'}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C]">
                {currentUser ? 'Üye Profili' : 'Misafir Kullanıcı'}
              </span>
              {currentUser?.username && (
                <span className="px-2 py-0.5 bg-[#F3EADF] text-[#4A3F3A] rounded-full text-[11px] font-mono font-medium">
                  @{currentUser.username}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-semibold text-[#4A3F3A]">
              {currentUser?.name || 'Hesabınıza Giriş Yapın'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7E7067] pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {currentUser?.email || 'Biletlerinizi görüntülemek için giriş yapınız'}
              </span>
              {currentUser?.phone && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {currentUser.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser ? (
            <button
              onClick={() => setCurrentUser(null)}
              className="px-4 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentView({ view: 'auth', initialTab: 'login' })}
                className="px-4 py-2 text-xs font-semibold text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setCurrentView({ view: 'auth', initialTab: 'register' })}
                className="px-4 py-2 text-xs font-semibold text-[#4A3F3A] bg-white hover:bg-[#F3EADF] border border-[#E7DDCE] rounded-xl transition-colors cursor-pointer"
              >
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Tickets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#4A3F3A]">
              Yaklaşan Atölye Biletlerim ({upcomingTickets.length})
            </h2>
            <p className="text-xs text-[#7E7067]">
              Atölye girişinde QR kodunuzu okutarak stüdyoya doğrudan katılabilirsiniz.
            </p>
          </div>

          <button
            onClick={() => setCurrentView({ view: 'courses' })}
            className="text-xs font-semibold text-[#DE997C] hover:text-[#4A3F3A] transition-colors cursor-pointer"
          >
            + Yeni Atölye Ekle
          </button>
        </div>

        {upcomingTickets.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E7DDCE] text-center space-y-3">
            <TicketIcon className="w-8 h-8 text-[#DE997C] mx-auto opacity-70" />
            <p className="text-xs text-[#7E7067]">Yaklaşan planlanmış bir atölye biletiniz bulunmuyor.</p>
            <button
              onClick={() => setCurrentView({ view: 'courses' })}
              className="px-4 py-2 bg-[#F4B59A] text-xs font-semibold rounded-xl text-[#4A3F3A] cursor-pointer"
            >
              Atölyeleri İncele
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTickets.map(({ ticket, order }) => {
              const course = getCourse(ticket.courseId);
              const session = getSession(ticket.sessionId);
              if (!course || !session) return null;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl p-5 border border-[#E7DDCE] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[11px] font-semibold text-[#DE997C] uppercase tracking-wider block">
                        Koltuk #{ticket.seatNumber} · {course.categoryLabel}
                      </span>
                      <h3 className="font-display text-base font-semibold text-[#4A3F3A] leading-tight truncate">
                        {course.title}
                      </h3>
                      <span className="text-xs text-[#7E7067] block">
                        Katılımcı: <strong>{ticket.attendeeName}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedTicketModal({ ticket, order })}
                      className="shrink-0 p-2 bg-[#FBF6EF] hover:bg-[#F3EADF] rounded-xl border border-[#E7DDCE] transition-colors text-center cursor-pointer"
                      title="Giriş QR Kodunu Görüntüle"
                    >
                      <QrCodeSvg value={ticket.ticketCode} size={48} className="p-1" />
                      <span className="text-[9px] text-[#7E7067] block font-mono mt-0.5">Büyüt</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#E7DDCE]/60 space-y-1 text-xs text-[#7E7067]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#DE997C]" />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#DE997C]" />
                      <span>{session.startTime} – {session.endTime}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E7DDCE]/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-xs font-bold text-[#4A3F3A]">
                      {ticket.ticketCode}
                    </span>
                    <button
                      onClick={() => setSelectedTicketModal({ ticket, order })}
                      className="text-xs font-semibold text-[#DE997C] hover:underline cursor-pointer"
                    >
                      Bileti Göster →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Tickets / Cancelled */}
      {pastTickets.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E7DDCE]">
          <h2 className="font-display text-lg font-semibold text-[#4A3F3A]">
            Geçmiş & İptal Edilen Biletler
          </h2>
          <div className="space-y-2.5">
            {pastTickets.map(({ ticket, order }) => {
              const course = getCourse(ticket.courseId);
              const session = getSession(ticket.sessionId);
              if (!course || !session) return null;

              return (
                <div
                  key={ticket.id}
                  className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E7DDCE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#7E7067]"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-sm text-[#4A3F3A] block">{course.title}</span>
                    <span>
                      {formatDate(session.date)} · {session.startTime} – {session.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{ticket.ticketCode}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        order.status === 'refunded'
                          ? 'bg-amber-100 text-amber-800'
                          : ticket.checkedIn
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {order.status === 'refunded'
                        ? 'İade Edildi'
                        : ticket.checkedIn
                        ? 'Katılım Sağlandı'
                        : 'Tamamlandı'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Ticket Modal */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E7DDCE] shadow-2xl p-6 space-y-5 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#7E7067] hover:text-[#4A3F3A] rounded-full hover:bg-[#F3EADF] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="font-display text-lg font-semibold text-[#4A3F3A] block">
                Niche Craft Studio Bilet
              </span>
              <span className="text-xs text-[#7E7067] block">
                Tunalı Hilmi Cd., Çankaya / Ankara
              </span>
            </div>

            <div className="flex justify-center py-2">
              <QrCodeSvg value={selectedTicketModal.ticket.ticketCode} size={160} />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-lg font-bold text-[#4A3F3A] block">
                {selectedTicketModal.ticket.ticketCode}
              </span>
              <span className="text-xs text-[#7E7067] block">
                Katılımcı: <strong>{selectedTicketModal.ticket.attendeeName}</strong>
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E7DDCE] text-xs text-[#7E7067] space-y-1 text-left">
              <div>Sipariş No: <strong className="text-[#4A3F3A]">{selectedTicketModal.order.orderNumber}</strong></div>
              <div>Durum: <strong className="text-[#8AA481]">{selectedTicketModal.ticket.checkedIn ? 'Giriş Yapıldı' : 'Aktif / Geçerli'}</strong></div>
            </div>

            <button
              onClick={() => setSelectedTicketModal(null)}
              className="w-full py-2.5 bg-[#4A3F3A] text-white text-xs font-semibold rounded-xl hover:bg-[#382F2A] transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
