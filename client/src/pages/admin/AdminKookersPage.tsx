import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Star, CheckCircle, XCircle } from 'lucide-react';

interface KookerUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

interface AdminKooker {
  id: number;
  city: string | null;
  type: string | string[] | null;
  rating: number;
  reviewCount: number;
  featured: boolean;
  verified: boolean;
  active: boolean;
  createdAt: string;
  user: KookerUser;
  _count: { services: number; bookingsReceived: number };
}

interface KookersResponse {
  kookers: AdminKooker[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminKookersPage() {
  const [data, setData] = useState<KookersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = 'Admin — Kookers | Weekook'; }, []);

  const fetchKookers = async (s = search, p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20' });
    if (s) params.set('search', s);
    const res = await api.get<KookersResponse>(`/admin/kookers?${params}`);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchKookers(search, page); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchKookers(search, 1);
  };

  const toggle = async (id: number, field: 'featured' | 'verified' | 'active', current: boolean) => {
    const res = await api.put(`/admin/kookers/${id}`, { [field]: !current });
    if (res.success) fetchKookers(search, page);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-6">Kookers</h1>

      <div className="bg-white rounded-[20px] p-4 mb-4 flex gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom, email, ville..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:border-[#c1a0fd]"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#c1a0fd] text-white rounded-[12px] text-sm font-medium hover:bg-[#b090ed]">
            Chercher
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[20px] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Kooker</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ville</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Note</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Services</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Réservations</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">⭐ Coup de cœur</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">✓ Vérifié</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Actif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.kookers.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400">#{String(k.id).padStart(5, '0')}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#111125]">{k.user.firstName} {k.user.lastName}</div>
                      <div className="text-xs text-gray-400">{k.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{k.city ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const types = Array.isArray(k.type) ? k.type : (() => { try { return JSON.parse(k.type as string || '[]'); } catch { return []; } })();
                          return (types as string[]).map((t: string) => (
                            <span key={t} className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white ${t === 'KOURS' ? 'bg-[#c1a0fd]' : 'bg-[#7c5cbf]'}`}>{t}</span>
                          ));
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{k.rating.toFixed(1)} ({k.reviewCount})</td>
                    <td className="px-4 py-3 text-gray-600">{k._count.services}</td>
                    <td className="px-4 py-3 text-gray-600">{k._count.bookingsReceived}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggle(k.id, 'featured', k.featured)} title="Toggle coup de cœur">
                        <Star size={18} className={k.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggle(k.id, 'verified', k.verified)} title="Toggle vérifié">
                        <CheckCircle size={18} className={k.verified ? 'text-green-500' : 'text-gray-300'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggle(k.id, 'active', k.active)} title="Toggle actif">
                        {k.active
                          ? <CheckCircle size={18} className="text-[#c1a0fd]" />
                          : <XCircle size={18} className="text-red-400" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > data.limit && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.total} résultats</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-[8px] disabled:opacity-40 hover:border-[#c1a0fd]">←</button>
              <span className="px-3 py-1.5 text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-[8px] disabled:opacity-40 hover:border-[#c1a0fd]">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
