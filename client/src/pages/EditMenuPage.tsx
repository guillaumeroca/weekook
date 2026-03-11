import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
  'Gluten', 'Crustacés', 'Œufs', 'Poisson', 'Arachides', 'Soja',
  'Lait', 'Fruits à coque', 'Céleri', 'Moutarde', 'Sésame', 'Sulfites',
  'Lupin', 'Mollusques',
];

// ────────────────────────── Component ──────────────────────────

export default function EditMenuPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);

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
  const [koursLocation, setKoursLocation] = useState('Chez moi');
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

  // ────────────────────────── Load Service ──────────────────────────

  useEffect(() => {
    document.title = 'Modifier une offre - Weekook';

    const loadService = async () => {
      try {
        const res = await api.get<any>(`/services/${id}`);
        if (res.success && res.data) {
          const s = res.data;
          const types: string[] = Array.isArray(s.type) ? s.type : JSON.parse(s.type || '[]');
          setServiceTypes(types);

          // Populate KOURS or KOOK fields based on type
          if (types.includes('KOURS')) {
            setKoursTitle(s.title || '');
            setKoursDescription(s.description || '');
            setKoursPrice(String(s.priceInCents / 100));
            setKoursDuration(String(s.durationMinutes || ''));
            setKoursMinParticipants(s.minGuests ? String(s.minGuests) : '');
            setKoursMaxParticipants(String(s.maxGuests || ''));
            setKoursEquipmentProvided(s.equipmentProvided || false);
          }
          if (types.includes('KOOK')) {
            setKookTitle(s.title || '');
            setKookDescription(s.description || '');
            setKookPrice(String(s.priceInCents / 100));
            setKookDuration(String(s.durationMinutes || ''));
            setKookMinConvives(s.minGuests ? String(s.minGuests) : '');
            setKookMaxParticipants(String(s.maxGuests || ''));
            setKookPrepTime(s.prepTimeMinutes ? String(s.prepTimeMinutes) : '');
            setKookIngredientsIncluded(s.ingredientsIncluded || false);
          }

          setAllergens(Array.isArray(s.allergens) ? s.allergens : JSON.parse(s.allergens || '[]'));
          setSpecialties(Array.isArray(s.specialty) ? s.specialty : (s.specialty ? JSON.parse(s.specialty) : []));

          // Load existing images
          if (s.images && Array.isArray(s.images) && s.images.length > 0) {
            setPhotos(s.images.map((img: any) => img.url));
          }

          // Load menu items
          if (s.menuItems) {
            const items = s.menuItems.map((m: any) => ({
              name: m.name,
              description: m.description || '',
            }));
            if (types.includes('KOURS')) setKoursMenuItems(items);
            else setKookMenuItems(items);
          }
        }
      } catch {
        toast.error('Erreur lors du chargement');
        navigate('/kooker-dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, [id]);

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
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('canvas')); return; }
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('blob')); return; }
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            },
            'image/jpeg', 0.82
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
      const type = serviceTypes[0];
      const isKours = type === 'KOURS';
      const data = {
        title: isKours ? koursTitle : kookTitle,
        description: isKours ? koursDescription : kookDescription,
        type: serviceTypes,
        priceInCents: Math.round(parseFloat(isKours ? koursPrice : kookPrice) * 100),
        durationMinutes: parseInt(isKours ? koursDuration : kookDuration),
        minGuests: isKours
          ? (koursMinParticipants ? parseInt(koursMinParticipants) : undefined)
          : (kookMinConvives ? parseInt(kookMinConvives) : undefined),
        maxGuests: parseInt(isKours ? koursMaxParticipants : kookMaxParticipants),
        allergens: allergens,
        specialty: specialties.length > 0 ? specialties : [],
        prepTimeMinutes: !isKours && kookPrepTime ? parseInt(kookPrepTime) : undefined,
        ingredientsIncluded: !isKours ? kookIngredientsIncluded : undefined,
        equipmentProvided: isKours ? koursEquipmentProvided : undefined,
        menuItems: (isKours ? koursMenuItems : kookMenuItems).map((item, idx) => ({
          category: 'Plat',
          name: item.name,
          description: item.description,
          sortOrder: idx + 1,
        })),
        images: photos,
      };
      await api.put(`/services/${id}`, data);
      toast.success('Service modifié avec succès !');
      navigate('/kooker-dashboard', { state: { tab: 'services' } });
    } catch (err: unknown) {
      const e = err as { error?: string; details?: Record<string, string[]> };
      if (e?.details) {
        const msgs = Object.entries(e.details).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' | ');
        toast.error(`Validation: ${msgs}`);
      } else {
        toast.error(e?.error || 'Erreur lors de la modification');
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
  const labelClass = 'block text-[13px] font-medium text-[#111125] mb-1.5';

  // ────────────────────────── Loading State ──────────────────────────

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ────────────────────────── Render ──────────────────────────

  return (
    <div className="min-h-screen bg-[#f2f4fc] pb-28">
      <form onSubmit={handleSubmit}>
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8">
          {/* ── Header ── */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/kooker-dashboard')}
              className="flex items-center gap-2 text-[13px] font-medium text-[#111125]/50 hover:text-[#c1a0fd] transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Retour au dashboard
            </button>
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#111125]">Modifier cette offre</h1>
            <p className="text-[14px] text-[#111125]/50 mt-1">
              Modifiez les détails de votre service et enregistrez les changements.
            </p>
          </div>

          {/* ── Service Type Selection ── */}
          <div className="relative rounded-[20px] overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#111125]/80 to-[#111125]/60" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <div className="relative z-10 p-6 md:p-8">
              <h2 className="text-[18px] font-bold text-white mb-2">Type de service</h2>
              <p className="text-[14px] text-white/60 mb-6">
                Sélectionnez un ou deux types de service. Vous pouvez proposer les deux.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => toggleType('KOURS')}
                  className={`flex-1 flex items-center justify-center gap-3 h-[56px] rounded-[12px] text-[15px] font-semibold transition-all ${
                    serviceTypes.includes('KOURS')
                      ? 'bg-[#c1a0fd] text-white shadow-lg shadow-[#c1a0fd]/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <GraduationCap size={20} />
                  KOURS
                </button>
                <button
                  type="button"
                  onClick={() => toggleType('KOOK')}
                  className={`flex-1 flex items-center justify-center gap-3 h-[56px] rounded-[12px] text-[15px] font-semibold transition-all ${
                    serviceTypes.includes('KOOK')
                      ? 'bg-[#c1a0fd] text-white shadow-lg shadow-[#c1a0fd]/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
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
            <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[12px] bg-[#f3ecff] flex items-center justify-center">
                  <GraduationCap size={20} className="text-[#c1a0fd]" />
                </div>
                <div>
                  <h3 className="text-[24px] font-semibold text-[#111125] tracking-[-0.48px]">Service KOURS - Cours de cuisine</h3>
                  <p className="text-[13px] text-[#111125]/50">Configurez les détails de votre cours</p>
                </div>
              </div>

              {/* Purple info box */}
              <div className="bg-[#f3ecff] rounded-[12px] p-4 mb-6">
                <p className="text-[14px] text-[#5c5c6f]">
                  Un cours de cuisine permet à vos clients d'apprendre vos recettes et techniques culinaires en votre compagnie.
                </p>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label className={labelClass}>Titre du cours</label>
                <input
                  type="text"
                  value={koursTitle}
                  onChange={(e) => setKoursTitle(e.target.value)}
                  placeholder="ex: Cours de pâtes fraîches maison"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className={labelClass}>Description</label>
                <textarea
                  value={koursDescription}
                  onChange={(e) => setKoursDescription(e.target.value)}
                  placeholder="Décrivez le contenu de votre cours, ce que les participants vont apprendre..."
                  rows={5}
                  className={textareaClass}
                />
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Prix par personne (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={koursPrice}
                    onChange={(e) => setKoursPrice(e.target.value)}
                    placeholder="35.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Durée (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={koursDuration}
                    onChange={(e) => setKoursDuration(e.target.value)}
                    placeholder="120"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Min / Max participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Min participants</label>
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
                  <label className={labelClass}>Max participants</label>
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

              {/* Difficulty + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Difficulté</label>
                  <select
                    value={koursDifficulty}
                    onChange={(e) => setKoursDifficulty(e.target.value)}
                    className={inputClass + ' appearance-none cursor-pointer'}
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Lieu</label>
                  <select
                    value={koursLocation}
                    onChange={(e) => setKoursLocation(e.target.value)}
                    className={inputClass + ' appearance-none cursor-pointer'}
                  >
                    <option value="Chez moi">Chez moi</option>
                    <option value="Chez le client">Chez le client</option>
                    <option value="Les deux">Les deux</option>
                  </select>
                </div>
              </div>

              {/* Equipment checkbox */}
              <label className="flex items-center gap-3 cursor-pointer mb-8">
                <input
                  type="checkbox"
                  checked={koursEquipmentProvided}
                  onChange={(e) => setKoursEquipmentProvided(e.target.checked)}
                  className="w-5 h-5 rounded-[4px] border-[#e0e2ef] text-[#c1a0fd] focus:ring-[#c1a0fd]/20 cursor-pointer"
                />
                <span className="text-[14px] text-[#111125] font-medium">Matériel et ustensiles fournis</span>
              </label>

              {/* Menu Items - KOURS */}
              <div className="border-t border-[#e0e2ef] pt-6">
                <h4 className="text-[15px] font-semibold text-[#111125] mb-4">Ce que vous allez apprendre</h4>

                {koursMenuItems.length > 0 && (
                  <div className="space-y-3 mb-5">
                    {koursMenuItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 bg-[#f3ecff] rounded-[12px] p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-[#111125]">{item.name}</p>
                          {item.description && (
                            <p className="text-[13px] text-[#111125]/50 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeKoursItem(idx)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-red-50 text-[#111125]/30 hover:text-red-500 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={koursNewItemName}
                    onChange={(e) => setKoursNewItemName(e.target.value)}
                    placeholder="Nom de l'élément"
                    className={inputClass + ' sm:flex-1'}
                  />
                  <input
                    type="text"
                    value={koursNewItemDesc}
                    onChange={(e) => setKoursNewItemDesc(e.target.value)}
                    placeholder="Description (optionnel)"
                    className={inputClass + ' sm:flex-1'}
                  />
                  <button
                    type="button"
                    onClick={addKoursItem}
                    disabled={!koursNewItemName.trim()}
                    className="h-[48px] px-5 flex items-center justify-center gap-2 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[13px] font-semibold rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Ajouter un élément
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── KOOK Form ── */}
          {serviceTypes.includes('KOOK') && (
            <div className={`bg-white rounded-[16px] p-6 md:p-8 shadow-sm mb-8 ${isKookDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[12px] bg-[#f3ecff] flex items-center justify-center">
                  <CookingPot size={20} className="text-[#c1a0fd]" />
                </div>
                <div>
                  <h3 className="text-[24px] font-semibold text-[#111125] tracking-[-0.48px]">Service KOOK - Préparation de repas</h3>
                  <p className="text-[13px] text-[#111125]/50">Configurez les détails de votre prestation</p>
                </div>
              </div>

              {/* Orange info box when disabled */}
              {isKookDisabled && (
                <div className="bg-orange-50 border border-orange-200 rounded-[12px] p-4 mb-6 flex items-center gap-3">
                  <Lock size={18} className="text-orange-500 flex-shrink-0" />
                  <p className="text-[13px] text-orange-700 font-medium">
                    Complétez d'abord le formulaire KOURS ci-dessus pour débloquer cette section.
                  </p>
                </div>
              )}

              {/* Title */}
              <div className="mb-5">
                <label className={labelClass}>Titre du service</label>
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
                <label className={labelClass}>Description</label>
                <textarea
                  value={kookDescription}
                  onChange={(e) => setKookDescription(e.target.value)}
                  placeholder="Décrivez votre prestation, le menu proposé, les produits utilisés..."
                  rows={5}
                  className={textareaClass}
                />
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Prix par personne (EUR)</label>
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
                  <label className={labelClass}>Durée (minutes)</label>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Min convives</label>
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
                  <label className={labelClass}>Max convives</label>
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

              {/* Preparation time */}
              <div className="mb-5">
                <label className={labelClass}>Temps de préparation (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={kookPrepTime}
                  onChange={(e) => setKookPrepTime(e.target.value)}
                  placeholder="60"
                  className={inputClass + ' max-w-[300px]'}
                />
              </div>

              {/* Ingredients checkbox */}
              <label className="flex items-center gap-3 cursor-pointer mb-8">
                <input
                  type="checkbox"
                  checked={kookIngredientsIncluded}
                  onChange={(e) => setKookIngredientsIncluded(e.target.checked)}
                  className="w-5 h-5 rounded-[4px] border-[#e0e2ef] text-[#c1a0fd] focus:ring-[#c1a0fd]/20 cursor-pointer"
                />
                <span className="text-[14px] text-[#111125] font-medium">Ingrédients inclus</span>
              </label>

              {/* Menu Items - KOOK */}
              <div className="border-t border-[#e0e2ef] pt-6">
                <h4 className="text-[15px] font-semibold text-[#111125] mb-4">Menu proposé</h4>

                {kookMenuItems.length > 0 && (
                  <div className="space-y-3 mb-5">
                    {kookMenuItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 bg-[#f3ecff] rounded-[12px] p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-[#111125]">{item.name}</p>
                          {item.description && (
                            <p className="text-[13px] text-[#111125]/50 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeKookItem(idx)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-red-50 text-[#111125]/30 hover:text-red-500 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={kookNewItemName}
                    onChange={(e) => setKookNewItemName(e.target.value)}
                    placeholder="Nom du plat"
                    className={inputClass + ' sm:flex-1'}
                  />
                  <input
                    type="text"
                    value={kookNewItemDesc}
                    onChange={(e) => setKookNewItemDesc(e.target.value)}
                    placeholder="Description (optionnel)"
                    className={inputClass + ' sm:flex-1'}
                  />
                  <button
                    type="button"
                    onClick={addKookItem}
                    disabled={!kookNewItemName.trim()}
                    className="h-[48px] px-5 flex items-center justify-center gap-2 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[13px] font-semibold rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Ajouter un élément
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Common Sections (shown when any type selected) ── */}
          {serviceTypes.length > 0 && (
            <>
              {/* Photos */}
              <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-sm mb-8">
                <h3 className="text-[24px] font-semibold text-[#111125] tracking-[-0.48px] mb-2">Photos</h3>
                <p className="text-[13px] text-[#111125]/50 mb-6">
                  Ajoutez jusqu'à 4 photos pour illustrer votre service.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-[12px] overflow-hidden group">
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {photos.length < 4 && (
                    <label className="aspect-square border-2 border-dashed border-[#e0e2ef] hover:border-[#c1a0fd] rounded-[12px] flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <Upload size={24} className="text-[#111125]/20 group-hover:text-[#c1a0fd] transition-colors mb-2" />
                      <span className="text-[12px] text-[#111125]/30 group-hover:text-[#c1a0fd] font-medium transition-colors">
                        Ajouter
                      </span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-sm mb-8">
                <h3 className="text-[24px] font-semibold text-[#111125] tracking-[-0.48px] mb-2">Spécialités</h3>
                <p className="text-[13px] text-[#111125]/50 mb-4">
                  Ajoutez des tags pour décrire votre cuisine.
                </p>

                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c1a0fd]/10 text-[#c1a0fd] text-[13px] font-medium rounded-[8px]"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(s)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
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
                    placeholder="ex: Méditerranéen, Provençal..."
                    className={inputClass + ' flex-1'}
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    disabled={!newSpecialty.trim()}
                    className="h-[48px] px-5 flex items-center gap-2 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[13px] font-semibold rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Allergens */}
              <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-sm mb-8">
                <h3 className="text-[24px] font-semibold text-[#111125] tracking-[-0.48px] mb-2">Allergènes</h3>
                <p className="text-[13px] text-[#111125]/50 mb-6">
                  Cochez les allergènes pouvant être présents dans vos préparations.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ALL_ALLERGENS.map((a) => (
                    <label
                      key={a}
                      className={`flex items-center gap-3 p-3 rounded-[12px] cursor-pointer transition-all ${
                        allergens.includes(a)
                          ? 'bg-[#c1a0fd]/10 border border-[#c1a0fd]/30'
                          : 'bg-[#f2f4fc] border border-transparent hover:border-[#e0e2ef]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={allergens.includes(a)}
                        onChange={() => toggleAllergen(a)}
                        className="w-4 h-4 rounded-[4px] border-[#e0e2ef] text-[#c1a0fd] focus:ring-[#c1a0fd]/20 cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-[#111125]">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-sm mb-8">
                <h3 className="text-[24px] font-semibold text-[#111125] tracking-[-0.48px] mb-2">Régimes alimentaires</h3>
                <p className="text-[13px] text-[#111125]/50 mb-4">
                  Indiquez si votre service est adapté à ces régimes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-[12px] cursor-pointer transition-all flex-1 ${
                      isVegetarian
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-[#f2f4fc] border border-transparent hover:border-[#e0e2ef]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isVegetarian}
                      onChange={(e) => setIsVegetarian(e.target.checked)}
                      className="w-5 h-5 rounded-[4px] border-[#e0e2ef] text-green-500 focus:ring-green-200 cursor-pointer"
                    />
                    <span className="text-[14px] font-medium text-[#111125]">Végétarien</span>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-[12px] cursor-pointer transition-all flex-1 ${
                      isVegan
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-[#f2f4fc] border border-transparent hover:border-[#e0e2ef]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isVegan}
                      onChange={(e) => setIsVegan(e.target.checked)}
                      className="w-5 h-5 rounded-[4px] border-[#e0e2ef] text-green-500 focus:ring-green-200 cursor-pointer"
                    />
                    <span className="text-[14px] font-medium text-[#111125]">Vegan</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sticky Action Bar ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e2ef] z-50">
          <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/kooker-dashboard')}
              className="px-6 py-3 text-[14px] font-medium text-[#111125]/50 hover:text-[#111125] bg-white border border-[#e0e2ef] hover:border-[#111125]/20 rounded-[12px] transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit || (serviceTypes.includes('KOURS') && serviceTypes.includes('KOOK') && !isKoursComplete)}
              className="px-8 py-3 text-[14px] font-semibold text-white bg-[#c1a0fd] hover:bg-[#b090ed] rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
