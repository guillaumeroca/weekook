import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Users, CalendarClock, Star, Search, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const featuredKookers = [
  {
    id: 1,
    name: "Marie Dubois",
    profileImage: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
    coverImage: "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg",
    specialties: ["Pâtisserie française", "Macarons"],
    location: "Lyon",
    rating: 4.9,
    reviewCount: 124,
    pricePerPerson: 45
  },
  {
    id: 2,
    name: "Thomas Martin",
    profileImage: "https://images.pexels.com/photos/3771101/pexels-photo-3771101.jpeg",
    coverImage: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
    specialties: ["Cuisine italienne", "Pizza"],
    location: "Marseille",
    rating: 4.8,
    reviewCount: 89,
    pricePerPerson: 35
  },
  {
    id: 3,
    name: "Sophie Laurent",
    profileImage: "https://images.pexels.com/photos/3771110/pexels-photo-3771110.jpeg",
    coverImage: "https://images.pexels.com/photos/6287295/pexels-photo-6287295.jpeg",
    specialties: ["Cuisine japonaise", "Sushi"],
    location: "Paris",
    rating: 4.7,
    reviewCount: 156,
    pricePerPerson: 50
  }
];

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-cover bg-center" style={{ 
        backgroundImage: "url('https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" 
      }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            La cuisine à domicile <br />entre particuliers
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl">
            Des passionnés qui viennent chez vous. Pour transmettre, partager, et se régaler !
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/search" 
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg text-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Trouver un Kooker
              </Link>
              <Link 
                to="/signup" 
                className="bg-white hover:bg-gray-100 text-gray-800 font-medium px-6 py-3 rounded-lg text-lg transition-colors inline-flex items-center justify-center"
              >
                Devenir Kooker
              </Link>
            </div>
          ) : (
            <Link 
              to="/search" 
              className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg text-lg transition-colors inline-flex items-center justify-center gap-2 max-w-xs"
            >
              <Search size={20} />
              Trouver un Kooker
            </Link>
          )}
        </div>
      </section>

      {/* Featured Kookers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Découvrez nos Kookers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des passionnés de cuisine près de chez vous
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredKookers.map((kooker) => (
              <Link 
                key={kooker.id}
                to={`/kookers/${kooker.id}`}
                className="bg-white rounded-xl border-2 border-primary/10 hover:border-primary shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative h-48">
                  <img 
                    src={kooker.coverImage} 
                    alt={`Spécialité de ${kooker.name}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Profile Image */}
                  <div className="absolute -bottom-6 left-6">
                    <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                      <img 
                        src={kooker.profileImage} 
                        alt={kooker.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{kooker.name}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin size={14} />
                        <span>{kooker.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{kooker.rating}</span>
                      <span className="text-gray-500 text-sm">({kooker.reviewCount})</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {kooker.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-700 mt-4">
                    <Clock size={16} />
                    <span>{kooker.pricePerPerson}€/pers.</span>
                  </div>

                  <div className="mt-6 text-center">
                    <span className="text-primary hover:text-primary/90 font-medium transition-colors">
                      Voir le profil
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              <Search size={20} />
              Voir tous les Kookers
            </Link>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              WEEKOOK vous met en relation avec des passionnés de cuisine pour des moments conviviaux à domicile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inscrivez-vous</h3>
              <p className="text-gray-600">Créez votre compte en quelques clics et rejoignez la communauté WEEKOOK</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trouvez un Kooker</h3>
              <p className="text-gray-600">Découvrez les passionnés de cuisine près de chez vous</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CalendarClock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Réservez une date</h3>
              <p className="text-gray-600">Choisissez un créneau pour un cours ou un repas à domicile</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Partagez un moment</h3>
              <p className="text-gray-600">Profitez d'une expérience culinaire conviviale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Kooker section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img 
                src="https://images.pexels.com/photos/4259707/pexels-photo-4259707.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Cours de cuisine" 
                className="rounded-xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Devenez Kooker</h2>
              <p className="text-xl text-gray-600 mb-6">
                Vous aimez cuisiner et partager ? Proposez des cours de cuisine ou des repas à domicile et gagnez un revenu complémentaire.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Définissez vos créneaux et votre rémunération</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Proposez des cours ou des repas selon vos spécialités</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Rencontrez des passionnés et partagez votre savoir-faire</p>
                </li>
              </ul>
              <Link 
                to={user ? "/settings" : "/signup"} 
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                {user ? "Devenir Kooker" : "S'inscrire comme Kooker"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les expériences de notre communauté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-medium">Sophie L.</h4>
                  <p className="text-gray-600 text-sm">A pris des cours de pâtisserie</p>
                </div>
              </div>
              <p className="text-gray-700">
                "J'ai appris à faire des macarons avec Marie. Elle est très pédagogue et l'ambiance était super ! Je recommande vivement."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-medium">Thomas M.</h4>
                  <p className="text-gray-600 text-sm">Kooker spécialisé en cuisine italienne</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Je donne des cours de cuisine italienne depuis 6 mois. C'est un vrai plaisir de transmettre ma passion et de rencontrer des gens intéressants."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-neutral-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-medium">Marie F.</h4>
                  <p className="text-gray-600 text-sm">A organisé un atelier cuisine</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Pour mon anniversaire, j'ai organisé un atelier sushis avec mes amies. Notre Kooker était génial et nous avons passé un super moment !"
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à rejoindre WEEKOOK ?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Rejoignez notre communauté de passionnés et partagez des moments conviviaux autour de la cuisine
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white hover:bg-gray-100 text-primary font-medium px-6 py-3 rounded-lg text-lg transition-colors"
            >
              S'inscrire gratuitement
            </Link>
            <Link 
              to="/login" 
              className="bg-transparent hover:bg-white/10 text-white border border-white font-medium px-6 py-3 rounded-lg text-lg transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;