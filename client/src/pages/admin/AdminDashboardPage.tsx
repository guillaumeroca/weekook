import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Users, ChefHat, CalendarDays, TrendingUp } from 'lucide-react';

interface Stats {
  userCount: number;
  kookerCount: number;
  bookingCount: number;
  revenueInCents: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin — Tableau de bord | Weekook';
    api.get<Stats>('/admin/stats').then(res => {
      if (res.success && res.data) setStats(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Utilisateurs', value: stats.userCount, icon: Users, to: '/admin/utilisateurs', color: 'bg-blue-50 text-blue-600' },
    { label: 'Kookers', value: stats.kookerCount, icon: ChefHat, to: '/admin/kookers', color: 'bg-purple-50 text-[#c1a0fd]' },
    { label: 'Réservations', value: stats.bookingCount, icon: CalendarDays, to: '/admin/reservations', color: 'bg-green-50 text-green-600' },
    { label: 'Revenus (confirmés)', value: `${(stats.revenueInCents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`, icon: TrendingUp, to: '/admin/reservations', color: 'bg-orange-50 text-orange-600' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-6">Tableau de bord</h1>

      {loading ? (
        <div className="text-gray-400 text-sm">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, to, color }) => (
            <Link key={label} to={to} className="bg-white rounded-[20px] p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111125]">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/admin/utilisateurs', label: 'Gérer les utilisateurs' },
          { to: '/admin/kookers', label: 'Gérer les kookers' },
          { to: '/admin/temoignages', label: 'Modérer les témoignages' },
          { to: '/admin/configuration', label: 'Modifier la configuration' },
          { to: '/admin/services', label: 'Voir les services' },
          { to: '/admin/reservations', label: 'Voir les réservations' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} className="bg-white rounded-[20px] p-5 text-sm font-medium text-[#111125] hover:bg-[#c1a0fd]/5 hover:text-[#c1a0fd] transition-colors border border-gray-100">
            {label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
