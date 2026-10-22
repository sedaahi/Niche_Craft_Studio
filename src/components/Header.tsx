import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Shield, Ticket, Menu, X, Clock, LogOut, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    logoutUser,
    isAdminLoggedIn,
    activeHold,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Hold timer seconds remaining calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  React.useEffect(() => {
    if (!activeHold) {
      setSecondsRemaining(0);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.floor((activeHold.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeHold]);

  const handleNav = (viewState: any) => {
    setCurrentView(viewState);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* 10-Minute Reservation Hold Alert Banner if active */}
      {activeHold && secondsRemaining > 0 && (
        <div className="bg-[#DE997C] text-[#4A3F3A] px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between border-b border-[#4A3F3A]/10">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-[#4A3F3A]" />
              <span>
                Kontenjanınız <strong>{formatTimer(secondsRemaining)}</strong> boyunca geçici olarak rezerve edildi.
              </span>
            </div>
            <button
              onClick={() => setCurrentView({ view: 'checkout', sessionId: activeHold.sessionId })}
              className="underline font-semibold hover:opacity-80 transition-opacity ml-2 shrink-0 cursor-pointer"
            >
              Ödemeyi Tamamla →
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#FBF6EF]/90 backdrop-blur-md border-b border-[#E7DDCE] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title wordmark */}
          <button
            onClick={() => handleNav({ view: 'home' })}
            className="text-left font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#4A3F3A] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            Niche Craft Studio
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#7E7067]">
            <button
              onClick={() => handleNav({ view: 'home' })}
              className={`hover:text-[#4A3F3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView.view === 'home' ? 'text-[#4A3F3A] font-semibold' : ''
              }`}
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => handleNav({ view: 'courses' })}
              className={`hover:text-[#4A3F3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView.view === 'courses' ? 'text-[#4A3F3A] font-semibold' : ''
              }`}
            >
              Atölyeler & Seanslar
            </button>
            <button
              onClick={() => handleNav({ view: 'about' })}
              className={`hover:text-[#4A3F3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView.view === 'about' ? 'text-[#4A3F3A] font-semibold' : ''
              }`}
            >
              Stüdyo & Tunalı Adres
            </button>
            <button
              onClick={() => handleNav({ view: 'account' })}
              className={`hover:text-[#4A3F3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView.view === 'account' ? 'text-[#4A3F3A] font-semibold' : ''
              }`}
            >
              Biletlerim
            </button>
            {isAdminLoggedIn && (
              <button
                onClick={() => handleNav({ view: 'admin' })}
                className="text-[#DE997C] font-semibold flex items-center gap-1.5 hover:text-[#4A3F3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Yönetim Paneli
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#4A3F3A] bg-[#F3EADF] hover:bg-[#EBE0D2] rounded-xl border border-[#E7DDCE] transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#DE997C]/30 flex items-center justify-center text-[10px] font-bold text-[#4A3F3A]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[110px] truncate">{currentUser.name}</span>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E7DDCE] py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-[#E7DDCE]/60">
                      <span className="font-semibold text-[#4A3F3A] block truncate">{currentUser.name}</span>
                      <span className="text-[11px] text-[#7E7067] block truncate">{currentUser.email}</span>
                    </div>
                    <button
                      onClick={() => handleNav({ view: 'account' })}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#FAF7F2] text-[#4A3F3A] flex items-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#DE997C]" />
                      <span>Biletlerim & Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        logoutUser();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-700 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNav({ view: 'auth', initialTab: 'login' })}
                  className="px-3 py-1.5 text-xs font-medium text-[#7E7067] hover:text-[#4A3F3A] transition-colors cursor-pointer"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => handleNav({ view: 'auth', initialTab: 'register' })}
                  className="px-3 py-1.5 text-xs font-medium text-[#4A3F3A] bg-[#F3EADF] hover:bg-[#EBE0D2] rounded-xl border border-[#E7DDCE] transition-colors cursor-pointer"
                >
                  Kayıt Ol
                </button>
              </div>
            )}

            <button
              onClick={() => handleNav({ view: 'courses' })}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Atölye Seç
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#4A3F3A] hover:bg-[#F3EADF] rounded-lg transition-colors cursor-pointer"
              aria-label="Menüyü aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FBF6EF] border-b border-[#E7DDCE] px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <button
              onClick={() => handleNav({ view: 'home' })}
              className="block w-full text-left py-2 text-sm font-medium text-[#4A3F3A]"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => handleNav({ view: 'courses' })}
              className="block w-full text-left py-2 text-sm font-medium text-[#4A3F3A]"
            >
              Atölyeler & Seanslar
            </button>
            <button
              onClick={() => handleNav({ view: 'about' })}
              className="block w-full text-left py-2 text-sm font-medium text-[#4A3F3A]"
            >
              Stüdyo & Tunalı Adres
            </button>
            <button
              onClick={() => handleNav({ view: 'account' })}
              className="block w-full text-left py-2 text-sm font-medium text-[#4A3F3A]"
            >
              Biletlerim & Profil
            </button>
            {isAdminLoggedIn && (
              <button
                onClick={() => handleNav({ view: 'admin' })}
                className="block w-full text-left py-2 text-sm font-medium text-[#DE997C]"
              >
                Yönetici Paneli (Admin)
              </button>
            )}

            <div className="pt-3 border-t border-[#E7DDCE]">
              {currentUser ? (
                <div className="flex items-center justify-between py-1 text-xs text-[#7E7067]">
                  <span>Giriş yapıldı: <strong>{currentUser.name}</strong></span>
                  <button
                    onClick={() => {
                      logoutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-700 font-semibold hover:underline cursor-pointer"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleNav({ view: 'auth', initialTab: 'login' })}
                    className="w-full text-center py-2.5 text-xs font-semibold bg-white border border-[#E7DDCE] rounded-xl text-[#4A3F3A]"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => handleNav({ view: 'auth', initialTab: 'register' })}
                    className="w-full text-center py-2.5 text-xs font-semibold bg-[#F4B59A] rounded-xl text-[#4A3F3A]"
                  >
                    Kayıt Ol
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
