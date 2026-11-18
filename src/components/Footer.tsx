import React from 'react';
import { useStore } from '../context/StoreContext';
import { STUDIO_INFO } from '../data/initialData';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView } = useStore();

  return (
    <footer className="bg-[#F3EADF] border-t border-[#E7DDCE] text-[#7E7067] text-sm pt-14 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Vibe */}
          <div className="space-y-3.5 md:col-span-1">
            <span className="font-display text-xl font-semibold text-[#4A3F3A] block">Niche Craft Studio</span>
            <p className="text-xs leading-relaxed text-[#7E7067]">
              Ankara Tunalı’da seramikten resme, takıdan kaligrafi ve lif sanatına tek seferlik deneyim atölyeleri. Tüm malzemeler dahil, sakin bir üretim alanı.
            </p>
            <div className="text-xs pt-1 text-[#4A3F3A] font-medium">
              Kuğulu Park’a 3 dk · Avlu içi
            </div>
          </div>

          {/* Col 2: Hızlı Bağlantılar */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#4A3F3A] uppercase tracking-wider block">Atölyeler</span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView({ view: 'courses', category: 'ceramic' })}
                  className="hover:text-[#4A3F3A] transition-colors cursor-pointer"
                >
                  Seramik & Çömlek
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView({ view: 'courses', category: 'painting' })}
                  className="hover:text-[#4A3F3A] transition-colors cursor-pointer"
                >
                  Botanik Suluboya
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView({ view: 'courses', category: 'jewelry' })}
                  className="hover:text-[#4A3F3A] transition-colors cursor-pointer"
                >
                  Reçine Takı Tasarımı
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView({ view: 'courses', category: 'textile' })}
                  className="hover:text-[#4A3F3A] transition-colors cursor-pointer"
                >
                  Punch Nakışı & Lif
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView({ view: 'courses', category: 'calligraphy' })}
                  className="hover:text-[#4A3F3A] transition-colors cursor-pointer"
                >
                  Modern Kaligrafi
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: İletişim & Lokasyon */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#4A3F3A] uppercase tracking-wider block">İletişim & Konum</span>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#DE997C] shrink-0 mt-0.5" />
                <span>{STUDIO_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#DE997C] shrink-0" />
                <span>{STUDIO_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#DE997C] shrink-0" />
                <span>{STUDIO_INFO.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#DE997C] shrink-0 mt-0.5" />
                <span>{STUDIO_INFO.hours}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Politikalar */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#4A3F3A] uppercase tracking-wider block">Politikalar</span>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[#4A3F3A] font-medium block">48 Saat İptal/İade Garantisi</span>
                <span className="text-[11px] text-[#7E7067]">Seanstan 48 saat öncesine kadar kesintisiz iade hakkı.</span>
              </li>
              <li>
                <span className="text-[#4A3F3A] font-medium block">Tüm Malzemeler Dahil</span>
                <span className="text-[11px] text-[#7E7067]">Atölyeye sadece kendinizi ve merakınızı getirmeniz yeterli.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E7DDCE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} Niche Craft Studio. Tüm hakları saklıdır. Tunalı / Çankaya, Ankara.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView({ view: 'about' })}
              className="hover:text-[#4A3F3A] transition-colors cursor-pointer"
            >
              Açık Atölye Saatleri
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
