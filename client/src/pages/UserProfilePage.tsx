import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { ChevronLeft, User, MapPin, Key, UtensilsCrossed, Leaf, FileText } from 'lucide-react';

// ─────────────────────────── Types ───────────────────────────

interface HostingProfile {
  address: string;
  addressComplement: string;
  city: string;
  postalCode: string;
  country: string;
  accessCode: string;
  floor: string;
  intercom: string;
  parkingInfo: string;
  stoveType: string;
  hasOven: boolean;
  hasDishwasher: boolean;
  tableCapacity: string;
  kitchenNotes: string;
  dietaryRestrictions: string[];
  allergies: string[];
  hostingNotes: string;
}

// ─────────────────────────── Constants ───────────────────────────

const DIETARY_OPTIONS = [
  'Végétarien',
  'Végétalien / Vegan',
  'Sans gluten',
  'Halal',
  'Casher',
  'Sans lactose',
  'Sans porc',
  'Sans alcool dans les préparations',
];

const ALLERGEN_OPTIONS = [
  'Gluten', 'Crustacés', 'Œufs', 'Poisson', 'Arachides',
  'Soja', 'Lait', 'Fruits à coque', 'Céleri', 'Moutarde',
  'Sésame', 'Sulfites', 'Lupin', 'Mollusques',
];

const EMPTY_PROFILE: HostingProfile = {
  address: '', addressComplement: '', city: '', postalCode: '', country: 'France',
  accessCode: '', floor: '', intercom: '', parkingInfo: '',
  stoveType: '', hasOven: false, hasDishwasher: false, tableCapacity: '', kitchenNotes: '',
  dietaryRestrictions: [], allergies: [],
  hostingNotes: '',
};

