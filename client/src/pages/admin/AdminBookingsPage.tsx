import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface BookingUser { id: number; email: string; firstName: string; lastName: string; }
interface BookingKooker { id: number; user: { id: number; firstName: string; lastName: string }; }
interface BookingService { id: number; title: string; }

interface AdminBooking {
  id: number;
  date: string;
  startTime: string;
  guests: number;
  totalPriceInCents: number;
  status: string;
  createdAt: string;
  user: BookingUser;
  kookerProfile: BookingKooker;
  service: BookingService;
}

interface BookingsResponse {
  bookings: AdminBooking[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function AdminBookingsPage() {
  const [data, setData] = useState<BookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = 'Admin — Réservations | Weekook'; }, []);

  const fetchBookings = async (status = statusFilter, p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20' });
    if (status) params.set('status', status);
    const res = await api.get<BookingsResponse>(`/admin/bookings?${params}`);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(statusFilter, page); }, [page, statusFilter]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-6">Réservations</h1>

      <div className="bg-white rounded-[20px] p-4 mb-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-[12px] px-3 py-2 text-sm focus:outline-none focus:border-[#c1a0fd]"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Kooker</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Convives</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400">#{String(b.id).padStart(5, '0')}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(b.date).toLocaleDateString('fr-FR')} {b.startTime}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#111125]">{b.user.firstName} {b.user.lastName}</div>
                      <div className="text-xs text-gray-400">{b.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.kookerProfile.user.firstName} {b.kookerProfile.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.service.title}</td>
                    <td className="px-4 py-3 text-gray-600">{b.guests}</td>
                    <td className="px-4 py-3 font-medium text-[#111125]">
                      {(b.totalPriceInCents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
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
