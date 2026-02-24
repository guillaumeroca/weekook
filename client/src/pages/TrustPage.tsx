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
    <div className="bg-[#f2f4fc] min-h-screen">

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative h-[500px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=600&fit=crop"
          alt="Garantie et confiance Weekook"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center px-4 md:px-8 lg:px-[96px]">
          <div className="max-w-[700px]">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              SÉCURITÉ & CONFIANCE
            </p>
            <h1 className="font-semibold text-white text-[36px] md:text-[56px] tracking-[-1.12px] leading-[1.15] mb-6">
              Garantie et Confiance
            </h1>
            <p className="text-white text-[18px] md:text-[20px] tracking-[-0.4px] leading-[1.5]">
              Votre sécurité et votre tranquillité d'esprit sont au cœur de notre mission. Découvrez comment Weekook protège chaque interaction sur la plateforme.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST PILLARS INTRO ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-16 md:py-20">
        <div className="text-center max-w-[800px] mx-auto">
          <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
            NOS ENGAGEMENTS
          </p>
          <h2 className="font-semibold text-[#111125] text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-6">
            Une plateforme de confiance à 360°
          </h2>
          <p className="text-[18px] text-[#5c5c6f] leading-[1.6]">
            Weekook met en place des mesures strictes pour garantir la sécurité, la transparence et la qualité de chaque expérience culinaire.
          </p>
        </div>
      </section>

      {/* ═══════════════════════ FINANCIAL TRUST ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-12">
        <div className="max-w-5xl mx-auto bg-white rounded-[20px] p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-[#f3ecff] w-[80px] h-[80px] rounded-full flex items-center justify-center mb-6">
                <CreditCard className="size-10 text-[#c1a0fd]" />
              </div>
              <h2 className="font-semibold text-[#111125] text-[28px] md:text-[32px] tracking-[-0.64px] leading-[1.15] mb-4">
                Confiance financière
              </h2>
              <p className="text-[18px] text-[#5c5c6f] leading-[1.6] mb-6">
                Tous les paiements sont centralisés et sécurisés par Weekook. Nous utilisons des systèmes de paiement conformes aux normes bancaires les plus strictes.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Paiements sécurisés
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Cryptage SSL et partenariat avec des prestataires certifiés PCI-DSS pour toutes les transactions
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Système de séquestre
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      L'argent est bloqué jusqu'à la prestation effectuée, garantissant la sécurité pour les deux parties
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Remboursement garanti
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      En cas d'annulation ou de problème, nous gérons les remboursements rapidement
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=700&fit=crop"
                alt="Paiement sécurisé"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PROFILE VERIFICATION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-12">
        <div className="max-w-5xl mx-auto bg-white rounded-[20px] p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-[20px] overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=700&fit=crop"
                alt="Vérification des profils"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-[#f3ecff] w-[80px] h-[80px] rounded-full flex items-center justify-center mb-6">
                <BadgeCheck className="size-10 text-[#c1a0fd]" />
              </div>
              <h2 className="font-semibold text-[#111125] text-[28px] md:text-[32px] tracking-[-0.64px] leading-[1.15] mb-4">
                Vérification des profils
              </h2>
              <p className="text-[18px] text-[#5c5c6f] leading-[1.6] mb-6">
                Chaque kooker est soigneusement vérifié avant de pouvoir proposer ses services sur la plateforme.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <UserCheck className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Vérification d'identité
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Contrôle systématique des pièces d'identité et coordonnées de tous les kookers
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileCheck className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Qualifications validées
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Vérification des diplômes et certifications culinaires le cas échéant
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Système d'avis clients
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Les avis authentifiés permettent de maintenir un haut niveau de qualité
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ DATA SECURITY ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-12">
        <div className="max-w-5xl mx-auto bg-white rounded-[20px] p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-[#f3ecff] w-[80px] h-[80px] rounded-full flex items-center justify-center mb-6">
                <Lock className="size-10 text-[#c1a0fd]" />
              </div>
              <h2 className="font-semibold text-[#111125] text-[28px] md:text-[32px] tracking-[-0.64px] leading-[1.15] mb-4">
                Sécurité des données
              </h2>
              <p className="text-[18px] text-[#5c5c6f] leading-[1.6] mb-6">
                Vos données personnelles sont protégées par les standards de sécurité les plus avancés et conformes au RGPD.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Cryptage des données
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Toutes les informations sensibles sont cryptées en transit et au repos
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Conformité RGPD
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Respect total de la réglementation européenne sur la protection des données
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="size-6 text-[#c1a0fd] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#111125] mb-1">
                      Contrôle de vos données
                    </h3>
                    <p className="text-[15px] text-[#5c5c6f] leading-[1.5]">
                      Vous gardez le contrôle total : accès, modification et suppression à tout moment
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=700&fit=crop"
                alt="Sécurité des données"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ GUARANTEES GRID ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-16 md:py-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#f3ecff] to-white rounded-[20px] p-8 md:p-12 shadow-sm">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              NOS GARANTIES
            </p>
            <h2 className="font-semibold text-[#111125] text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-4">
              Votre satisfaction, notre priorité
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[16px] p-6 text-center">
              <div className="bg-[#f3ecff] w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="size-7 text-[#c1a0fd]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#111125] mb-2">
                Garantie satisfait ou remboursé
              </h3>
              <p className="text-[14px] text-[#5c5c6f] leading-[1.5]">
                Si la prestation ne correspond pas à vos attentes
              </p>
            </div>

            <div className="bg-white rounded-[16px] p-6 text-center">
              <div className="bg-[#f3ecff] w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="size-7 text-[#c1a0fd]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#111125] mb-2">
                Médiation en cas de litige
              </h3>
              <p className="text-[14px] text-[#5c5c6f] leading-[1.5]">
                Notre équipe intervient pour résoudre les conflits
              </p>
            </div>

            <div className="bg-white rounded-[16px] p-6 text-center">
              <div className="bg-[#f3ecff] w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-7 text-[#c1a0fd]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#111125] mb-2">
                Respect des normes d'hygiène
              </h3>
              <p className="text-[14px] text-[#5c5c6f] leading-[1.5]">
                Tous les kookers s'engagent à respecter les normes HACCP
              </p>
            </div>

            <div className="bg-white rounded-[16px] p-6 text-center">
              <div className="bg-[#f3ecff] w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="size-7 text-[#c1a0fd]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#111125] mb-2">
                Assurance responsabilité
              </h3>
              <p className="text-[14px] text-[#5c5c6f] leading-[1.5]">
                Couverture en cas d'incident pendant la prestation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA SECTION ═══════════════════════ */}
      <section className="bg-gradient-to-r from-[#c1a0fd] to-[#9b7dd4] py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-[96px] text-center">
          <h2 className="font-semibold text-white text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-6">
            Prêt à vivre une expérience en toute confiance ?
          </h2>
          <p className="text-[18px] md:text-[20px] text-white leading-[1.5] mb-8 max-w-[700px] mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à Weekook pour leurs expériences culinaires.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/recherche')}
              className="bg-white text-[#c1a0fd] hover:bg-gray-100 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Découvrir les Kookers
            </button>
            <button
              onClick={() => navigate('/devenir-kooker')}
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Devenir Kooker
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
