import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Page non trouvée | Weekook';
  }, []);

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 md:px-8 lg:px-[96px]">
      <div className="text-center">
        <h1 className="text-[120px] md:text-[180px] font-bold leading-none text-[#c1a0fd]">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-[#111125] mt-4">
          Page non trouvée
        </p>
        <p className="text-base text-gray-500 mt-3 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="mt-8 bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-medium px-8 py-3 rounded-[12px] text-base cursor-pointer"
        >
          Retourner à l'accueil
        </Button>
      </div>
    </div>
  );
}
