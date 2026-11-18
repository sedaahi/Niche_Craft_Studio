import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  X,
  MessageCircle,
  RotateCcw,
  Send,
  ArrowRight,
  Heart,
  Lightbulb,
  Check,
  Compass
} from 'lucide-react';

interface RecommendedData {
  headline: string;
  recommendationReason: string;
  craftObjectIdea: string;
  recommendedCourseId: string;
  secondaryCourseId?: string;
  artisanTip: string;
  moodMatchScore?: number;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text?: string;
  recommendation?: RecommendedData;
  step?: 'mood' | 'experience' | 'desire';
}

const MOODS = [
  { id: 'calm', label: 'Zihnimi Dinlendirmek & Dinginlik', icon: '🧘' },
  { id: 'vibrant', label: 'Canlı Renkler & Suluboya', icon: '🎨' },
  { id: 'candle', label: 'Doğal Malzemeler & Soya Mumu', icon: '🌿' },
  { id: 'jewelry', label: 'İncelikli El İşçiliği & Takı', icon: '💍' },
  { id: 'ceramic', label: 'Çamur, Kupa & Sıcak Ev Objesi', icon: '☕' },
  { id: 'calligraphy', label: 'Kaligrafi & Odaklanma', icon: '✍️' },
];

const EXPERIENCES = [
  'İlk defa deneyeceğim (Sıfır Deneyim)',
  'Biraz deneyimim / ilgim var',
  'Fark etmez, öğrenmeye açığım',
];

const USAGE_STORAGE_KEY = 'ncs_ai_usage_v1';
const MAX_HOURLY_SUGGESTIONS = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;

function getRecentUsageTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - ONE_HOUR_MS;
    return parsed.filter((ts) => typeof ts === 'number' && ts > cutoff);
  } catch {
    return [];
  }
}

function recordUsageTimestamp(): number {
  const recent = getRecentUsageTimestamps();
  const updated = [...recent, Date.now()];
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors in private browsing
  }
  return Math.max(0, MAX_HOURLY_SUGGESTIONS - updated.length);
}

