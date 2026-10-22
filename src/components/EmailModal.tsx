import React from 'react';
import { Order, Course, Session } from '../types';
import { QrCodeSvg } from './QrCodeSvg';
import { STUDIO_INFO } from '../data/initialData';
import { Mail, CheckCircle2, MapPin, Calendar, Clock, X, Printer } from 'lucide-react';

interface EmailModalProps {
  order: Order;
  course: Course;
  session: Session;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ order, course, session, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(session.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E7DDCE] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Email Client Envelope Header */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#E7DDCE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#A8BFA0]/20 flex items-center justify-center text-[#8AA481]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#4A3F3A] block">
                Gelen E-posta Simülatörü
              </span>
              <span className="text-[11px] text-[#7E7067]">
                Kime: <strong className="text-[#4A3F3A]">{order.customerEmail}</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#F3EADF] rounded-lg transition-colors cursor-pointer"
              title="Yazdır / PDF Kaydet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#F3EADF] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white text-[#4A3F3A]">
          {/* Studio Brand */}
          <div className="border-b border-[#E7DDCE] pb-5 text-center">
            <span className="font-display text-xl font-semibold text-[#4A3F3A]">Niche Craft Studio</span>
            <span className="text-xs text-[#7E7067] block mt-0.5">Tunalı / Çankaya, Ankara</span>
          </div>

          {/* Success Title */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#A8BFA0]/20 text-[#8AA481] mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl font-bold text-[#4A3F3A]">
              Atölye Biletiniz Hazır!
            </h2>
            <p className="text-xs text-[#7E7067] max-w-md mx-auto">
              Merhaba <strong>{order.customerName}</strong>, rezervasyonunuz onaylandı. Atölye günü kapıda bu e-postadaki QR kodu veya bilet numarasını göstermeniz yeterlidir.
            </p>
          </div>

          {/* Session Details Box */}
          <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E7DDCE] space-y-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-[#7E7067] block">Atölye</span>
                <span className="font-semibold text-sm text-[#4A3F3A] block">{course.title}</span>
                <span className="text-xs text-[#7E7067]">Eğitmen: {course.instructor.name}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-[#7E7067] block">Sipariş No</span>
                <span className="font-mono text-xs font-semibold text-[#4A3F3A]">{order.orderNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E7DDCE]/60 text-xs text-[#7E7067]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#DE997C]" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#DE997C]" />
                <span>{session.startTime} – {session.endTime}</span>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-[#DE997C] shrink-0 mt-0.5" />
                <span>{STUDIO_INFO.address} ({STUDIO_INFO.landmark})</span>
              </div>
            </div>
          </div>

          {/* Individual Tickets & QR Codes */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#4A3F3A] uppercase tracking-wider block">
              Giriş Biletleriniz ({order.tickets.length} Adet)
            </span>

            <div className="space-y-4">
              {order.tickets.map((t, idx) => (
                <div
                  key={t.id}
                  className="bg-[#FBF6EF] rounded-2xl p-4 border border-[#E7DDCE] flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs text-[#7E7067]">Bilet #{idx + 1}</span>
                    <span className="font-mono text-base font-bold text-[#4A3F3A] block">
                      {t.ticketCode}
                    </span>
                    <span className="text-xs text-[#7E7067] block">
                      Katılımcı: <strong>{t.attendeeName}</strong> · Koltuk #{t.seatNumber}
                    </span>
                  </div>

                  <div className="shrink-0 flex flex-col items-center">
                    <QrCodeSvg value={t.ticketCode} size={96} />
                    <span className="text-[10px] text-[#7E7067] mt-1 font-mono">Kapıda Okutunuz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refund policy note */}
          <div className="p-3.5 rounded-xl bg-[#F3EADF]/60 text-[11px] text-[#7E7067] leading-relaxed">
            <strong>İptal & İade:</strong> Seanstan 48 saat öncesine kadar kesintisiz iade hakkınız bulunmaktadır. Tüm gerekli araç ve malzemeler stüdyomuz tarafından sağlanır; rahat kıyafetlerle gelmeniz önerilir.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#E7DDCE] flex items-center justify-between">
          <span className="text-xs text-[#7E7067]">E-posta otomatik iletilmiştir.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#4A3F3A] text-white text-xs font-medium rounded-xl hover:bg-[#382F2A] transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
