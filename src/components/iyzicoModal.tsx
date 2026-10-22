import React, { useState } from 'react';
import { Shield, Lock, CreditCard, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface IyzicoModalProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  itemDescription: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export const IyzicoModal: React.FC<IyzicoModalProps> = ({
  amount,
  customerName,
  customerEmail,
  itemDescription,
  onSuccess,
  onCancel,
}) => {
  const [cardNumber, setCardNumber] = useState('5890 0400 0000 0016');
  const [cardHolder, setCardHolder] = useState(customerName || 'SEDA AHI');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [step, setStep] = useState<'card' | '3d-secure' | 'processing'>('card');
  const [otpCode, setOtpCode] = useState('849201');
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fillTestCard = () => {
    setCardNumber('5890 0400 0000 0016');
    setCardHolder(customerName.toUpperCase() || 'SEDA AHI');
    setExpiry('12/28');
    setCvv('123');
    setErrorMessage('');
  };

  const handleProceedTo3D = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      setErrorMessage('Lütfen tüm kart alanlarını doldurunuz.');
      return;
    }
    setStep('3d-secure');
    setOtpInput('849201'); // Pre-fill for frictionless testing
  };

  const handleConfirm3D = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => {
      const generatedPayId = `iyz_sandbox_${Date.now()}`;
      onSuccess(generatedPayId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E7DDCE] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#E7DDCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DE997C]/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#DE997C]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#4A3F3A] uppercase tracking-wider block">
                iyzico Güvenli Ödeme
              </span>
              <span className="text-[11px] text-[#7E7067] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#A8BFA0]" /> 256-Bit SSL Korumalı Sandbox
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-[#7E7067] hover:text-[#4A3F3A] hover:bg-[#F3EADF] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'card' && (
            <form onSubmit={handleProceedTo3D} className="space-y-4">
              {/* Order quick summary */}
              <div className="bg-[#FBF6EF] rounded-2xl p-4 border border-[#E7DDCE] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7E7067] block">Ödenecek Tutar</span>
                  <span className="font-display text-2xl font-bold text-[#4A3F3A]">
                    {amount.toLocaleString('tr-TR')} TRY
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#7E7067] block">Açıklama</span>
                  <span className="text-xs font-semibold text-[#4A3F3A] max-w-[180px] truncate block">
                    {itemDescription}
                  </span>
                </div>
              </div>

              {/* Sandbox fast fill preset */}
              <div className="flex items-center justify-between bg-[#F3EADF]/60 p-2.5 rounded-xl border border-[#E7DDCE]/60">
                <span className="text-xs text-[#7E7067]">Test için hızlı doldur:</span>
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="px-2.5 py-1 text-xs font-semibold bg-white text-[#DE997C] hover:bg-[#DE997C] hover:text-white rounded-lg border border-[#DE997C]/30 transition-colors shadow-2xs cursor-pointer"
                >
                  Örnek iyzico Kartı Seç
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Card Inputs */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">Kart Numarası</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="5890 0400 0000 0016"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                  <CreditCard className="w-4 h-4 text-[#7E7067] absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="AD SOYAD"
                  className="w-full px-3.5 py-2.5 text-sm uppercase rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">Son Kullanma (AA/YY)</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3F3A] mb-1">CVV / Güvenlik Kodu</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#DE997C] hover:bg-[#DE997C]/90 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>3D Secure ile {amount.toLocaleString('tr-TR')} TRY Öde</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === '3d-secure' && (
            <form onSubmit={handleConfirm3D} className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#A8BFA0]/20 flex items-center justify-center mx-auto text-[#8AA481]">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#4A3F3A]">
                  Bankanızın 3D Secure Doğrulaması
                </h3>
                <p className="text-xs text-[#7E7067] max-w-sm mx-auto">
                  Güvenliğiniz için kayıtlı cep telefonunuza 6 haneli bir SMS doğrulama kodu gönderildi.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E7DDCE] text-center space-y-1">
                <span className="text-xs text-[#7E7067]">Simüle Edilen SMS Kodu:</span>
                <span className="font-mono text-lg font-bold tracking-widest text-[#4A3F3A] block">
                  {otpCode}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3F3A] mb-1 text-center">
                  Doğrulama Kodunu Giriniz
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-48 mx-auto block px-3 py-2 text-center text-xl font-mono tracking-widest rounded-xl bg-white border border-[#E7DDCE] text-[#4A3F3A] focus:outline-hidden focus:ring-2 focus:ring-[#F4B59A]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('card')}
                  className="w-1/3 py-2.5 text-xs font-medium text-[#7E7067] hover:bg-[#F3EADF] rounded-xl transition-colors cursor-pointer"
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#A8BFA0] hover:bg-[#8AA481] text-[#4A3F3A] font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ödemeyi Onayla
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#DE997C] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <span className="font-display text-lg font-semibold text-[#4A3F3A] block">
                  Ödemeniz İşleniyor...
                </span>
                <span className="text-xs text-[#7E7067] mt-1 block">
                  iyzico güvenli ağ geçidi üzerinden biletleriniz oluşturuluyor.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