export const CraftAssistantWidget: React.FC = () => {
  const { courses, setCurrentView } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<'mood' | 'experience' | 'desire' | 'done'>('mood');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedExp, setSelectedExp] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState<number>(() =>
    Math.max(0, MAX_HOURLY_SUGGESTIONS - getRecentUsageTimestamps().length)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: 'Merhaba! 🌿 Niche Craft Studio’ya hoş geldin. Bugün zihnini dinlendirecek veya ellerinle üreteceğin sana en uygun zanaat atölyesini birlikte seçelim.',
        },
        {
          id: 'welcome-2',
          sender: 'assistant',
          text: 'Şu an ruh halin ve zihnin neye ihtiyaç duyuyor?',
          step: 'mood',
        },
      ]);
    }
  }, []);

  const handleReset = () => {
    setSelectedMood('');
    setSelectedExp('');
    setUserNote('');
    setCurrentStep('mood');
    setIsLoading(false);
    setMessages([
      {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: 'Tekrar merhaba! 🌿 Sana en uygun atölyeyi bulmak için baştan başlayalım. Şu an zihnin ve ruhun neye ihtiyaç duyuyor?',
        step: 'mood',
      },
    ]);
  };

  const handleSelectMood = (moodLabel: string) => {
    setSelectedMood(moodLabel);
    setMessages((prev) => [
      ...prev,
      { id: 'user-' + Date.now(), sender: 'user', text: moodLabel },
      {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: 'Harika bir seçim! Peki zanaat veya el sanatları konusunda deneyim durumun nasıl?',
        step: 'experience',
      },
    ]);
    setCurrentStep('experience');
  };

  const handleSelectExperience = (expLabel: string) => {
    setSelectedExp(expLabel);
    setMessages((prev) => [
      ...prev,
      { id: 'user-' + Date.now(), sender: 'user', text: expLabel },
      {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: 'Çok güzel! Aklında özel bir hayal veya not var mı? (Örn: Sevgilimle sakin bir aktivite arıyoruz, kendime kahve kupası yapmak istiyorum...) İstersen bir şeyler yazabilir ya da doğrudan öneriyi alabilirsin.',
        step: 'desire',
      },
    ]);
    setCurrentStep('desire');
  };

  const handleGenerateRecommendation = async (customNote?: string) => {
    const finalNote = customNote !== undefined ? customNote : userNote;
    if (finalNote && finalNote.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: 'user-' + Date.now(), sender: 'user', text: finalNote.trim() },
      ]);
    }

    const activeTimestamps = getRecentUsageTimestamps();
    if (activeTimestamps.length >= MAX_HOURLY_SUGGESTIONS) {
      setRemainingQuota(0);
      setCurrentStep('done');
      setMessages((prev) => [
        ...prev,
        {
          id: 'ast-limit-' + Date.now(),
          sender: 'assistant',
          text: `Saatlik ${MAX_HOURLY_SUGGESTIONS} kişisel atölye önerisi hakkına ulaştın. Adil kullanım ve kesintisiz hizmet için kısa bir süre sonra yeniden öneri alabilir, bu sırada tüm atölye seanslarımızı özgürce keşfedebilirsin. 🌿`,
        },
      ]);
      setUserNote('');
      return;
    }

    setCurrentStep('done');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood || 'Zihnimi Dinlendirmek & Dinginlik',
          experienceLevel: selectedExp || 'İlk defa deneyeceğim',
          userDesire: finalNote?.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429 || data?.rateLimited) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast-rate-' + Date.now(),
            sender: 'assistant',
            text: 'Kısa sürede çok sayıda öneri oluşturduk. Biraz soluklanıp birkaç dakika sonra tekrar deneyebilirsin. Bu arada Atölyeler & Seanslar sayfasından tüm takvimimize göz atabilirsin! 🎨',
          },
        ]);
        return;
      }

      const nextRemaining = recordUsageTimestamp();
      setRemainingQuota(nextRemaining);

      if (data && data.recommendation) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast-res-' + Date.now(),
            sender: 'assistant',
            text: 'Senin için atölye seanslarımızı inceledim ve ruh haline tam oturan harika bir deneyim seçtim:',
            recommendation: data.recommendation,
          },
        ]);
      } else {
        // Graceful fallback response without alarming error messages
        const defaultCourse = courses[0];
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast-fallback-' + Date.now(),
            sender: 'assistant',
            text: 'Senin için stüdyomuzun en sevilen ve sakinleştirici seansını özenle hazırladım:',
            recommendation: {
              headline: 'Çamurun Sakinleştirici Dokunuşu: Kendi Kupana Form Ver',
              recommendationReason: 'Toprağa dokunmak ve sıfırdan somut bir formu ellerinle yükseltmek zihnindeki tüm yorgunluğu hafifletecek.',
              craftObjectIdea: 'Mat beyaz sırlı, organik formlu kulplu kahve kupası ve minik tatlı tabağı.',
              recommendedCourseId: defaultCourse?.id || 'course-ceramic-mug',
              artisanTip: 'Kupanın kulp birleşim yerlerini bağlarken acele etme; çamurun kuruluk derecesini hissederek şekil ver.',
              moodMatchScore: 96,
            },
          },
        ]);
      }
    } catch (_err) {
      // Graceful fallback response without technical jargon or error boxes
      const defaultCourse = courses[0];
      setMessages((prev) => [
        ...prev,
        {
          id: 'ast-fallback-err-' + Date.now(),
          sender: 'assistant',
          text: 'Senin için stüdyomuzun en çok tercih edilen dingin atölyesini seçtim:',
          recommendation: {
            headline: 'Çamurun Sakinleştirici Dokunuşu: Kendi Kupana Form Ver',
            recommendationReason: 'Toprağa dokunmak ve sıfırdan somut bir formu ellerinle yükseltmek zihnindeki tüm yorgunluğu hafifletecek.',
            craftObjectIdea: 'Mat beyaz sırlı, organik formlu kulplu kahve kupası ve minik tatlı tabağı.',
            recommendedCourseId: defaultCourse?.id || 'course-ceramic-mug',
            artisanTip: 'Kupanın tabanını çok inceltmeden, ellerinin dengeli bir şekilde içten ve dıştan birbirini desteklemesini sağla.',
            moodMatchScore: 96,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
      setUserNote('');
    }
  };

  const getCourse = (id: string) => {
    return courses.find((c) => c.id === id) || courses[0];
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button (positioned above hosting badges) */}
      <div className="fixed bottom-16 right-4 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#4A3F3A] hover:bg-[#382F2A] text-white rounded-full shadow-[0_8px_30px_rgba(74,63,58,0.25)] border border-[#F4B59A]/30 transition-all duration-300 hover:scale-103 cursor-pointer"
            aria-label="Atölye Danışmanını Aç"
          >
            <div className="w-7 h-7 rounded-full bg-[#F4B59A] text-[#4A3F3A] flex items-center justify-center font-bold text-xs shadow-xs">
              <Sparkles className="w-4 h-4 text-[#4A3F3A]" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold block leading-tight">Atölye Danışmanı</span>
              <span className="text-[10px] text-[#FAF7F2]/80 block leading-tight">Bana Özel Atölyeyi Bul</span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-14 right-4 sm:bottom-16 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[540px] max-h-[80vh] bg-[#FAF7F2] rounded-3xl shadow-[0_16px_50px_rgba(74,63,58,0.22)] border border-[#E7DDCE] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#4A3F3A] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F4B59A] flex items-center justify-center text-[#4A3F3A]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white leading-tight">
                  Atölye Danışmanı
                </h3>
                <span className="text-[10px] text-[#FAF7F2]/75 block leading-tight">
                  Niche Craft Studio · Tunalı
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Sohbeti Baştan Başlat"
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Pencereyi Kapat"
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-[#4A3F3A]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Standard Message Bubble */}
                {msg.text && (
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#4A3F3A] text-white rounded-br-xs'
                        : 'bg-white border border-[#E7DDCE] text-[#4A3F3A] shadow-2xs rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Step 1: Mood Choice Chips */}
                {msg.step === 'mood' && currentStep === 'mood' && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMood(m.label)}
                        className="p-2.5 bg-white hover:bg-[#F4B59A]/20 border border-[#E7DDCE] hover:border-[#DE997C] rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <span className="text-base">{m.icon}</span>
                        <span className="text-[11px] font-medium text-[#4A3F3A] leading-tight">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Experience Choice Chips */}
                {msg.step === 'experience' && currentStep === 'experience' && (
                  <div className="mt-2.5 space-y-1.5 w-full">
                    {EXPERIENCES.map((exp) => (
                      <button
                        key={exp}
                        onClick={() => handleSelectExperience(exp)}
                        className="w-full p-2.5 bg-white hover:bg-[#F4B59A]/20 border border-[#E7DDCE] hover:border-[#DE997C] rounded-xl text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs text-[11px] font-medium text-[#4A3F3A]"
                      >
                        <span>{exp}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#DE997C]" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Recommendation Result Card */}
                {msg.recommendation && (
                  <div className="mt-2 w-full bg-white rounded-2xl border border-[#E7DDCE] p-3.5 space-y-3 shadow-xs">
                    {/* Header badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-bold">
                        %{msg.recommendation.moodMatchScore || 96} Uyum
                      </span>
                      <span className="text-[10px] text-[#7E7067]">Özel Seçim</span>
                    </div>

                    <h4 className="font-display text-sm font-bold text-[#4A3F3A] leading-snug">
                      {msg.recommendation.headline}
                    </h4>

                    <p className="text-[11px] text-[#7E7067] leading-relaxed">
                      {msg.recommendation.recommendationReason}
                    </p>

                    {/* Handcrafted Object Box */}
                    <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F4B59A]/40 space-y-1">
                      <span className="text-[10px] font-bold text-[#C87D55] uppercase tracking-wider block">
                        🎨 Ellerinle Ne Üreteceksin?
                      </span>
                      <p className="text-[11px] text-[#4A3F3A] font-medium leading-relaxed">
                        {msg.recommendation.craftObjectIdea}
                      </p>
                    </div>

                    {/* Artisan Tip Box */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] space-y-0.5">
                      <span className="text-[10px] font-bold text-[#7E7067] flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        Usta İpucu
                      </span>
                      <p className="text-[11px] text-[#7E7067] leading-relaxed">
                        {msg.recommendation.artisanTip}
                      </p>
                    </div>

                    {/* Course Card & CTA */}
                    {(() => {
                      const course = getCourse(msg.recommendation.recommendedCourseId);
                      return (
                        <div className="pt-2 border-t border-[#E7DDCE]/60 flex items-center gap-3">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-xs text-[#4A3F3A] truncate">
                              {course.title}
                            </h5>
                            <span className="text-[10px] text-[#7E7067] block">
                              {course.durationMinutes} Dk · {course.basePrice} TRY
                            </span>
                            <button
                              onClick={() => {
                                setCurrentView({ view: 'course-detail', courseId: course.id });
                                setIsOpen(false);
                              }}
                              className="mt-1 px-3 py-1.5 bg-[#F4B59A] hover:bg-[#DE997C] text-[#4A3F3A] font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Seansları İncele & Bilet Al</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Mandatory Disclaimer */}
                    <div className="pt-2 border-t border-[#E7DDCE]/50 flex items-center justify-between text-[10px] text-[#7E7067]">
                      <span className="text-[#C87D55] font-medium">
                        ✨ Yapay zekâ önerisidir, kontrol ediniz.
                      </span>
                      <button
                        onClick={handleReset}
                        className="text-[#7E7067] hover:underline cursor-pointer"
                      >
                        Yeniden Seç
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Typing Animation */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#E7DDCE] rounded-2xl text-[11px] text-[#7E7067] w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#C87D55] animate-spin" />
                <span>Atölyeler taranıyor ve önerin hazırlanıyor...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area for Step 3 (Desire) or Free Input */}
          <div className="p-3 bg-white border-t border-[#E7DDCE] shrink-0">
            {currentStep === 'desire' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGenerateRecommendation();
                      }
                    }}
                    placeholder="Özel bir arzun veya sorun varsa yaz..."
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl text-[#4A3F3A] placeholder-[#7E7067]/60 focus:bg-white focus:outline-hidden focus:border-[#C87D55]"
                    maxLength={120}
                  />
                  <button
                    onClick={() => handleGenerateRecommendation()}
                    disabled={isLoading}
                    className="px-3.5 py-2 bg-[#4A3F3A] hover:bg-[#382F2A] text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Öner ✨</span>
                  </button>
                </div>
                <div className="flex justify-between items-center px-1 text-[10px] text-[#7E7067]">
                  <span>Fikrin yoksa hemen geçebilirsin:</span>
                  <button
                    onClick={() => handleGenerateRecommendation('')}
                    disabled={isLoading}
                    className="text-[#C87D55] font-semibold hover:underline cursor-pointer"
                  >
                    Atla & Hemen Öner →
                  </button>
                </div>
              </div>
            ) : currentStep === 'done' ? (
              <div className="space-y-1.5">
                <button
                  onClick={handleReset}
                  disabled={remainingQuota <= 0}
                  className="w-full py-2 bg-[#FAF7F2] hover:bg-[#F3EADF] disabled:opacity-50 text-[#4A3F3A] text-xs font-medium rounded-xl border border-[#E7DDCE] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {remainingQuota > 0
                      ? 'Farklı Bir Ruh Hali İçin Yeniden Başlat'
                      : 'Saatlik Öneri Limitine Ulaşıldı'}
                  </span>
                </button>
                <div className="text-center text-[10px] text-[#7E7067]">
                  Saatlik danışman kullanım hakkı: {remainingQuota}/{MAX_HOURLY_SUGGESTIONS}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] text-[#7E7067] py-1 px-1">
                <span>Seçeneklerden birini işaretleyerek devam et.</span>
                <span className="font-medium text-[#C87D55]">
                  Hak: {remainingQuota}/{MAX_HOURLY_SUGGESTIONS}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
