import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  GraduationCap,
  CookingPot,
  Plus,
  X,
  Upload,
  Lock,
  Trash2,
  Loader2,
} from 'lucide-react';

// ────────────────────────── Types ──────────────────────────

interface MenuItem {
  name: string;
  description: string;
}

// ────────────────────────── Allergens List ──────────────────────────

const ALL_ALLERGENS = [
  'Gluten', 'Crustacés', 'Œufs',
  'Poisson', 'Arachides', 'Soja',
  'Lait', 'Fruits à coque', 'Céleri',
  'Moutarde', 'Sésame', 'Sulfites',
  'Lupin', 'Mollusques',
];

// ────────────────────────── Component ──────────────────────────

export default function CreateMenuPage() {
  const navigate = useNavigate();

  // Service type selection
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  // KOURS fields
  const [koursTitle, setKoursTitle] = useState('');
  const [koursDescription, setKoursDescription] = useState('');
  const [koursPrice, setKoursPrice] = useState('');
  const [koursDuration, setKoursDuration] = useState('');
  const [koursMinParticipants, setKoursMinParticipants] = useState('');
  const [koursMaxParticipants, setKoursMaxParticipants] = useState('');
  const [koursDifficulty, setKoursDifficulty] = useState('Débutant');
  const [koursLocation, setKoursLocation] = useState('Chez le kooker');
  const [koursEquipmentProvided, setKoursEquipmentProvided] = useState(false);
  const [koursMenuItems, setKoursMenuItems] = useState<MenuItem[]>([]);
  const [koursNewItemName, setKoursNewItemName] = useState('');
  const [koursNewItemDesc, setKoursNewItemDesc] = useState('');

  // KOOK fields
  const [kookTitle, setKookTitle] = useState('');
  const [kookDescription, setKookDescription] = useState('');
  const [kookPrice, setKookPrice] = useState('');
  const [kookDuration, setKookDuration] = useState('');
  const [kookMinConvives, setKookMinConvives] = useState('');
  const [kookMaxParticipants, setKookMaxParticipants] = useState('');
  const [kookPrepTime, setKookPrepTime] = useState('');
  const [kookIngredientsIncluded, setKookIngredientsIncluded] = useState(false);
  const [kookMenuItems, setKookMenuItems] = useState<MenuItem[]>([]);
  const [kookNewItemName, setKookNewItemName] = useState('');
  const [kookNewItemDesc, setKookNewItemDesc] = useState('');

  // Common fields
  const [photos, setPhotos] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Créer une offre - Weekook';
  }, []);

  // ────────────────────────── Type Toggle ──────────────────────────

  const toggleType = (type: string) => {
    setServiceTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      if (next.length === 2) {
        toast.info('La 2ème offre est visible sous la première, en scrollant');
      }
      return next;
    });
  };

  // ────────────────────────── KOURS completeness ──────────────────────────

  const isKoursComplete =
    koursTitle.trim() !== '' &&
    koursDescription.trim() !== '' &&
    koursPrice.trim() !== '' &&
    koursDuration.trim() !== '' &&
    koursMaxParticipants.trim() !== '';

  const isKookDisabled = serviceTypes.includes('KOURS') && serviceTypes.includes('KOOK') && !isKoursComplete;

  // ────────────────────────── Menu Items Helpers ──────────────────────────

  const addKoursItem = () => {
    if (!koursNewItemName.trim()) return;
    setKoursMenuItems((prev) => [...prev, { name: koursNewItemName.trim(), description: koursNewItemDesc.trim() }]);
    setKoursNewItemName('');
    setKoursNewItemDesc('');
  };

  const removeKoursItem = (idx: number) => {
    setKoursMenuItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addKookItem = () => {
    if (!kookNewItemName.trim()) return;
    setKookMenuItems((prev) => [...prev, { name: kookNewItemName.trim(), description: kookNewItemDesc.trim() }]);
    setKookNewItemName('');
    setKookNewItemDesc('');
  };

  const removeKookItem = (idx: number) => {
    setKookMenuItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ────────────────────────── Specialties ──────────────────────────

  const addSpecialty = () => {
    const val = newSpecialty.trim();
    if (!val || specialties.includes(val)) return;
    setSpecialties((prev) => [...prev, val]);
    setNewSpecialty('');
  };

  const removeSpecialty = (s: string) => {
    setSpecialties((prev) => prev.filter((x) => x !== s));
  };

  // ────────────────────────── Photo Helpers ──────────────────────────

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const MAX_WIDTH = 1200;
          let w = img.width;
          let h = img.height;
          if (w > MAX_WIDTH) { h = Math.round((h * MAX_WIDTH) / w); w = MAX_WIDTH; }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('canvas')); return; }
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('blob')); return; }
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      const res = await api.upload<{ url: string }>('/upload', formData);
      if (res.success && res.data?.url) {
        setPhotos((prev) => [...prev, res.data!.url]);
      } else {
        toast.error('Erreur lors de l\'upload de la photo');
      }
    } catch {
      toast.error('Impossible d\'uploader la photo. Réessayez.');
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // ────────────────────────── Allergens ──────────────────────────

  const toggleAllergen = (a: string) => {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  // ────────────────────────── Submit ──────────────────────────

  const canSubmit = serviceTypes.length > 0 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      for (const type of serviceTypes) {
        const isKours = type === 'KOURS';
        const data = {
          title: isKours ? koursTitle : kookTitle,
          description: isKours ? koursDescription : kookDescription,
          type: [type],
          priceInCents: Math.round(parseFloat(isKours ? koursPrice : kookPrice) * 100),
          durationMinutes: parseInt(isKours ? koursDuration : kookDuration),
          minGuests: isKours
            ? (koursMinParticipants ? parseInt(koursMinParticipants) : undefined)
            : (kookMinConvives ? parseInt(kookMinConvives) : undefined),
          maxGuests: parseInt(isKours ? koursMaxParticipants : kookMaxParticipants),
          allergens: allergens,
          specialty: specialties.length > 0 ? specialties : undefined,
          prepTimeMinutes: !isKours && kookPrepTime ? parseInt(kookPrepTime) : undefined,
          ingredientsIncluded: !isKours ? kookIngredientsIncluded : undefined,
          equipmentProvided: isKours ? koursEquipmentProvided : undefined,
          koursDifficulty: isKours ? koursDifficulty : undefined,
          koursLocation: isKours ? koursLocation : undefined,
          menuItems: (isKours ? koursMenuItems : kookMenuItems).map((item, idx) => ({
            category: 'Plat',
            name: item.name,
            description: item.description,
            sortOrder: idx + 1,
          })),
          images: photos,
        };
        await api.post('/services', data);
      }
      toast.success('Service créé avec succès !');
      navigate('/kooker-dashboard', { state: { tab: 'services' } });
    } catch (err: unknown) {
      const e = err as { error?: string; details?: Record<string, string[]> };
      if (e?.details) {
        const msgs = Object.entries(e.details).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' | ');
        toast.error(`Validation: ${msgs}`);
      } else {
        toast.error(e?.error || 'Erreur lors de la création');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────── Input Style ──────────────────────────

  const inputClass =
    'w-full h-[48px] px-4 bg-[#f2f4fc] border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all';
  const textareaClass =
    'w-full px-4 py-3 bg-[#f2f4fc] border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all resize-none leading-relaxed';
  const labelClass = 'block text-[14px] font-semibold text-[#303044] mb-2';

  // ────────────────────────── Render ──────────────────────────

  return (
    <div className="min-h-screen bg-[#f2f4fc] pb-28" style={{ fontFamily: 'Inter, sans-serif' }}>
      <form onSubmit={handleSubmit}>
        <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8">

          {/* ── Header ── */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/kooker-dashboard')}
              className="flex items-center gap-2 text-[14px] font-medium text-[#303044]/60 hover:text-[#c1a0fd] transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Retour
            </button>
            <h1 className="text-[28px] font-bold text-[#111125] tracking-[-0.56px] mb-1">
              Créer une nouvelle offre
            </h1>
            <p className="text-[14px] text-[#303044]/50">
              Remplissez les informations pour créer votre service
            </p>
          </div>

          {/* ── Type d'offre ── */}
          <div className="relative rounded-[20px] overflow-hidden mb-8 min-h-[160px]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-[#111125]/60" />

            <div className="relative z-10 p-6 md:p-8">
              <h2 className="text-[18px] font-bold text-white mb-1">Type d'offre</h2>
              <p className="text-[14px] text-white/70 mb-6">
                Vous pouvez sélectionner un ou les deux types de service
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => toggleType('KOURS')}
                  className={`flex-1 flex items-center justify-center gap-3 h-[52px] rounded-[12px] text-[15px] font-semibold transition-all cursor-pointer ${
                    serviceTypes.includes('KOURS')
                      ? 'bg-[#f3ecff] border-2 border-[#c1a0fd] text-[#c1a0fd]'
                      : 'bg-white border-2 border-transparent text-[#303044] hover:border-[#c1a0fd]/40'
                  }`}
                >
                  <GraduationCap size={20} />
                  KOURS
                </button>

                <button
                  type="button"
                  onClick={() => toggleType('KOOK')}
                  className={`flex-1 flex items-center justify-center gap-3 h-[52px] rounded-[12px] text-[15px] font-semibold transition-all cursor-pointer ${
                    serviceTypes.includes('KOOK')
                      ? 'bg-[#f3ecff] border-2 border-[#c1a0fd] text-[#c1a0fd]'
                      : 'bg-white border-2 border-transparent text-[#303044] hover:border-[#c1a0fd]/40'
                  }`}
                >
                  <CookingPot size={20} />
                  KOOK
                </button>
              </div>
            </div>
          </div>

          {/* ── KOURS Form ── */}
          {serviceTypes.includes('KOURS') && (
            <>
              {/* Main KOURS fields card */}
              <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-6">
                <h3 className="text-[22px] font-bold text-[#111125] tracking-[-0.44px] mb-6">
                  Service KOURS - Cours de cuisine
                </h3>

                {/* Info box */}
                <div className="bg-[#f3ecff] rounded-[12px] px-4 py-3 mb-6 flex items-center gap-2">
                  <span className="text-[16px] shrink-0">💜</span>
                  <p className="text-[13px] text-[#5c5c6f]">
                    Service KOURS : Apprenez à cuisiner avec un kooker passionné
                  </p>
                </div>

                {/* Titre du cours */}
                <div className="mb-5">
                  <label className={labelClass}>
                    Titre du cours <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <input
                    type="text"
                    value={koursTitle}
                    onChange={(e) => setKoursTitle(e.target.value)}
                    placeholder="Ex: Cours de cuisine italienne authentique"
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className={labelClass}>
                    Description <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <textarea
                    value={koursDescription}
                    onChange={(e) => setKoursDescription(e.target.value)}
                    placeholder="Décrivez votre cours en détail..."
                    rows={4}
                    className={textareaClass}
                  />
                </div>

                {/* Prix + Durée */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className={labelClass}>
                      Prix par personne (€) <span className="text-[#c1a0fd]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={koursPrice}
                      onChange={(e) => setKoursPrice(e.target.value)}
                      placeholder="45"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Durée (minutes) <span className="text-[#c1a0fd]">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={koursDuration}
                      onChange={(e) => setKoursDuration(e.target.value)}
                      placeholder="180"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Min / Max participants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className={labelClass}>
                      Nombre minimum de participants <span className="text-[#c1a0fd]">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={koursMinParticipants}
                      onChange={(e) => setKoursMinParticipants(e.target.value)}
                      placeholder="2"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Nombre maximum de participants <span className="text-[#c1a0fd]">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={koursMaxParticipants}
                      onChange={(e) => setKoursMaxParticipants(e.target.value)}
                      placeholder="8"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Niveau de difficulté */}
                <div className="mb-5">
                  <label className={labelClass}>
                    Niveau de difficulté <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={koursDifficulty}
                      onChange={(e) => setKoursDifficulty(e.target.value)}
                      className={inputClass + ' appearance-none cursor-pointer pr-10'}
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="#303044" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Lieu du cours */}
                <div className="mb-6">
                  <label className={labelClass}>
                    Lieu du cours <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={koursLocation}
                      onChange={(e) => setKoursLocation(e.target.value)}
                      className={inputClass + ' appearance-none cursor-pointer pr-10'}
                    >
                      <option value="Chez le kooker">Chez le kooker</option>
                      <option value="Chez le client">Chez le client</option>
                      <option value="Les deux">Les deux</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="#303044" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Matériel checkbox */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setKoursEquipmentProvided(!koursEquipmentProvided)}
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                      koursEquipmentProvided
                        ? 'bg-[#303044] border-[#303044]'
                        : 'bg-white border-[#c0c0cc]'
                    }`}
                  >
                    {koursEquipmentProvided && (
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-[14px] text-[#303044] font-medium cursor-pointer"
                    onClick={() => setKoursEquipmentProvided(!koursEquipmentProvided)}
                  >
                    Matériel et ustensiles fournis
                  </span>
                </label>
              </div>

              {/* Ce que vous allez apprendre — separate card */}
              <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-6">
                <h3 className="text-[22px] font-bold text-[#111125] tracking-[-0.44px] mb-5">
                  Ce que vous allez apprendre
                </h3>

                {koursMenuItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {koursMenuItems.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 bg-[#f3ecff] rounded-[12px] p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-[#111125]">{item.name}</p>
                          {item.description && (
                            <p className="text-[13px] text-[#303044]/50 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeKoursItem(idx)}
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-red-50 text-[#303044]/30 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-[#e0e2ef] rounded-[16px] p-4">
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={koursNewItemName}
                      onChange={(e) => setKoursNewItemName(e.target.value)}
                      placeholder="Ex: Pâtes fraîches maison"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={koursNewItemDesc}
                      onChange={(e) => setKoursNewItemDesc(e.target.value)}
                      placeholder="Description (optionnel)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addKoursItem}
                      disabled={!koursNewItemName.trim()}
                      className="h-[48px] flex items-center justify-center gap-2 bg-white border-2 border-[#c1a0fd] text-[#c1a0fd] text-[14px] font-semibold rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f3ecff] cursor-pointer"
                    >
                      <Plus size={16} />
                      Ajouter un élément
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── KOOK Form ── */}
          {serviceTypes.includes('KOOK') && (
            <div className={`bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-6 ${isKookDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
              <h3 className="text-[22px] font-bold text-[#111125] tracking-[-0.44px] mb-6">
                Service KOOK - Préparation de repas
              </h3>

              {isKookDisabled && (
                <div className="bg-orange-50 border border-orange-200 rounded-[12px] p-4 mb-6 flex items-center gap-3">
                  <Lock size={18} className="text-orange-500 shrink-0" />
                  <p className="text-[13px] text-orange-700 font-medium">
                    Complétez d'abord le formulaire KOURS ci-dessus pour débloquer cette section.
                  </p>
                </div>
              )}

              {/* Info box */}
              <div className="bg-[#f3ecff] rounded-[12px] px-4 py-3 mb-6 flex items-center gap-2">
                <span className="text-[16px] shrink-0">💜</span>
                <p className="text-[13px] text-[#5c5c6f]">
                  Service KOOK : Le kooker vient préparer le repas au domicile du client.
                </p>
              </div>

              {/* Titre */}
              <div className="mb-5">
                <label className={labelClass}>
                  Titre <span className="text-[#c1a0fd]">*</span>
                </label>
                <input
                  type="text"
                  value={kookTitle}
                  onChange={(e) => setKookTitle(e.target.value)}
                  placeholder="ex: Menu méditerranéen complet"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className={labelClass}>
                  Description <span className="text-[#c1a0fd]">*</span>
                </label>
                <textarea
                  value={kookDescription}
                  onChange={(e) => setKookDescription(e.target.value)}
                  placeholder="Décrivez votre prestation, le menu proposé, les produits utilisés..."
                  rows={4}
                  className={textareaClass}
                />
              </div>

              {/* Prix + Durée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>
                    Prix par personne (€) <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kookPrice}
                    onChange={(e) => setKookPrice(e.target.value)}
                    placeholder="30.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Durée totale (minutes) <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={kookDuration}
                    onChange={(e) => setKookDuration(e.target.value)}
                    placeholder="90"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Min / Max convives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>
                    Min convives <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={kookMinConvives}
                    onChange={(e) => setKookMinConvives(e.target.value)}
                    placeholder="2"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Max convives <span className="text-[#c1a0fd]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={kookMaxParticipants}
                    onChange={(e) => setKookMaxParticipants(e.target.value)}
                    placeholder="12"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Temps de préparation */}
              <div className="mb-5">
                <label className={labelClass}>
                  Temps de préparation estimé (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={kookPrepTime}
                  onChange={(e) => setKookPrepTime(e.target.value)}
                  placeholder="60"
                  className={inputClass}
                />
              </div>

              {/* Ingrédients checkbox */}
              <label className="flex items-center gap-3 cursor-pointer mb-6">
                <div
                  onClick={() => setKookIngredientsIncluded(!kookIngredientsIncluded)}
                  className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                    kookIngredientsIncluded
                      ? 'bg-[#c1a0fd] border-[#c1a0fd]'
                      : 'bg-white border-[#c0c0cc]'
                  }`}
                >
                  {kookIngredientsIncluded && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span
                  className="text-[14px] text-[#303044] font-medium cursor-pointer"
                  onClick={() => setKookIngredientsIncluded(!kookIngredientsIncluded)}
                >
                  Ingrédients inclus dans le prix
                </span>
              </label>

              {/* Menu proposé */}
              <div>
                <h4 className="text-[15px] font-semibold text-[#111125] mb-3">Menu proposé</h4>

                {kookMenuItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {kookMenuItems.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 bg-[#f3ecff] rounded-[12px] p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-[#111125]">{item.name}</p>
                          {item.description && (
                            <p className="text-[13px] text-[#303044]/50 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeKookItem(idx)}
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-red-50 text-[#303044]/30 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-[#e0e2ef] rounded-[16px] p-4">
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={kookNewItemName}
                      onChange={(e) => setKookNewItemName(e.target.value)}
                      placeholder="Ex: Entrée"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={kookNewItemDesc}
                      onChange={(e) => setKookNewItemDesc(e.target.value)}
                      placeholder="Description (optionnel)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addKookItem}
                      disabled={!kookNewItemName.trim()}
                      className="h-[48px] flex items-center justify-center gap-2 bg-white border-2 border-[#c1a0fd] text-[#c1a0fd] text-[14px] font-semibold rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f3ecff] cursor-pointer"
                    >
                      <Plus size={16} />
                      Ajouter un plat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Common Sections ── */}
          {serviceTypes.length > 0 && (
            <>
              {/* Photos */}
              <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-6">
                <h3 className="text-[22px] font-bold text-[#111125] tracking-[-0.44px] mb-6">
                  Photos
                </h3>

                <div className="flex flex-wrap gap-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative w-[160px] h-[160px] rounded-[12px] overflow-hidden group shrink-0">
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {photos.length < 8 && (
                    <label className="w-[160px] h-[160px] border-2 border-dashed border-[#e0e2ef] hover:border-[#c1a0fd] rounded-[12px] flex flex-col items-center justify-center cursor-pointer transition-colors group shrink-0">
                      <Upload size={24} className="text-[#303044]/30 group-hover:text-[#c1a0fd] transition-colors mb-2" />
                      <span className="text-[13px] text-[#303044]/40 group-hover:text-[#c1a0fd] font-medium transition-colors">
                        Ajouter
                      </span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <p className="text-[13px] text-[#303044]/40 mt-4">
                  Ajoutez jusqu'à 8 photos de votre service
                </p>
              </div>

              {/* Spécialités */}
              <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-6">
                <h3 className="text-[22px] font-bold text-[#111125] tracking-[-0.44px] mb-5">
                  Spécialités
                </h3>

                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] text-[#c1a0fd] text-[13px] font-semibold rounded-[8px]"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(s)}
                          className="hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    placeholder="Ex: Italien, Végétarien, Bio..."
                    className={inputClass + ' flex-1'}
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    disabled={!newSpecialty.trim()}
                    className="w-[48px] h-[48px] flex items-center justify-center bg-[#c1a0fd] hover:bg-[#b090ed] text-white rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Allergènes et régimes alimentaires */}
              <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-6">
                <h3 className="text-[22px] font-bold text-[#111125] tracking-[-0.44px] mb-6">
                  Allergènes et régimes alimentaires
                </h3>

                {/* Allergènes présents */}
                <p className="text-[14px] font-bold text-[#303044] mb-4">Allergènes présents</p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3 mb-6">
                  {ALL_ALLERGENS.map((a) => (
                    <label
                      key={a}
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => toggleAllergen(a)}
                    >
                      <div
                        className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-all ${
                          allergens.includes(a)
                            ? 'bg-[#c1a0fd] border-[#c1a0fd]'
                            : 'bg-white border-[#c0c0cc]'
                        }`}
                      >
                        {allergens.includes(a) && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3L3.5 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[14px] text-[#303044]">{a}</span>
                    </label>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-[#f0f0f5] mb-5" />

                {/* Régimes alimentaires */}
                <p className="text-[14px] font-bold text-[#303044] mb-4">Régimes alimentaires</p>
                <div className="flex flex-col gap-3">
                  <label
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => setIsVegetarian(!isVegetarian)}
                  >
                    <div
                      className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-all ${
                        isVegetarian
                          ? 'bg-[#c1a0fd] border-[#c1a0fd]'
                          : 'bg-white border-[#c0c0cc]'
                      }`}
                    >
                      {isVegetarian && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3L3.5 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[14px] text-[#303044]">Végétarien</span>
                  </label>
                  <label
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => setIsVegan(!isVegan)}
                  >
                    <div
                      className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-all ${
                        isVegan
                          ? 'bg-[#c1a0fd] border-[#c1a0fd]'
                          : 'bg-white border-[#c0c0cc]'
                      }`}
                    >
                      {isVegan && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3L3.5 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[14px] text-[#303044]">Vegan</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e2ef] z-50">
          <div className="max-w-[800px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/kooker-dashboard')}
              className="h-[48px] px-6 text-[14px] font-semibold text-[#303044] bg-white border-2 border-[#e0e2ef] hover:border-[#303044]/30 rounded-[12px] transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-[48px] px-8 text-[14px] font-semibold text-white bg-[#c1a0fd] hover:bg-[#b090ed] rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer le service'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
