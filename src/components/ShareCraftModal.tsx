import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { CraftPost, CourseCategory } from '../types';
import {
  X,
  Star,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  ImageIcon,
  Trash2,
} from 'lucide-react';
import {
  workshopCeramicImg,
  workshopWatercolorImg,
  workshopJewelryImg,
  workshopPunchNeedleImg,
  heroCraftStudioImg,
} from '../data/initialData';

interface ShareCraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWorkshopId?: string;
  initialWorkshopTitle?: string;
  editPost?: CraftPost | null;
  onSuccess?: (msg: string) => void;
}

const PRESET_PHOTOS = [
  { label: 'Seramik Kupa & Tabak', url: workshopCeramicImg },
  { label: 'Botanik Suluboya Tablo', url: workshopWatercolorImg },
  { label: 'El Yapımı Takı & Kolye', url: workshopJewelryImg },
  { label: 'Punch Needle & Dokuma', url: workshopPunchNeedleImg },
  { label: 'Stüdyo Masası & Üretim Anı', url: heroCraftStudioImg },
];

export const ShareCraftModal: React.FC<ShareCraftModalProps> = ({
  isOpen,
  onClose,
  initialWorkshopId,
  initialWorkshopTitle,
  editPost,
  onSuccess,
}) => {
  const { courses, currentUser, createPost, updatePost, setCurrentView } = useStore();

  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(
    editPost?.workshopId || initialWorkshopId || courses[0]?.id || ''
  );
  const [title, setTitle] = useState(editPost?.title || '');
  const [selectedImage, setSelectedImage] = useState<string>(
    editPost?.imageUrl || workshopCeramicImg
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rating, setRating] = useState<number>(editPost?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [description, setDescription] = useState(editPost?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editPost) {
      setSelectedWorkshopId(editPost.workshopId || courses[0]?.id || '');
      setTitle(editPost.title);
      setSelectedImage(editPost.imageUrl || workshopCeramicImg);
      setRating(editPost.rating || 5);
      setDescription(editPost.description);
      setUploadedFileName(null);
    } else if (initialWorkshopId) {
      setSelectedWorkshopId(initialWorkshopId);
      const matched = courses.find((c) => c.id === initialWorkshopId);
      if (matched && matched.imageUrl) {
        setSelectedImage(matched.imageUrl);
      }
      setUploadedFileName(null);
    }
  }, [editPost, initialWorkshopId, courses]);

  if (!isOpen) return null;

  const selectedCourse = courses.find((c) => c.id === selectedWorkshopId) || courses[0];

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Görsel boyutu 10MB\'tan küçük olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setUploadedFileName(file.name);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (asDraft = false) => {
    if (!currentUser) {
      onClose();
      setCurrentView({ view: 'auth', initialTab: 'login' });
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Lütfen yaptığınız esere bir isim verin (Örn: "El Yapımı Çömlek Kupa").');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Lütfen deneyiminiz ve atölye hakkında en az 1-2 cümle yorum yazın (en az 15 karakter).');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const imageUrl = selectedImage;
    const category: CourseCategory = selectedCourse ? selectedCourse.category : 'ceramic';
    const categoryLabel = selectedCourse ? selectedCourse.categoryLabel : 'Seramik';
    const workshopTitle = selectedCourse ? selectedCourse.title : (initialWorkshopTitle || 'Niche Craft Atölyesi');

    try {
      if (editPost) {
        const res = await updatePost(
          editPost.id,
          {
            title: title.trim(),
            category,
            categoryLabel,
            workshopId: selectedWorkshopId,
            workshopTitle,
            imageUrl,
            rating,
            description: description.trim(),
          },
          asDraft
        );
        setIsSubmitting(false);
        if (res.success) {
          onSuccess?.(res.message);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await createPost(
          {
            title: title.trim(),
            category,
            categoryLabel,
            workshopId: selectedWorkshopId,
            workshopTitle,
            imageUrl,
            rating,
            description: description.trim(),
            durationMinutes: selectedCourse?.durationMinutes || 90,
            materials: selectedCourse?.includedItems || ['Atölye Malzemeleri', 'Stüdyo Ekipmanı'],
            steps: ['Tunalı stüdyosunda eğitmen eşliğinde şekillendirildi', 'Fırınlama & cilalama tamamlandı'],
          },
          asDraft
        );
        setIsSubmitting(false);
        if (res.success) {
          onSuccess?.(res.message);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#4A3F3A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E7DDCE] shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 bg-[#FAF7F2] border-b border-[#E7DDCE] flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4B59A]/30 text-[#DE997C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katılımcı Deneyim & Eser Paylaşımı</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4A3F3A]">
              {editPost ? 'Eser Paylaşımını Düzenle' : 'Ürettiğin Eseri & Deneyimi Paylaş'}
            </h2>
            <p className="text-xs text-[#7E7067] leading-relaxed">
              Atölyede ellerinle ortaya çıkardığın eseri fotoğrafla, deneyimini puanla ve kurs almayı düşünenlere ilham ver.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7E7067] hover:text-[#4A3F3A] hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <span className="font-bold">Hata:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Atölye Seçimi */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#4A3F3A] uppercase tracking-wider text-[11px]">
              Katıldığın / İlgili Atölye <span className="text-[#DE997C]">*</span>
            </label>
            <select
              value={selectedWorkshopId}
              onChange={(e) => {
                setSelectedWorkshopId(e.target.value);
                const match = courses.find((c) => c.id === e.target.value);
                if (match?.imageUrl && !uploadedFileName) setSelectedImage(match.imageUrl);
              }}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-xs text-[#4A3F3A] focus:outline-none focus:border-[#DE997C]"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Eser Adı */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#4A3F3A] uppercase tracking-wider text-[11px]">
              Ne Ürettin? (Eserine Bir İsim Ver) <span className="text-[#DE997C]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Kulplu Toprak Espresso Fincanı & Mat Sır"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-xs text-[#4A3F3A] focus:outline-none focus:border-[#DE997C]"
            />
          </div>

          {/* 3. Eser Fotoğrafı (Sürükle-Bırak & Bilgisayardan Yükleme) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-[#4A3F3A] uppercase tracking-wider text-[11px]">
                Eserinin Fotoğrafı <span className="text-[#DE997C]">*</span>
              </label>
              <span className="text-[10px] text-[#7E7067]">Bilgisayarınızdan yükleyin veya örnek kare seçin</span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#DE997C] bg-[#DE997C]/10 scale-99'
                  : uploadedFileName
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-[#E7DDCE] bg-[#FAF7F2] hover:bg-[#F3EADF] hover:border-[#DE997C]/60'
              }`}
            >
              {uploadedFileName ? (
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={selectedImage}
                    alt="Yüklenen Eser"
                    className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0 bg-white"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Bilgisayardan Yüklendi
                      </span>
                    </div>
                    <p className="font-semibold text-xs text-[#4A3F3A] truncate mt-0.5">
                      {uploadedFileName}
                    </p>
                    <span className="text-[10px] text-[#7E7067]">
                      Fotoğrafı değiştirmek için buraya tıklayın veya yeni dosya sürükleyin
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFileName(null);
                      setSelectedImage(workshopCeramicImg);
                    }}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Yüklenen Görseli Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-white text-[#DE997C] flex items-center justify-center shadow-xs border border-[#E7DDCE]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#4A3F3A] block">
                      Bilgisayarınızdan fotoğraf sürükleyip bırakın veya seçin
                    </span>
                    <span className="text-[10px] text-[#7E7067]">
                      PNG, JPG veya WEBP (Maksimum 10MB)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Presets Selection */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-[#7E7067] font-medium block">
                veya stüdyo örneklerinden hızlıca seçin:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_PHOTOS.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(photo.url);
                      setUploadedFileName(null);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                      selectedImage === photo.url && !uploadedFileName
                        ? 'border-[#DE997C] ring-2 ring-[#DE997C]/30 scale-98'
                        : 'border-[#E7DDCE] hover:border-[#DE997C]/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                      <span className="text-[9px] text-white font-medium truncate leading-tight">
                        {photo.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Deneyim Puanı (1-5 Yıldız) */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E7DDCE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#4A3F3A] text-xs">
                Atölye Deneyiminizi Puanlayın
              </span>
              <span className="text-xs font-bold text-[#DE997C]">
                {rating} / 5 Yıldız
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[11px] text-[#7E7067] ml-2">
                {rating === 5 && 'Harika bir deneyimdi!'}
                {rating === 4 && 'Çok keyifliydi.'}
                {rating === 3 && 'Ortalama bir deneyim.'}
                {rating <= 2 && 'Geliştirilebilir.'}
              </span>
            </div>
          </div>

          {/* 5. Deneyim & Katılımcı Yorumu */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#4A3F3A] uppercase tracking-wider text-[11px]">
              Deneyiminiz & Yorumunuz <span className="text-[#DE997C]">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Atölye ortamı, eğitmenin ilgisi, ellerinizle üretmenin verdiği his ve ortaya çıkardığınız eser hakkında düşüncelerinizi paylaşın..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-xs text-[#4A3F3A] focus:outline-none focus:border-[#DE997C] leading-relaxed"
            />
          </div>

          {/* Privacy & Moderation Notice */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-[11px] text-emerald-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Güvenli & Doğrulanmış Katılımcı Alanı:</strong>
              <p className="mt-0.5 text-emerald-800">
                Gönderdiğiniz eser ve deneyim notunuz stüdyo yöneticisi tarafından incelendikten sonra Topluluk Vitrininde ve kurs arayanlar için Ana Sayfa ilham bölümünde yayınlanır. Adınız gizlilik gereği <em>"{currentUser?.name.split(' ')[0]} {currentUser?.name.split(' ').slice(1).join(' ').charAt(0)}."</em> şeklinde gösterilir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#FAF7F2] border-t border-[#E7DDCE] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-stone-100 border border-[#E7DDCE] rounded-xl text-xs font-medium text-[#4A3F3A] transition-colors cursor-pointer"
          >
            Vazgeç
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#F3EADF] hover:bg-[#E7DDCE] text-xs font-semibold text-[#4A3F3A] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Taslak Kaydet
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#F4B59A] hover:bg-[#DE997C] text-xs font-bold text-[#4A3F3A] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'İletiliyor...' : 'Onaya Gönder'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
