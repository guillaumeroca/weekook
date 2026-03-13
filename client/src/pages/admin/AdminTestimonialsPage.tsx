import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Star, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface AdminTestimonial {
  id: number;
  authorName: string;
  authorRole: string | null;
  content: string;
  rating: number;
  featured: boolean;
  createdAt: string;
  kookerProfile: { user: { firstName: string; lastName: string } } | null;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Admin — Témoignages | Weekook'; }, []);

  const fetchAll = async () => {
    setLoading(true);
    const res = await api.get<AdminTestimonial[]>('/admin/testimonials');
    if (res.success && res.data) setTestimonials(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleFeatured = async (id: number, current: boolean) => {
    const res = await api.put(`/admin/testimonials/${id}`, { featured: !current });
    if (res.success) fetchAll();
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Supprimer ce témoignage ?')) return;
    const res = await api.delete(`/admin/testimonials/${id}`);
    if (res.success) fetchAll();
  };

  const openModal = () => {
    setName(''); setRole(''); setContent(''); setRating(5); setHovered(0); setFeatured(false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 10 || !name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post<AdminTestimonial>('/testimonials', {
        authorName: name.trim(),
        authorRole: role.trim() || undefined,
        content: content.trim(),
        rating,
      });
      if (res.success && res.data && featured) {
        await api.put(`/admin/testimonials/${res.data.id}`, { featured: true });
      }
      toast.success('Témoignage ajouté');
      setShowModal(false);
      fetchAll();
    } catch {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111125]">Témoignages</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-sm font-medium rounded-[12px] transition-colors"
        >
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {testimonials.map(t => (
            <div key={t.id} className={`bg-white rounded-[20px] p-5 flex gap-4 items-start border-2 transition-colors ${t.featured ? 'border-[#c1a0fd]/30' : 'border-transparent'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#111125]">{t.authorName}</span>
                  {t.authorRole && <span className="text-xs text-gray-400">{t.authorRole}</span>}
                  <div className="flex gap-0.5 ml-auto">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{t.content}</p>
                <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toggleFeatured(t.id, t.featured)}
                  title={t.featured ? 'Retirer de la une' : 'Mettre en avant'}
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
                    t.featured
                      ? 'bg-[#c1a0fd] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#c1a0fd]/10 hover:text-[#c1a0fd]'
                  }`}
                >
                  {t.featured ? '★ En avant' : '☆ Mettre en avant'}
                </button>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="bg-white rounded-[20px] p-8 text-center text-gray-400 text-sm">
              Aucun témoignage
            </div>
          )}
        </div>
      )}
    </div>

    {/* ── Add Testimonial Modal ── */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-[20px] p-6 w-full max-w-[460px] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#111125]">Ajouter un témoignage</h2>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stars */}
          <div className="flex gap-2 justify-center mb-5">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-[36px] leading-none transition-transform hover:scale-110 focus:outline-none"
              >
                <span className={(hovered || rating) >= star ? 'text-yellow-400' : 'text-[#e0e2ef]'}>★</span>
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">Nom affiché</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sophie L."
              className="w-full h-[44px] rounded-[12px] border border-[#e0e2ef] px-4 text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
            />
          </div>

          <div className="mb-3">
            <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">Profil <span className="font-normal text-[#9ca3af]">(facultatif)</span></label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Cliente depuis 2024…"
              className="w-full h-[44px] rounded-[12px] border border-[#e0e2ef] px-4 text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-[#111125] mb-1.5">Témoignage</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Décrivez l'expérience Weekook…"
              rows={3}
              className="w-full rounded-[12px] border border-[#e0e2ef] px-4 py-3 text-[14px] text-[#111125] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent resize-none"
            />
            {content.trim().length > 0 && content.trim().length < 10 && (
              <p className="text-[12px] text-red-400 mt-1">Minimum 10 caractères.</p>
            )}
          </div>

          <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#c1a0fd] rounded"
            />
            <span className="text-[13px] text-[#111125] font-medium">Mettre en avant immédiatement</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 h-[48px] rounded-[12px] border border-[#e0e2ef] text-[14px] font-medium text-[#6b7280] hover:border-[#c1a0fd] transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={content.trim().length < 10 || !name.trim() || submitting}
              className="flex-1 h-[48px] rounded-[12px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[14px] font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</>
                : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
