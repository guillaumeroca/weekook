import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, MessageCircle, Settings, Search, ChefHat, TrendingUp, Clock } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    unreadMessages: 0,
    favoriteKookers: 0
  });

  useEffect(() => {
    // TODO: Charger les statistiques réelles depuis l'API
    setStats({
      totalBookings: 5,
      upcomingBookings: 2,
      unreadMessages: 3,
      favoriteKookers: 4
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {user?.firstName || 'Utilisateur'} ! 👋
          </h1>
          <p className="text-gray-600">Bienvenue dans votre espace WeeKooK</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Réservations totales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">À venir</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Messages non lus</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kookers favoris</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.favoriteKookers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/search"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Trouver un Kooker</h3>
                <p className="text-sm text-gray-600">Découvrir et réserver chez nos chefs</p>
              </div>
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mes réservations</h3>
                <p className="text-sm text-gray-600">Gérer vos réservations passées et à venir</p>
              </div>
            </div>
          </Link>

          <Link
            to="/messages"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Communiquer avec vos Kookers</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Mon profil</h3>
              <p className="text-sm text-gray-600">
                Gérer vos informations personnelles et préférences
              </p>
            </div>
            <Link
              to="/settings"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Modifier mon profil
            </Link>
          </div>
        </div>

        {/* Become Kooker */}
        {!user?.isKooker && (
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Devenir Kooker
                </h3>
                <p className="text-primary-50">
                  Partagez votre passion culinaire et cuisinez pour d'autres passionnés
                </p>
              </div>
              <Link
                to="/settings"
                className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;