import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, X } from 'lucide-react';

interface ConfigData {
  specialties?: string[];
  cities?: string[];
  allergens?: string[];
  serviceTypes?: string[];
  [key: string]: string[] | undefined;
}

const CONFIG_LABELS: Record<string, string> = {
  specialties: 'Spécialités culinaires',
  cities: 'Villes disponibles',
  allergens: 'Allergènes',
  serviceTypes: 'Types de service',
};

function ConfigList({
  configKey,
  label,
  values,
  onSave,
}: {
  configKey: string;
  label: string;
  values: string[];
  onSave: (key: string, values: string[]) => Promise<void>;
}) {
  const [items, setItems] = useState<string[]>(values);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setItems(values); setDirty(false); }, [values]);

  const add = () => {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    setItems(prev => [...prev, trimmed]);
    setNewItem('');
    setDirty(true);
  };

  const remove = (item: string) => {
    setItems(prev => prev.filter(i => i !== item));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await onSave(configKey, items);
    setSaving(false);
    setDirty(false);
  };

  return (
    <div className="bg-white rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#111125]">{label}</h2>
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-1.5 bg-[#c1a0fd] text-white rounded-[12px] text-sm font-medium hover:bg-[#b090ed] disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {items.map(item => (
          <span key={item} className="flex items-center gap-1.5 bg-[#f2f4fc] px-3 py-1.5 rounded-full text-sm text-[#111125]">
            {item}
            <button onClick={() => remove(item)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={`Ajouter ${label.toLowerCase()}...`}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:border-[#c1a0fd]"
        />
        <button
          onClick={add}
          className="p-2 bg-[#c1a0fd]/10 text-[#c1a0fd] rounded-[12px] hover:bg-[#c1a0fd]/20 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<ConfigData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Admin — Configuration | Weekook'; }, []);

  useEffect(() => {
    api.get<ConfigData>('/admin/config').then(res => {
      if (res.success && res.data) setConfig(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, values: string[]) => {
    const res = await api.put(`/admin/config/${key}`, { value: values });
    if (res.success && res.data) {
      setConfig(prev => ({ ...prev, [key]: values }));
    }
  };

  const configKeys = ['specialties', 'cities', 'allergens', 'serviceTypes'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-2">Configuration</h1>
      <p className="text-sm text-gray-500 mb-6">
        Modifiez les listes de valeurs utilisées dans l'application. Les changements sont appliqués immédiatement.
      </p>

      {loading ? (
        <div className="text-gray-400 text-sm">Chargement...</div>
      ) : (
        <div className="space-y-4">
          {configKeys.map(key => (
            <ConfigList
              key={key}
              configKey={key}
              label={CONFIG_LABELS[key] ?? key}
              values={config[key] ?? []}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
