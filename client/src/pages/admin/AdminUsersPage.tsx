import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Trash2, Shield, User } from 'lucide-react';

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  kookerProfile: { id: number; active: boolean; verified: boolean } | null;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

const ROLE_LABELS: Record<string, string> = {
  user: 'Utilisateur',
  kooker: 'Kooker',
  admin: 'Admin',
  suspended: 'Suspendu',
};

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-gray-100 text-gray-600',
  kooker: 'bg-purple-100 text-[#c1a0fd]',
  admin: 'bg-blue-100 text-blue-600',
  suspended: 'bg-red-100 text-red-500',
};

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = 'Admin — Utilisateurs | Weekook'; }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    const res = await api.get<UsersResponse>(`/admin/users?${params}`);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const updateRole = async (userId: number, role: string) => {
    const res = await api.put(`/admin/users/${userId}`, { role });
    if (res.success) fetchUsers();
  };

  const deleteUser = async (userId: number, email: string) => {
    if (!confirm(`Supprimer l'utilisateur ${email} ? Cette action est irréversible.`)) return;
    const res = await api.delete(`/admin/users/${userId}`);
    if (res.success) fetchUsers();
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-6">Utilisateurs</h1>

      {/* Filters */}
      <div className="bg-white rounded-[20px] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:border-[#c1a0fd]"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#c1a0fd] text-white rounded-[12px] text-sm font-medium hover:bg-[#b090ed]">
            Chercher
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-[12px] px-3 py-2 text-sm focus:outline-none focus:border-[#c1a0fd]"
        >
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateur</option>
          <option value="kooker">Kooker</option>
          <option value="admin">Admin</option>
          <option value="suspended">Suspendu</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Rôle</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Inscrit le</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400">#{String(user.id).padStart(5, '0')}</td>
                    <td className="px-4 py-3 font-medium text-[#111125]">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={e => updateRole(user.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-[8px] px-2 py-1 focus:outline-none focus:border-[#c1a0fd]"
                        >
                          <option value="user">Utilisateur</option>
                          <option value="kooker">Kooker</option>
                          <option value="admin">Admin</option>
                          <option value="suspended">Suspendu</option>
                        </select>
                        <button
                          onClick={() => deleteUser(user.id, user.email)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > data.limit && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.total} résultats</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-[8px] disabled:opacity-40 hover:border-[#c1a0fd]"
              >
                ←
              </button>
              <span className="px-3 py-1.5 text-gray-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-[8px] disabled:opacity-40 hover:border-[#c1a0fd]"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
