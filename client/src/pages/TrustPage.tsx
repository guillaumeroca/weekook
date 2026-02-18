import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle,
  BadgeCheck,
  UserCheck,
  FileCheck,
  Lock,
  Shield,
  Scale,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// ─── TrustPage Component ────────────────────────────────────────────────────

export default function TrustPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Garantie et Confiance | Weekook';
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f4fc]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative w-full h-[280px] md:h-[340px] lg:h-[480px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=600&fit=crop"
          alt="Garantie et confiance Weekook"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 lg:px-[96px] text-center">
          <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-[12px] md:text-[13px] tracking-[2.56px] uppercase font-semibold px-5 py-2 rounded-full mb-5">
            Securite & Confiance
          </span>
          <h1 className="font-semibold text-[28px] md:text-[36px] lg:text-[48px] text-white leading-tight mb-4">
            Garantie et Confiance
          </h1>
          <p className="text-white/90 text-[14px] md:text-[16px] lg:text-[18px] max-w-[640px] leading-relaxed">
            La securite de nos utilisateurs est au coeur de notre mission.
            Decouvrez comment Weekook protege chaque experience culinaire.
          </p>
        </div>
      </section>

      {/* ═══════════════════════ TRUST PILLARS INTRO ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]">
        <div className="text-center max-w-[720px] mx-auto">
          <p className="text-[#cdb3fd] text-[14px] md:text-[16px] tracking-[2.56px] uppercase font-semibold mb-3">
            NOS ENGAGEMENTS
          </p>
          <h2 className="text-[#111125] text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-tight mb-5">
            Une plateforme de confiance a 360 degres
          </h2>
          <p className="text-[#5c5c6f] text-[15px] md:text-[16px] leading-relaxed">
            Chez Weekook, nous avons mis en place un ecosysteme complet de securite et de confiance.
            De la verification des profils a la protection financiere, chaque aspect de votre
            experience est pense pour vous offrir une tranquillite d'esprit totale.
          </p>
        </div>
      </section>

      {/* ═══════════════════════ FINANCIAL TRUST ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-[48px] md:pb-[64px] lg:pb-[80px]">
        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Content */}
            <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f3ecff] flex items-center justify-center">
                  <CreditCard className="w-[24px] h-[24px] text-[#c1a0fd]" />
                </div>
                <h3 className="text-[#111125] text-[22px] md:text-[26px] lg:text-[28px] font-semibold">
                  Confiance financiere
                </h3>
              </div>
              <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed mb-8">
                Vos transactions sont protegees a chaque etape. Nous utilisons les technologies
                les plus avancees pour securiser vos paiements et garantir une experience sans risque.
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Paiements securises
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Toutes les transactions sont chiffrees en SSL et conformes aux normes PCI-DSS.
                      Vos donnees bancaires ne sont jamais stockees sur nos serveurs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Systeme de sequestre
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Le montant de votre reservation est bloque jusqu'a la realisation de la
                      prestation. Le Kooker n'est paye qu'une fois le service effectue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Remboursement garanti
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      En cas d'annulation ou de probleme avec une prestation, vous etes integralement
                      rembourse. Notre equipe traite chaque demande sous 48 heures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative min-h-[280px] lg:min-h-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=700&fit=crop"
                alt="Paiement securise"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PROFILE VERIFICATION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-[48px] md:pb-[64px] lg:pb-[80px]">
        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image (left on desktop) */}
            <div className="relative min-h-[280px] lg:min-h-0 order-2 lg:order-1">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&h=700&fit=crop"
                alt="Verification des profils"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-center order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f3ecff] flex items-center justify-center">
                  <BadgeCheck className="w-[24px] h-[24px] text-[#c1a0fd]" />
                </div>
                <h3 className="text-[#111125] text-[22px] md:text-[26px] lg:text-[28px] font-semibold">
                  Verification des profils
                </h3>
              </div>
              <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed mb-8">
                Chaque Kooker passe par un processus de verification rigoureux avant de pouvoir
                proposer ses services sur la plateforme.
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserCheck className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Verification d'identite
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Chaque Kooker doit fournir une piece d'identite valide. Nous verifions
                      l'authenticite de chaque document pour garantir la fiabilite des profils.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileCheck className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Qualifications validees
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Les competences et l'experience de chaque Kooker sont evaluees. Les certifications
                      et diplomes en cuisine sont verifies lorsqu'ils sont declares.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Systeme d'avis clients
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Les avis sont publies en toute transparence apres chaque prestation.
                      Seuls les clients ayant effectivement reserve peuvent laisser un avis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ DATA SECURITY ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-[48px] md:pb-[64px] lg:pb-[80px]">
        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Content */}
            <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f3ecff] flex items-center justify-center">
                  <Lock className="w-[24px] h-[24px] text-[#c1a0fd]" />
                </div>
                <h3 className="text-[#111125] text-[22px] md:text-[26px] lg:text-[28px] font-semibold">
                  Securite des donnees
                </h3>
              </div>
              <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed mb-2">
                Vos donnees personnelles sont protegees selon les standards les plus stricts.
                Weekook est pleinement conforme au RGPD.
              </p>
              <span className="inline-flex items-center gap-2 text-[#c1a0fd] text-[13px] font-semibold mb-8">
                <Shield className="w-[14px] h-[14px]" />
                Conforme RGPD
              </span>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Cryptage des donnees
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Toutes vos donnees sont chiffrees en transit et au repos grace aux protocoles
                      de securite les plus avances (TLS 1.3, AES-256).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Conformite RGPD
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Nous respectons scrupuleusement le Reglement General sur la Protection des
                      Donnees. Vous avez un droit d'acces, de modification et de suppression de vos donnees.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#f3ecff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-[18px] h-[18px] text-[#c1a0fd]" />
                  </div>
                  <div>
                    <h4 className="text-[#111125] text-[15px] md:text-[16px] font-semibold mb-1">
                      Controle de vos donnees
                    </h4>
                    <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
                      Vous gardez le controle total sur vos informations personnelles. Vous pouvez
                      a tout moment consulter, exporter ou supprimer vos donnees depuis votre espace.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative min-h-[280px] lg:min-h-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=700&fit=crop"
                alt="Securite des donnees"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ GUARANTEES GRID ═══════════════════════ */}
      <section
        className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]"
        style={{ background: 'linear-gradient(180deg, #f3ecff 0%, #ffffff 100%)' }}
      >
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[#cdb3fd] text-[14px] md:text-[16px] tracking-[2.56px] uppercase font-semibold mb-3">
            NOS GARANTIES
          </p>
          <h2 className="text-[#111125] text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-tight mb-4">
            Des garanties concretes pour vous proteger
          </h2>
          <p className="text-[#5c5c6f] text-[15px] md:text-[16px] max-w-[560px] mx-auto">
            Weekook s'engage a vous offrir une experience culinaire en toute serenite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Guarantee 1 */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-[16px] bg-[#f3ecff] flex items-center justify-center mb-5">
              <Shield className="w-[28px] h-[28px] text-[#c1a0fd]" />
            </div>
            <h4 className="text-[#111125] text-[16px] md:text-[17px] font-semibold mb-2">
              Garantie satisfait ou rembourse
            </h4>
            <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
              Si la prestation ne correspond pas a vos attentes, nous vous remboursons
              integralement. Votre satisfaction est notre priorite.
            </p>
          </div>

          {/* Guarantee 2 */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-[16px] bg-[#f3ecff] flex items-center justify-center mb-5">
              <Scale className="w-[28px] h-[28px] text-[#c1a0fd]" />
            </div>
            <h4 className="text-[#111125] text-[16px] md:text-[17px] font-semibold mb-2">
              Mediation en cas de litige
            </h4>
            <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
              En cas de desaccord, notre equipe de mediation intervient rapidement pour
              trouver une solution equitable entre les deux parties.
            </p>
          </div>

          {/* Guarantee 3 */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-[16px] bg-[#f3ecff] flex items-center justify-center mb-5">
              <CheckCircle className="w-[28px] h-[28px] text-[#c1a0fd]" />
            </div>
            <h4 className="text-[#111125] text-[16px] md:text-[17px] font-semibold mb-2">
              Respect des normes d'hygiene
            </h4>
            <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
              Tous les Kookers s'engagent a respecter les normes d'hygiene alimentaire en vigueur.
              Nous effectuons des controles reguliers.
            </p>
          </div>

          {/* Guarantee 4 */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-[56px] h-[56px] rounded-[16px] bg-[#f3ecff] flex items-center justify-center mb-5">
              <FileCheck className="w-[28px] h-[28px] text-[#c1a0fd]" />
            </div>
            <h4 className="text-[#111125] text-[16px] md:text-[17px] font-semibold mb-2">
              Assurance responsabilite
            </h4>
            <p className="text-[#5c5c6f] text-[13px] md:text-[14px] leading-relaxed">
              Chaque prestation est couverte par une assurance responsabilite civile professionnelle.
              Vous etes protege en toutes circonstances.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA SECTION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]">
        <div
          className="rounded-[20px] px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #c1a0fd 0%, #9b7de8 100%)' }}
        >
          <h2 className="text-white text-[24px] md:text-[32px] lg:text-[38px] font-semibold leading-tight mb-5 max-w-[640px] mx-auto">
            Pret a vivre une experience en toute confiance ?
          </h2>
          <p className="text-white/85 text-[14px] md:text-[16px] leading-relaxed max-w-[520px] mx-auto mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance a Weekook pour
            des experiences culinaires uniques et securisees.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/recherche')}
              className="h-[52px] px-8 rounded-[12px] bg-white text-[#c1a0fd] hover:bg-white/90 font-semibold text-[15px] transition-colors cursor-pointer"
            >
              Decouvrir les Kookers
            </button>
            <button
              onClick={() => navigate('/devenir-kooker')}
              className="h-[52px] px-8 rounded-[12px] border-2 border-white text-white hover:bg-white/15 font-semibold text-[15px] transition-colors cursor-pointer"
            >
              Devenir Kooker
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
