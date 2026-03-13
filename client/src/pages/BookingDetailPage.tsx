import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingDetail {
  id: number;
  userId: number;
  kookerProfileId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string | null;
  guests: number;
  totalPriceInCents: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  createdAt: string;
  service: {
    id: number;
    title: string;
    type: unknown;
    priceInCents: number;
    durationMinutes: number;
    description: string | null;
    koursDifficulty?: string | null;
    koursLocation?: string | null;
    equipmentProvided?: boolean;
  };
  kookerProfile: {
    id: number;
    user: { id: number; firstName: string; lastName: string; avatar: string | null };
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    phone: string | null;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateInput(dateStr: string) {
  return new Date(dateStr).toISOString().slice(0, 10);
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',  color: '#d97706', bg: '#fef3c7' },
  confirmed: { label: 'Confirmée',   color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Annulée',     color: '#dc2626', bg: '#fee2e2' },
  completed: { label: 'Terminée',    color: '#6b7280', bg: '#f3f4f6' },
};

function Avatar({ firstName, lastName, avatar, size = 48 }: { firstName: string; lastName: string; avatar: string | null; size?: number }) {
  const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  return avatar ? (
    <img src={avatar} alt={firstName} style={{ width: size, height: size }} className="rounded-full object-cover flex-shrink-0" />
  ) : (
    <div style={{ width: size, height: size, fontSize: size * 0.36 }} className="rounded-full bg-gradient-to-br from-[#c1a0fd] to-[#8b6fce] flex items-center justify-center text-white font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editGuests, setEditGuests] = useState(1);
  const [editNotes, setEditNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHovered, setReviewHovered] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<BookingDetail>(`/bookings/${id}`)
      .then(res => {
        if (res.success && res.data) {
          setBooking(res.data);
          setEditDate(formatDateInput(res.data.date));
          setEditTime(String(res.data.startTime).slice(0, 5));
          setEditGuests(res.data.guests);
          setEditNotes(res.data.notes || '');
        }
      })
      .catch(() => toast.error('Réservation introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f2f4fc] flex items-center justify-center">
        {loading ? (
          <div className="w-8 h-8 border-2 border-[#c1a0fd] border-t-transparent rounded-full animate-spin" />
        ) : (
          <p className="text-[#6b7280]">Réservation introuvable.</p>
        )}
      </div>
    );
  }

  const isOwner = booking.userId === user?.id;
  const isKooker = user?.kookerProfileId != null && booking.kookerProfileId === user.kookerProfileId;
  const isKours = Array.isArray(booking.service.type)
    ? (booking.service.type as string[]).includes('KOURS')
    : String(booking.service.type).includes('KOURS');
  const canEdit = isOwner
    ? booking.status === 'pending'
    : isKooker
      ? booking.status !== 'completed' && booking.status !== 'cancelled'
      : false;

  const statusInfo = STATUS_LABELS[booking.status] || STATUS_LABELS.pending;
  const kookerUser = booking.kookerProfile.user;
  const clientUser = booking.user;
  const otherPersonId = isOwner ? kookerUser.id : clientUser.id;

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        date: editDate,
        startTime: editTime,
        notes: editNotes || null,
      };
      if (isOwner) body.guests = editGuests;

      const res = await api.put<BookingDetail>(`/bookings/${id}`, body);
      if (res.success && res.data) {
        setBooking(res.data);
        setEditMode(false);
        toast.success('Réservation modifiée — l\'autre partie a été notifiée.');
      }
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        kookerProfileId: booking.kookerProfileId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setHasReview(true);
      setShowReviewModal(false);
      toast.success('Avis publié — merci !');
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Erreur lors de la publication');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDate(formatDateInput(booking.date));
    setEditTime(String(booking.startTime).slice(0, 5));
    setEditGuests(booking.guests);
    setEditNotes(booking.notes || '');
    setEditMode(false);
  };

  document.title = `Réservation #${booking.id.toString().padStart(5, '0')} — Weekook`;

  return (
    <div className="min-h-screen bg-[#f2f4fc]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="px-4 md:px-8 lg:px-[96px] py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6b7280] hover:text-[#111125] text-[14px] font-medium mb-6 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Retour
        </button>

        <div className="max-w-[680px]">

          {/* ── Header card ── */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-4">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Avatar
                  firstName={kookerUser.firstName}
                  lastName={kookerUser.lastName}
                  avatar={kookerUser.avatar}
                  size={52}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2 leading-tight mb-0.5">
                    <h1 className="text-[20px] font-bold text-[#111125]">{booking.service.title}</h1>
                    {isKours
                      ? <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[#c1a0fd] text-white">KOURS</span>
                      : <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[#7c5cbf] text-white">KOOK</span>}
                  </div>
                  <button
                    onClick={() => navigate(`/kooker/${booking.kookerProfileId}`)}
                    className="text-[14px] text-[#c1a0fd] hover:underline mt-0.5 block"
                  >
                    avec {kookerUser.firstName} {kookerUser.lastName}
                  </button>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">
                    Réservation #{String(booking.id).padStart(5, '0')} · créée le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <span
                className="text-[12px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
              >
                {statusInfo.label}
              </span>
            </div>

            {/* Details grid */}
            <div className="bg-[#f2f4fc] rounded-[14px] divide-y divide-[#e0e2ef]">
              {[
                {
                  icon: <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"/>,
                  label: 'Date',
                  value: formatDateLong(booking.date),
                },
                {
                  icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
                  label: 'Heure',
                  value: String(booking.startTime).slice(0, 5),
                },
                {
                  icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
                  label: isKours ? 'Participants' : 'Convives',
                  value: `${booking.guests} personne${booking.guests > 1 ? 's' : ''}`,
                },
                {
                  icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
                  label: 'Montant total',
                  value: formatPrice(booking.totalPriceInCents),
                  bold: true,
                  purple: true,
                },
              ].map(({ icon, label, value, bold, purple }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icon}
                    </svg>
                    <span className="text-[13px] text-[#6b7280]">{label}</span>
                  </div>
                  <span className={`text-[13px] ${bold ? 'font-bold text-[15px]' : 'font-semibold'} ${purple ? 'text-[#c1a0fd]' : 'text-[#111125]'}`}>
                    {value}
                  </span>
                </div>
              ))}
              {booking.service.durationMinutes && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="text-[13px] text-[#6b7280]">Durée estimée</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#111125]">{booking.service.durationMinutes} min</span>
                </div>
              )}
              {isKours && booking.service.koursDifficulty && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    <span className="text-[13px] text-[#6b7280]">Niveau</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#111125]">🎓 {booking.service.koursDifficulty}</span>
                </div>
              )}
              {isKours && booking.service.koursLocation && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-[13px] text-[#6b7280]">Lieu du cours</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#111125]">📍 {booking.service.koursLocation}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {booking.notes && !editMode && (
              <div className="mt-4 p-4 bg-[#f2f4fc] rounded-[14px]">
                <p className="text-[12px] text-[#6b7280] font-semibold uppercase tracking-wide mb-1.5">Notes</p>
                <p className="text-[14px] text-[#111125] leading-relaxed whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}

            {/* Client info (visible to kooker) */}
            {isKooker && (
              <div className="mt-4 p-4 bg-[#f2f4fc] rounded-[14px]">
                <p className="text-[12px] text-[#6b7280] font-semibold uppercase tracking-wide mb-3">Client</p>
                <div className="flex items-center gap-3">
                  <Avatar firstName={clientUser.firstName} lastName={clientUser.lastName} avatar={clientUser.avatar} size={36} />
                  <div>
                    <p className="text-[14px] font-semibold text-[#111125]">{clientUser.firstName} {clientUser.lastName}</p>
                    <p className="text-[12px] text-[#6b7280]">{clientUser.email}</p>
                    {clientUser.phone && <p className="text-[12px] text-[#6b7280]">{clientUser.phone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Edit form ── */}
          {canEdit && (
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-bold text-[#111125]">
                  {editMode ? 'Modifier la réservation' : 'Modification possible'}
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f3ecff] text-[#c1a0fd] text-[13px] font-semibold rounded-[10px] hover:bg-[#ebe0ff] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                )}
              </div>

              {!editMode && (
                <p className="text-[13px] text-[#6b7280]">
                  {isOwner
                    ? 'Vous pouvez modifier la date, l\'heure, le nombre de convives et les notes tant que la réservation est en attente.'
                    : 'Vous pouvez modifier la date, l\'heure et les notes tant que la réservation n\'est pas terminée.'}
                </p>
              )}

              {editMode && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full h-[44px] rounded-[12px] border border-[#e0e2ef] px-4 text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">Heure</label>
                      <input
                        type="time"
                        value={editTime}
                        onChange={e => setEditTime(e.target.value)}
                        className="w-full h-[44px] rounded-[12px] border border-[#e0e2ef] px-4 text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {isOwner && (
                    <div>
                      <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">{isKours ? 'Nombre de participants' : 'Nombre de convives'}</label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={editGuests}
                        onChange={e => setEditGuests(parseInt(e.target.value, 10) || 1)}
                        className="w-full h-[44px] rounded-[12px] border border-[#e0e2ef] px-4 text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
                      />
                      {editGuests !== booking.guests && (
                        <p className="text-[12px] text-[#c1a0fd] mt-1">
                          Nouveau montant estimé : {formatPrice(booking.service.priceInCents * editGuests)}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="Instructions particulières, allergies, préférences..."
                      rows={3}
                      className="w-full rounded-[12px] border border-[#e0e2ef] px-4 py-3 text-[14px] text-[#111125] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 h-[48px] rounded-[12px] border border-[#e0e2ef] text-[14px] font-medium text-[#6b7280] hover:border-[#c1a0fd] hover:text-[#111125] transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 h-[48px] rounded-[12px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[14px] font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</>
                      ) : 'Sauvegarder les modifications'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/messages?to=${otherPersonId}`)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-[#e0e2ef] text-[#111125] text-[14px] font-semibold rounded-[12px] hover:border-[#c1a0fd] hover:text-[#c1a0fd] transition-all shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Contacter {isOwner ? kookerUser.firstName : clientUser.firstName}
            </button>

            {isOwner && booking.status === 'completed' && (
              hasReview
                ? <span className="flex items-center gap-1.5 px-5 py-3 text-[14px] font-semibold text-green-600 bg-white border border-green-200 rounded-[12px] shadow-sm">✓ Avis laissé</span>
                : <button
                    onClick={() => { setShowReviewModal(true); setReviewRating(0); setReviewComment(''); }}
                    className="flex items-center gap-2 px-5 py-3 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[14px] font-semibold rounded-[12px] transition-all shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Laisser un avis
                  </button>
            )}

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button
                onClick={() => navigate(isOwner ? '/tableau-de-bord' : '/kooker-dashboard')}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-[#fca5a5] text-[#ef4444] text-[14px] font-semibold rounded-[12px] hover:bg-[#fee2e2] transition-all shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Annuler depuis le dashboard
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Review Modal ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-xl">
            <h2 className="text-[20px] font-semibold text-[#111125] mb-1">Laisser un avis</h2>
            <p className="text-[14px] text-[#828294] mb-5">pour {kookerUser.firstName} {kookerUser.lastName}</p>

            {/* Stars */}
            <div className="flex gap-2 justify-center mb-5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHovered(star)}
                  onMouseLeave={() => setReviewHovered(0)}
                  className="text-[40px] leading-none transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={(reviewHovered || reviewRating) >= star ? 'text-yellow-400' : 'text-[#e0e2ef]'}>★</span>
                </button>
              ))}
            </div>
            {reviewRating > 0 && (
              <p className="text-center text-[13px] text-[#828294] mb-4">
                {['', 'Décevant', 'Peut mieux faire', 'Bien', 'Très bien', 'Excellent !'][reviewRating]}
              </p>
            )}

            {/* Comment */}
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Partagez votre expérience (facultatif)..."
              rows={3}
              className="w-full rounded-[12px] border border-[#e0e2ef] px-4 py-3 text-[14px] text-[#111125] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent resize-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 h-[48px] rounded-[12px] border border-[#e0e2ef] text-[14px] font-medium text-[#6b7280] hover:border-[#c1a0fd] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || reviewSubmitting}
                className="flex-1 h-[48px] rounded-[12px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[14px] font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {reviewSubmitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</>
                  : 'Publier l\'avis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
