import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Star, Trash2 } from 'lucide-react';

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

  useEffect(() => { document.title = 'Admin — Témoignages | Weekook'; }, []);

  const fetch = async () => {
    setLoading(true);
    const res = await api.get<AdminTestimonial[]>('/admin/testimonials');
    if (res.success && res.data) setTestimonials(res.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleFeatured = async (id: number, current: boolean) => {
    const res = await api.put(`/admin/testimonials/${id}`, { featured: !current });
    if (res.success) fetch();
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Supprimer ce témoignage ?')) return;
    const res = await api.delete(`/admin/testimonials/${id}`);
    if (res.success) fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111125] mb-6">Témoignages</h1>

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
  );
}
