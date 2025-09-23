import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, ChefHat, Settings, MessageCircle, TrendingUp, Clock, Euro } from 'lucide-react';

const KookerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingBookings: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
    totalClients: 0
  });

  useEffect(() => {
    // TODO: Charger les statistiques réelles depuis l'API
    setStats({
      pendingBookings: 3,
      confirmedBookings: 8,
      totalEarnings: 1250,
      totalClients: 15
    });
  }, []);

  if (!user?.isKooker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Cette page est réservée aux Kookers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour {user.firstName || 'Kooker'} ! 👨‍🍳
          </h1>
          <p className="text-orange-50">Bienvenue dans votre espace Kooker</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmées</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.confirmedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Euro className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenus</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEarnings}€</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/kooker-bookings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer les réservations</h3>
                <p className="text-sm text-gray-600">Valider, refuser et suivre vos réservations</p>
              </div>
            </div>
          </Link>

          <Link
            to="/kooker-settings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Settings className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profil & Paramètres</h3>
                <p className="text-sm text-gray-600">Modifier votre profil et vos spécialités</p>
              </div>
            </div>
          </Link>

          <Link
            to="/messages"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-200 rounded-lg">
                <MessageCircle className="h-6 w-6 text-orange-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Communiquer avec vos clients</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Switch to Client Mode */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Mode Client</h3>
              <p className="text-sm text-gray-600">
                Basculer vers votre interface client pour réserver chez d'autres Kookers
              </p>
            </div>
            <Link
              to="/user-dashboard"
              className="bg-orange-200 hover:bg-orange-300 text-orange-800 px-4 py-2 rounded-lg transition-colors"
            >
              Accéder au mode Client
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KookerDashboard;