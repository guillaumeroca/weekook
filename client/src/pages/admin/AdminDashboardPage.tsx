import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, ChefHat, CalendarDays, TrendingUp, Database,
  HardDrive, AlertCircle, Activity, Clock,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'day' | 'week' | 'month';

interface KpiMetric {
  current: number;
  previous: number;
  delta: number;
}

interface KpisData {
  period: Period;
  revenue: KpiMetric;
  users: KpiMetric;
  bookings: KpiMetric;
  kookers: KpiMetric;
}

interface AcquisitionPoint { label: string; users: number; kookers: number }
interface BookingStatus { status: string; count: number }
interface TopKooker { id: number; name: string; city: string; revenueInCents: number; bookingCount: number }
interface RecentBooking { id: number; user: string; service: string; status: string; totalPriceInCents: number; createdAt: string }
interface PlatformHealth { avgRating: number; cancellationRate: number; completionRate: number }

interface ChartsData {
  acquisition: AcquisitionPoint[];
  bookingsByStatus: BookingStatus[];
  topKookers: TopKooker[];
  platformHealth: PlatformHealth;
  recentBookings: RecentBooking[];
}

interface PageTiming { page: string; avgLoadTimeMs: number; count: number }
interface ErrorLogEntry { id: number; message: string; route: string | null; method: string | null; statusCode: number | null; createdAt: string }

interface TechStats {
  dbPingMs: number;
  tableCounts: { users: number; kookers: number; services: number; bookings: number; messages: number; reviews: number };
  uploadSizeMb: number;
  errorLogs: ErrorLogEntry[];
  pageTimings: PageTiming[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  completed: '#3b82f6',
  pending: '#f59e0b',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmé',
  completed: 'Terminé',
  pending: 'En attente',
  cancelled: 'Annulé',
};

const PIE_FALLBACK_COLORS = ['#c1a0fd', '#818cf8', '#fb923c', '#34d399'];

// ─── Small helpers ────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-gray-400">—</span>;
  const positive = delta > 0;
  return (
    <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? '▲' : '▼'} {Math.abs(delta)}%
    </span>
  );
}

function KpiCard({ label, value, icon: Icon, color, delta }: { label: string; value: string | number; icon: React.ElementType; color: string; delta: number }) {
  return (
    <div className="bg-white rounded-[20px] p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-[#111125] truncate">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        <DeltaBadge delta={delta} />
      </div>
    </div>
  );
}

// ─── Period selector ──────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = { day: 'Jour', week: 'Semaine', month: 'Mois' };