// ─────────────────────────── Helper components ───────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  onSave,
  saving,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-[12px] bg-[#c1a0fd]/10 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-[#c1a0fd]" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-[#111125]">{title}</h2>
          <p className="text-[13px] text-[#828294] mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 h-[44px] bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125] text-[14px] font-semibold rounded-[12px] transition-all disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#111125] mb-1.5">{label}</label>
      {hint && <p className="text-[12px] text-[#828294] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full h-[44px] px-4 border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:border-[#c1a0fd] bg-white placeholder:text-[#c0c2d0]';
const textareaCls = 'w-full px-4 py-3 border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:border-[#c1a0fd] bg-white placeholder:text-[#c0c2d0] resize-none';

function CheckTag({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`px-3 py-2 rounded-[10px] text-[13px] font-medium border transition-all ${
        checked
          ? 'bg-[#c1a0fd] border-[#c1a0fd] text-white'
          : 'bg-white border-[#e0e2ef] text-[#5c5c6f] hover:border-[#c1a0fd]'
      }`}
    >
      {checked ? '✓ ' : ''}{label}
    </button>
  );
}

// ─────────────────────────── Page ───────────────────────────

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [personal, setPersonal] = useState({ firstName: '', lastName: '', phone: '' });
  const [hosting, setHosting] = useState<HostingProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress]   = useState(false);
  const [savingAccess, setSavingAccess]     = useState(false);
  const [savingKitchen, setSavingKitchen]   = useState(false);
  const [savingDietary, setSavingDietary]   = useState(false);
  const [savingNotes, setSavingNotes]       = useState(false);

  useEffect(() => {
    document.title = 'Mon profil - Weekook';
    const load = async () => {
      if (user) {
        setPersonal({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
      }
      try {
        const res = await api.get<HostingProfile>('/users/hosting-profile');
        if (res.success && res.data) {
          setHosting({
            ...EMPTY_PROFILE,
            ...res.data,
            tableCapacity: res.data.tableCapacity != null ? String(res.data.tableCapacity) : '',
            dietaryRestrictions: (res.data.dietaryRestrictions as string[]) ?? [],
            allergies: (res.data.allergies as string[]) ?? [],
          });
        }
      } catch { /* profil vide */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const savePersonal = async () => {
    setSavingPersonal(true);
    try {
      await api.put('/users/profile', personal);
      await refreshUser();
      toast.success('Informations personnelles mises à jour');
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setSavingPersonal(false); }
  };

  const saveHosting = async (fields: Partial<HostingProfile>, setSaving: (v: boolean) => void) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...fields };
      if ('tableCapacity' in payload) {
        payload.tableCapacity = payload.tableCapacity ? parseInt(payload.tableCapacity as string) : undefined;
      }
      await api.put('/users/hosting-profile', payload);
      toast.success('Enregistré');
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const toggleMulti = (key: 'dietaryRestrictions' | 'allergies', value: string) => {
    setHosting(h => {
      const arr = h[key];
      return { ...h, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f4fc] flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-[#c1a0fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4fc]">
      <div className="max-w-[760px] mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tableau-de-bord')}
            className="flex items-center gap-2 text-[14px] text-[#828294] hover:text-[#111125] transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Retour au tableau de bord
          </button>
          <h1 className="text-[32px] md:text-[36px] font-semibold text-[#111125] tracking-[-0.5px]">
            Mon profil
          </h1>
          <p className="text-[15px] text-[#5c5c6f] mt-1">
            Ces informations permettent à votre kooker de préparer et réaliser sa prestation dans les meilleures conditions.
          </p>
        </div>

        <div className="space-y-6">

          {/* ── 1. Informations personnelles ── */}
          <SectionCard
            icon={User}
            title="Informations personnelles"
            description="Vos coordonnées de contact"
            onSave={savePersonal}
            saving={savingPersonal}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prénom">
                <input
                  type="text"
                  value={personal.firstName}
                  onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Nom">
                <input
                  type="text"
                  value={personal.lastName}
                  onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Téléphone" hint="Le kooker pourra vous contacter en cas d'imprévu">
              <input
                type="tel"
                value={personal.phone}
                onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                placeholder="+33 6 00 00 00 00"
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className={inputCls + ' bg-gray-50 text-[#828294] cursor-not-allowed'}
              />
            </Field>
          </SectionCard>

          {/* ── 2. Adresse de prestation ── */}
          <SectionCard
            icon={MapPin}
            title="Adresse de prestation"
            description="L'adresse où le kooker se déplacera pour la prestation"
            onSave={() => saveHosting({
              address: hosting.address, addressComplement: hosting.addressComplement,
              city: hosting.city, postalCode: hosting.postalCode, country: hosting.country,
            }, setSavingAddress)}
            saving={savingAddress}
          >
            <Field label="Adresse">
              <input
                type="text"
                value={hosting.address}
                onChange={e => setHosting(h => ({ ...h, address: e.target.value }))}
                placeholder="12 rue de la Paix"
                className={inputCls}
              />
            </Field>
            <Field label="Complément d'adresse" hint="Bâtiment, résidence, appartement...">
              <input
                type="text"
                value={hosting.addressComplement}
                onChange={e => setHosting(h => ({ ...h, addressComplement: e.target.value }))}
                placeholder="Bât. B, Appt 32"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code postal">
                <input
                  type="text"
                  value={hosting.postalCode}
                  onChange={e => setHosting(h => ({ ...h, postalCode: e.target.value }))}
                  placeholder="13001"
                  className={inputCls}
                />
              </Field>
              <Field label="Ville">
                <input
                  type="text"
                  value={hosting.city}
                  onChange={e => setHosting(h => ({ ...h, city: e.target.value }))}
                  placeholder="Marseille"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Pays">
              <input
                type="text"
                value={hosting.country}
                onChange={e => setHosting(h => ({ ...h, country: e.target.value }))}
                className={inputCls}
              />
            </Field>
          </SectionCard>

          {/* ── 3. Accès ── */}
          <SectionCard
            icon={Key}
            title="Accès & logistique"
            description="Facilitez l'arrivée du kooker avec tous les détails pratiques"
            onSave={() => saveHosting({
              accessCode: hosting.accessCode, floor: hosting.floor,
              intercom: hosting.intercom, parkingInfo: hosting.parkingInfo,
            }, setSavingAccess)}
            saving={savingAccess}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Code d'accès / digicode" hint="Code pour entrer dans l'immeuble">
                <input
                  type="text"
                  value={hosting.accessCode}
                  onChange={e => setHosting(h => ({ ...h, accessCode: e.target.value }))}
                  placeholder="A1234#"
                  className={inputCls}
                />
              </Field>
              <Field label="Étage">
                <input
                  type="text"
                  value={hosting.floor}
                  onChange={e => setHosting(h => ({ ...h, floor: e.target.value }))}
                  placeholder="3ème étage, porte droite"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Nom sur l'interphone">
              <input
                type="text"
                value={hosting.intercom}
                onChange={e => setHosting(h => ({ ...h, intercom: e.target.value }))}
                placeholder="Dupont"
                className={inputCls}
              />
            </Field>
            <Field label="Informations parking" hint="Où se garer ? Y a-t-il une place réservée ?">
              <textarea
                value={hosting.parkingInfo}
                onChange={e => setHosting(h => ({ ...h, parkingInfo: e.target.value }))}
                placeholder="Parking souterrain en face, code : 5678. Ou rue libre le matin."
                rows={3}
                className={textareaCls}
              />
            </Field>
          </SectionCard>

          {/* ── 4. Cuisine & équipement ── */}
          <SectionCard
            icon={UtensilsCrossed}
            title="Cuisine & équipement"
            description="Aidez le kooker à préparer sa venue en connaissant votre équipement"
            onSave={() => saveHosting({
              stoveType: hosting.stoveType as any, hasOven: hosting.hasOven,
              hasDishwasher: hosting.hasDishwasher,
              tableCapacity: hosting.tableCapacity,
              kitchenNotes: hosting.kitchenNotes,
            }, setSavingKitchen)}
            saving={savingKitchen}
          >
            <Field label="Type de plaque de cuisson">
              <div className="flex flex-wrap gap-2">
                {(['gaz', 'induction', 'électrique', 'mixte'] as const).map(type => (
                  <CheckTag
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    checked={hosting.stoveType === type}
                    onChange={() => setHosting(h => ({ ...h, stoveType: h.stoveType === type ? '' : type }))}
                  />
                ))}
              </div>
            </Field>

            <div className="flex gap-4">
              <Field label="Four disponible">
                <div className="flex gap-2 mt-1">
                  <CheckTag label="Oui" checked={hosting.hasOven} onChange={v => setHosting(h => ({ ...h, hasOven: v }))} />
                  <CheckTag label="Non" checked={!hosting.hasOven} onChange={v => setHosting(h => ({ ...h, hasOven: !v }))} />
                </div>
              </Field>
              <Field label="Lave-vaisselle">
                <div className="flex gap-2 mt-1">
                  <CheckTag label="Oui" checked={hosting.hasDishwasher} onChange={v => setHosting(h => ({ ...h, hasDishwasher: v }))} />
                  <CheckTag label="Non" checked={!hosting.hasDishwasher} onChange={v => setHosting(h => ({ ...h, hasDishwasher: !v }))} />
                </div>
              </Field>
            </div>

            <Field label="Nombre de couverts maximum" hint="Combien de personnes peut accueillir votre table ?">
              <input
                type="number"
                min="1"
                max="100"
                value={hosting.tableCapacity}
                onChange={e => setHosting(h => ({ ...h, tableCapacity: e.target.value }))}
                placeholder="6"
                className={inputCls + ' max-w-[120px]'}
              />
            </Field>

            <Field label="Notes sur la cuisine" hint="Particularités, matériel disponible, ce qui manque...">
              <textarea
                value={hosting.kitchenNotes}
                onChange={e => setHosting(h => ({ ...h, kitchenNotes: e.target.value }))}
                placeholder="Robot Thermomix disponible. Pas de plancha. Cuisine ouverte sur le salon."
                rows={3}
                className={textareaCls}
              />
            </Field>
          </SectionCard>

          {/* ── 5. Régimes & allergènes ── */}
          <SectionCard
            icon={Leaf}
            title="Régimes alimentaires & allergènes"
            description="Informations essentielles pour que le kooker adapte son menu"
            onSave={() => saveHosting({
              dietaryRestrictions: hosting.dietaryRestrictions,
              allergies: hosting.allergies,
            }, setSavingDietary)}
            saving={savingDietary}
          >
            <Field label="Restrictions alimentaires parmi vos convives" hint="Sélectionnez tout ce qui s'applique">
              <div className="flex flex-wrap gap-2 mt-1">
                {DIETARY_OPTIONS.map(opt => (
                  <CheckTag
                    key={opt}
                    label={opt}
                    checked={hosting.dietaryRestrictions.includes(opt)}
                    onChange={() => toggleMulti('dietaryRestrictions', opt)}
                  />
                ))}
              </div>
            </Field>

            <Field label="Allergènes présents parmi vos convives" hint="14 allergènes réglementaires — signalez tous ceux qui concernent votre groupe">
              <div className="flex flex-wrap gap-2 mt-1">
                {ALLERGEN_OPTIONS.map(opt => (
                  <CheckTag
                    key={opt}
                    label={opt}
                    checked={hosting.allergies.includes(opt)}
                    onChange={() => toggleMulti('allergies', opt)}
                  />
                ))}
              </div>
            </Field>
          </SectionCard>

          {/* ── 6. Notes libres ── */}
          <SectionCard
            icon={FileText}
            title="Notes pour le kooker"
            description="Tout ce qui pourrait être utile et ne rentre pas dans les cases ci-dessus"
            onSave={() => saveHosting({ hostingNotes: hosting.hostingNotes }, setSavingNotes)}
            saving={savingNotes}
          >
            <Field label="Message libre" hint="Animaux de compagnie, enfants en bas âge, préférences de présentation, ambiance souhaitée...">
              <textarea
                value={hosting.hostingNotes}
                onChange={e => setHosting(h => ({ ...h, hostingNotes: e.target.value }))}
                placeholder="Nous avons un chat qui peut venir dans la cuisine. Préférence pour un dressage simple et convivial. La soirée est un anniversaire, ambiance festive souhaitée."
                rows={5}
                className={textareaCls}
              />
            </Field>
          </SectionCard>

        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
