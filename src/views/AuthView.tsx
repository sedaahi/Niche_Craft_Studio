import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ViewState } from '../types';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Ticket,
} from 'lucide-react';

interface AuthViewProps {
  initialTab?: 'login' | 'register';
  returnTo?: ViewState;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialTab = 'login',
  returnTo,
}) => {
  const { loginUser, registerUser, loginWithGoogle, setCurrentView } = useStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Forgot password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setFeedback(null);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        if (returnTo) {
          setCurrentView(returnTo);
        } else {
          setCurrentView({ view: 'account' });
        }
      }, 700);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = loginUser(loginIdentifier, loginPassword);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        if (returnTo) {
          setCurrentView(returnTo);
        } else {
          setCurrentView({ view: 'account' });
        }
      }, 700);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (registerPassword !== registerPasswordConfirm) {
      setFeedback({ type: 'error', message: 'Şifreleriniz birbiriyle eşleşmiyor.' });
      return;
    }

    const res = registerUser({
      name: registerName,
      username: registerUsername,
      email: registerEmail,
      phone: registerPhone,
      password: registerPassword,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        if (returnTo) {
          setCurrentView(returnTo);
        } else {
          setCurrentView({ view: 'account' });
        }
      }, 700);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const fillDemoAccount = () => {
    setLoginIdentifier('ahiseda@gmail.com');
    setLoginPassword('password123');
    setFeedback(null);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E7DDCE] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Story & Studio Atmosphere (5 cols) */}
        <div className="lg:col-span-5 bg-[#F3EADF] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E7DDCE] relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#DE997C] block">
                Niche Craft Studio
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4A3F3A] mt-1 leading-snug">
                Yaratıcı yolculuğunuza adım atın.
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#7E7067] leading-relaxed">
              Tunalı Hilmi’deki samimi stüdyomuzda seramikten suluboyaya tüm atölye biletleriniz tek hesapta güvenle saklanır.
            </p>

            <div className="space-y-3.5 pt-2 text-xs text-[#4A3F3A]">
              <div className="flex items-start gap-2.5">
                <Ticket className="w-4 h-4 text-[#DE997C] shrink-0 mt-0.5" />
                <span>
                  <strong>QR Biletleriniz Cebinizde:</strong> Seans kapısında anında karekod okutarak giriş yapın.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#DE997C] shrink-0 mt-0.5" />
                <span>
                  <strong>Tek Tıkla Rezervasyon:</strong> Katılımcı bilgilerinizi her seferinde yeniden girmeyin.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#8AA481] shrink-0 mt-0.5" />
                <span>
                  <strong>48 Saat Öncesine İade:</strong> Planınız değişirse seans saatinize kadar kesintisiz iade hakkı.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-[#7E7067] relative z-10 border-t border-[#E7DDCE]/70">
            Tunalı Hilmi Cd. No: 48/B, Çankaya / Ankara
          </div>
        </div>

        {/* Right Side: Tab Switcher & Forms (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white flex flex-col justify-center">
          {/* Tabs: Giriş Yap / Kayıt Ol */}
          <div className="flex items-center gap-2 p-1.5 bg-[#F3EADF] rounded-2xl max-w-xs mb-8 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFeedback(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#4A3F3A] shadow-xs'
                  : 'text-[#7E7067] hover:text-[#4A3F3A]'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFeedback(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#4A3F3A] shadow-xs'
                  : 'text-[#7E7067] hover:text-[#4A3F3A]'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`mb-6 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: GİRİŞ YAP (LOGIN) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Google Fast Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF7F2] text-[#4A3F3A] font-medium text-xs sm:text-sm rounded-xl border border-[#E7DDCE] shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Google ile bağlanılıyor...' : 'Google ile Hızlı Giriş Yap'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-[#E7DDCE]" />
                <span className="shrink mx-3 text-[11px] text-[#7E7067] uppercase font-semibold">veya e-posta ile</span>
                <div className="grow border-t border-[#E7DDCE]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3F3A] mb-1.5">
                  E-posta veya Kullanıcı Adı
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="ornek@email.com veya sedahi"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <Mail className="w-4 h-4 text-[#7E7067] absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#4A3F3A]">Şifre</label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] text-[#DE997C] hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <Lock className="w-4 h-4 text-[#7E7067] absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-[#7E7067] hover:text-[#4A3F3A] cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#7E7067]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#DE997C] focus:ring-[#F4B59A]"
                  />
                  <span>Beni hatırla</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Fast Test / Demo Credentials button */}
              <div className="pt-3 border-t border-[#E7DDCE]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7E7067]">
                <span>Hızlı deneme için:</span>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EADF] text-[#4A3F3A] font-medium rounded-lg border border-[#E7DDCE] transition-colors cursor-pointer"
                >
                  Örnek Hesapla Doldur (Seda Ahi)
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-[#7E7067]">
                Henüz hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setFeedback(null);
                  }}
                  className="text-[#DE997C] font-semibold hover:underline cursor-pointer"
                >
                  Hemen Kayıt Olun
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: KAYIT OL (REGISTER) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Google Fast Register Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF7F2] text-[#4A3F3A] font-medium text-xs sm:text-sm rounded-xl border border-[#E7DDCE] shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Google ile bağlanılıyor...' : 'Google ile Hızlı Kayıt Ol'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-[#E7DDCE]" />
                <span className="shrink mx-3 text-[11px] text-[#7E7067] uppercase font-semibold">veya bilgilerinizle kayıt olun</span>
                <div className="grow border-t border-[#E7DDCE]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      placeholder="zeynep_k"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                    />
                    <UserIcon className="w-3.5 h-3.5 text-[#7E7067] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Zeynep Kaya"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">
                  E-posta Adresi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="zeynep@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <Mail className="w-3.5 h-3.5 text-[#7E7067] absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="0555 123 4567"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <Phone className="w-3.5 h-3.5 text-[#7E7067] absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-[#7E7067] block mt-0.5">
                  Atölye ve seans hatırlatma SMS'leri için kullanılır.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="En az 4 karakter"
                      className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                    />
                    <Lock className="w-3 h-3 text-[#7E7067] absolute left-2.5 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2.5 top-2.5 text-[#7E7067] hover:text-[#4A3F3A] cursor-pointer"
                    >
                      {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">
                    Şifre Tekrarı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={registerPasswordConfirm}
                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    placeholder="Tekrar yazınız"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Hesabımı Oluştur</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-[#7E7067]">
                Zaten bir hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setFeedback(null);
                  }}
                  className="text-[#DE997C] font-semibold hover:underline cursor-pointer"
                >
                  Giriş Yapın
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-[#E7DDCE] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">
                Şifre Sıfırlama
              </h3>
              <p className="text-xs text-[#7E7067]">
                Kayıtlı e-posta adresinizi giriniz. Şifre yenileme bağlantısı e-postanıza gönderilecektir.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 space-y-2">
                <div>✓ <strong>{forgotEmail}</strong> adresine şifre sıfırlama talimatı gönderildi.</div>
                <div className="text-[11px] text-[#7E7067]">Demo hesap için şifre: <strong>password123</strong></div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotSent(false);
                  }}
                  className="w-full mt-2 py-2 bg-[#4A3F3A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="adiniz@example.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3F3A]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2 text-xs font-medium text-[#7E7067] bg-[#F3EADF] rounded-xl hover:bg-[#EBE0D2] cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold text-[#4A3F3A] bg-[#F4B59A] hover:bg-[#DE997C] rounded-xl cursor-pointer"
                  >
                    Bağlantı Gönder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