function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-[12px] p-1">
      {(['day', 'week', 'month'] as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${value === p ? 'bg-white text-[#111125] shadow-sm' : 'text-gray-500 hover:text-[#111125]'}`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// ─── Business Tab ─────────────────────────────────────────────────────────────

function BusinessTab() {
  const [period, setPeriod] = useState<Period>('month');
  const [kpis, setKpis] = useState<KpisData | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    setKpisLoading(true);
    api.get<KpisData>(`/admin/kpis?period=${period}`)
      .then(r => { if (r.success && r.data) setKpis(r.data); })
      .finally(() => setKpisLoading(false));
  }, [period]);

  useEffect(() => {
    api.get<ChartsData>('/admin/business-charts')
      .then(r => { if (r.success && r.data) setCharts(r.data); })
      .finally(() => setChartsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#111125]">Indicateurs clés</h2>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-opacity ${kpisLoading ? 'opacity-50' : ''}`}>
        <KpiCard label="Revenus" value={kpis ? fmt(kpis.revenue.current) : '—'} icon={TrendingUp} color="bg-orange-50 text-orange-500" delta={kpis?.revenue.delta ?? 0} />
        <KpiCard label="Nouvelles réservations" value={kpis?.bookings.current ?? '—'} icon={CalendarDays} color="bg-green-50 text-green-600" delta={kpis?.bookings.delta ?? 0} />
        <KpiCard label="Nouveaux utilisateurs" value={kpis?.users.current ?? '—'} icon={Users} color="bg-blue-50 text-blue-600" delta={kpis?.users.delta ?? 0} />
        <KpiCard label="Nouveaux kookers" value={kpis?.kookers.current ?? '—'} icon={ChefHat} color="bg-purple-50 text-[#c1a0fd]" delta={kpis?.kookers.delta ?? 0} />
      </div>

      {chartsLoading ? (
        <div className="text-gray-400 text-sm text-center py-12">Chargement des graphiques...</div>
      ) : charts ? (
        <>
          {/* Acquisition + Booking status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Acquisition line chart */}
            <div className="lg:col-span-2 bg-white rounded-[20px] p-6">
              <h3 className="text-sm font-semibold text-[#111125] mb-4">Acquisition — 12 dernières semaines</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={charts.acquisition} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" name="Utilisateurs" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="kookers" name="Kookers" stroke="#c1a0fd" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Booking status pie */}
            <div className="bg-white rounded-[20px] p-6">
              <h3 className="text-sm font-semibold text-[#111125] mb-4">Réservations par statut</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.bookingsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {charts.bookingsByStatus.map((entry, i) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, STATUS_LABELS[name as string] ?? name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {charts.bookingsByStatus.map((b, i) => (
                  <div key={b.status} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[b.status] ?? PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length] }} />
                    {STATUS_LABELS[b.status] ?? b.status} ({b.count})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top kookers + Platform health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top kookers */}
            <div className="lg:col-span-2 bg-white rounded-[20px] p-6">
              <h3 className="text-sm font-semibold text-[#111125] mb-4">Top 5 kookers par CA</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                      <th className="pb-2 font-medium">Kooker</th>
                      <th className="pb-2 font-medium">Ville</th>
                      <th className="pb-2 font-medium text-right">Réservations</th>
                      <th className="pb-2 font-medium text-right">CA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {charts.topKookers.length === 0 ? (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-400">Aucune donnée</td></tr>
                    ) : charts.topKookers.map((k, i) => (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="py-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#c1a0fd]/10 text-[#c1a0fd] text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          {k.name}
                        </td>
                        <td className="py-3 text-gray-500">{k.city}</td>
                        <td className="py-3 text-right text-gray-600">{k.bookingCount}</td>
                        <td className="py-3 text-right font-semibold text-[#111125]">{fmt(k.revenueInCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Platform health */}
            <div className="bg-white rounded-[20px] p-6 flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-[#111125]">Santé plateforme</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Note moyenne</span>
                    <span className="font-semibold text-[#111125]">★ {charts.platformHealth.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(charts.platformHealth.avgRating / 5) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Taux de complétion</span>
                    <span className="font-semibold text-green-600">{charts.platformHealth.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${charts.platformHealth.completionRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Taux d'annulation</span>
                    <span className="font-semibold text-red-500">{charts.platformHealth.cancellationRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${charts.platformHealth.cancellationRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent bookings */}
          <div className="bg-white rounded-[20px] p-6">
            <h3 className="text-sm font-semibold text-[#111125] mb-4">Dernières réservations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Utilisateur</th>
                    <th className="pb-2 font-medium">Service</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium text-right">Montant</th>
                    <th className="pb-2 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {charts.recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-2.5 text-gray-400 text-xs">{String(b.id).padStart(5, '0')}</td>
                      <td className="py-2.5">{b.user}</td>
                      <td className="py-2.5 text-gray-600 truncate max-w-[200px]">{b.service}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${STATUS_COLORS[b.status]}20`, color: STATUS_COLORS[b.status] }}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium">{fmt(b.totalPriceInCents)}</td>
                      <td className="py-2.5 text-right text-gray-400 text-xs">
                        {new Date(b.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Tech Tab ─────────────────────────────────────────────────────────────────

function TechTab() {
  const [data, setData] = useState<TechStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TechStats>('/admin/tech-stats')
      .then(r => { if (r.success && r.data) setData(r.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm text-center py-12">Chargement...</div>;
  if (!data) return <div className="text-red-500 text-sm">Erreur de chargement</div>;

  const pingColor = data.dbPingMs < 50 ? 'text-green-600' : data.dbPingMs < 200 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-6">
      {/* DB + Storage row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* DB Ping */}
        <div className="bg-white rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-green-50 flex items-center justify-center">
              <Activity size={18} className="text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-[#111125]">Base de données</h3>
          </div>
          <div className={`text-3xl font-bold mb-1 ${pingColor}`}>{data.dbPingMs} ms</div>
          <div className="text-xs text-gray-400">Latence de connexion</div>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-blue-50 flex items-center justify-center">
              <HardDrive size={18} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-[#111125]">Uploads</h3>
          </div>
          <div className="text-3xl font-bold text-[#111125] mb-1">{data.uploadSizeMb} Mo</div>
          <div className="text-xs text-gray-400">Taille du dossier /uploads</div>
        </div>

        {/* Table counts */}
        <div className="bg-white rounded-[20px] p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-purple-50 flex items-center justify-center">
              <Database size={18} className="text-[#c1a0fd]" />
            </div>
            <h3 className="text-sm font-semibold text-[#111125]">Enregistrements</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {Object.entries(data.tableCounts).map(([table, count]) => (
              <div key={table} className="flex justify-between">
                <span className="text-gray-500 capitalize">{table}</span>
                <span className="font-semibold text-[#111125]">{count.toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page timings bar chart */}
      <div className="bg-white rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center">
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111125]">Temps de chargement par page</h3>
            <p className="text-xs text-gray-400">Moyenne sur les 7 derniers jours</p>
          </div>
        </div>
        {data.pageTimings.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-8">Aucune donnée — naviguez sur le site pour alimenter cette métrique</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.pageTimings} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} unit=" ms" />
              <YAxis type="category" dataKey="page" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(val) => [`${val} ms`, 'Moy. chargement']} />
              <Bar dataKey="avgLoadTimeMs" name="Temps moyen (ms)" fill="#c1a0fd" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Error logs */}
      <div className="bg-white rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-red-50 flex items-center justify-center">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-[#111125]">Dernières erreurs serveur</h3>
        </div>
        {data.errorLogs.length === 0 ? (
          <div className="text-green-600 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Aucune erreur enregistrée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-2 font-medium">Message</th>
                  <th className="pb-2 font-medium">Route</th>
                  <th className="pb-2 font-medium">Méthode</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.errorLogs.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-2.5 text-red-600 truncate max-w-[280px]">{e.message}</td>
                    <td className="py-2.5 text-gray-500 font-mono text-xs">{e.route ?? '—'}</td>
                    <td className="py-2.5 text-gray-500">{e.method ?? '—'}</td>
                    <td className="py-2.5">
                      {e.statusCode && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-mono rounded">{e.statusCode}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-xs">
                      {new Date(e.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  useEffect(() => {
    document.title = 'Admin — Tableau de bord | Weekook';
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-6">Tableau de bord</h1>
      <Tabs defaultValue="business">
        <TabsList className="mb-6">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="technique">Technique</TabsTrigger>
        </TabsList>
        <TabsContent value="business">
          <BusinessTab />
        </TabsContent>
        <TabsContent value="technique">
          <TechTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
