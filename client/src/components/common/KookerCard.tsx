import { useNavigate } from 'react-router-dom';

interface KookerCardProps {
  id: number;
  name: string;
  imageUrl: string;
  city: string;
  specialties: string[];
  price: number;
  avatarUrl?: string;
  onClick?: () => void;
}

export default function KookerCard({
  id,
  name,
  imageUrl,
  city,
  specialties,
  price,
  avatarUrl,
  onClick,
}: KookerCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/kooker/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer h-[429px] w-full max-w-[286px] bg-[#f8f9fc] rounded-[20px] overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg flex flex-col"
    >
      {/* Image Area */}
      <div className="relative w-full h-[220px] p-3">
        <div className="w-full h-full rounded-[24px] overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 px-4 pb-4">
        {/* Avatar + Name + City */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#c1a0fd] to-[#8b6fce] flex items-center justify-center text-white font-semibold text-sm">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[15px] text-[#111125] truncate">
              {name}
            </span>
            <span className="text-[13px] text-[#6b7280] truncate">
              {city}
            </span>
          </div>
        </div>

        {/* Specialty Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {specialties.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#ede7fb] text-[#7c5cbf]"
            >
              {spec}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f0f0f0] text-[#6b7280]">
              +{specialties.length - 3}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[18px] font-bold text-[#111125]">
              {price}€
            </span>
            <span className="text-[12px] text-[#6b7280]">/pers.</span>
          </div>
          <span className="text-[13px] font-medium text-[#c1a0fd] group-hover:text-[#b090ed] transition-colors">
            Voir le profil →
          </span>
        </div>
      </div>
    </div>
  );
}
