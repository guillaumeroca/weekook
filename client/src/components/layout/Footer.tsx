import { useNavigate } from 'react-router-dom';

const quickLinks = [
  { label: 'Accueil', path: '/' },
  { label: 'A propos', path: '/a-propos' },
  { label: 'Tarification', path: '/tarification' },
  { label: 'Se connecter', path: '/connexion' },
];

const discoverLinks = [
  { label: 'Notre histoire', path: '/a-propos' },
  { label: 'Les avantages Weekook', path: '/avantages' },
  { label: 'Garantie et Confiance', path: '/confiance' },
  { label: 'Meet the Team', path: '#' },
  { label: 'Careers', path: '#' },
];

const helpLinks = [
  { label: 'FAQ', path: '/#faq' },
  { label: 'Contact', path: '#' },
  { label: 'Les Kookers Guides', path: '#' },
];

const legalLinks = [
  { label: 'CGU', path: '#' },
  { label: 'Privacy Policy', path: '#' },
  { label: 'Gestion des cookies', path: '#' },
];

function FooterColumn({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: { label: string; path: string }[];
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-semibold text-[16px] text-[#303044] tracking-[2.56px] uppercase">
        {title}
      </h4>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => onNavigate(link.path)}
            className="font-bold text-[12px] text-[#828294] hover:text-[#c1a0fd] transition-colors text-left cursor-pointer"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    if (path === '#') return;
    navigate(path);
  };

  return (
    <footer className="border-t border-[#ece2fe]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Main Footer Content */}
      <div className="px-4 md:px-12 lg:px-24 py-[48px]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Link Columns */}
          <FooterColumn title="LIENS RAPIDES" links={quickLinks} onNavigate={handleNavigate} />
          <FooterColumn title="DECOUVRIR" links={discoverLinks} onNavigate={handleNavigate} />
          <FooterColumn title="AIDE" links={helpLinks} onNavigate={handleNavigate} />
          <FooterColumn title="LEGAL" links={legalLinks} onNavigate={handleNavigate} />

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <h4 className="font-semibold text-[16px] text-[#303044] tracking-[2.56px] uppercase">
              NEWSLETTER
            </h4>
            <p className="font-bold text-[12px] text-[#828294]">
              Recevez les dernières nouveautés et offres exclusives.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 h-[40px] px-4 rounded-[8px] border border-[#ece2fe] bg-white text-[14px] text-[#303044] placeholder:text-[#828294] outline-none focus:border-[#c1a0fd] transition-colors"
              />
              <button className="h-[40px] px-5 rounded-[8px] bg-[#c1a0fd] text-white font-semibold text-[14px] transition-colors hover:bg-[#b090ed] cursor-pointer shrink-0">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#ece2fe]">
        <div className="px-4 md:px-12 lg:px-24 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate('/')}
              className="font-bold text-[37px] text-[#c1a0fd] tracking-[-0.74px] cursor-pointer"
            >
              WEEKOOK
            </button>
            <span className="text-[12px] text-[#828294]">
              &copy; {new Date().getFullYear()} Weekook. Tous droits réservés.
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="#"
              className="w-[40px] h-[40px] rounded-full border border-[#ece2fe] flex items-center justify-center transition-colors hover:border-[#c1a0fd] hover:bg-[#c1a0fd]/5"
              aria-label="Facebook"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                  stroke="#c1a0fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              className="w-[40px] h-[40px] rounded-full border border-[#ece2fe] flex items-center justify-center transition-colors hover:border-[#c1a0fd] hover:bg-[#c1a0fd]/5"
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  stroke="#c1a0fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  stroke="#c1a0fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="17.5" cy="6.5" r="1.5" fill="#c1a0fd" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="#"
              className="w-[40px] h-[40px] rounded-full border border-[#ece2fe] flex items-center justify-center transition-colors hover:border-[#c1a0fd] hover:bg-[#c1a0fd]/5"
              aria-label="X (Twitter)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z"
                  fill="#c1a0fd"
                />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              className="w-[40px] h-[40px] rounded-full border border-[#ece2fe] flex items-center justify-center transition-colors hover:border-[#c1a0fd] hover:bg-[#c1a0fd]/5"
              aria-label="LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
                  stroke="#c1a0fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="2"
                  y="9"
                  width="4"
                  height="12"
                  stroke="#c1a0fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="4"
                  cy="4"
                  r="2"
                  stroke="#c1a0fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
