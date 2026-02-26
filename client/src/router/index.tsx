import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.default })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.default })));
const KookerProfilePage = lazy(() => import('@/pages/KookerProfilePage').then(m => ({ default: m.default })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.default })));
const PricingPage = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.default })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.default })));
const BenefitsPage = lazy(() => import('@/pages/BenefitsPage').then(m => ({ default: m.default })));
const TrustPage = lazy(() => import('@/pages/TrustPage').then(m => ({ default: m.default })));
const UserDashboardPage = lazy(() => import('@/pages/UserDashboardPage').then(m => ({ default: m.default })));
const KookerDashboardPage = lazy(() => import('@/pages/KookerDashboardPage').then(m => ({ default: m.default })));
const BecomeKookerPage = lazy(() => import('@/pages/BecomeKookerPage').then(m => ({ default: m.default })));
const CreateMenuPage = lazy(() => import('@/pages/CreateMenuPage').then(m => ({ default: m.default })));
const EditMenuPage = lazy(() => import('@/pages/EditMenuPage').then(m => ({ default: m.default })));
const BookingPage = lazy(() => import('@/pages/BookingPage').then(m => ({ default: m.default })));
const FaqPage = lazy(() => import('@/pages/FaqPage').then(m => ({ default: m.default })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.default })));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recherche" element={<SearchPage />} />
          <Route path="/kooker/:id" element={<KookerProfilePage />} />
          <Route path="/tarification" element={<PricingPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/avantages" element={<BenefitsPage />} />
          <Route path="/confiance" element={<TrustPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/tableau-de-bord" element={
            <ProtectedRoute><UserDashboardPage /></ProtectedRoute>
          } />
          <Route path="/devenir-kooker" element={
            <ProtectedRoute><BecomeKookerPage /></ProtectedRoute>
          } />
          <Route path="/kooker-dashboard" element={
            <ProtectedRoute><KookerDashboardPage /></ProtectedRoute>
          } />
          <Route path="/kooker-dashboard/menu/nouveau" element={
            <ProtectedRoute><CreateMenuPage /></ProtectedRoute>
          } />
          <Route path="/kooker-dashboard/menu/:id/editer" element={
            <ProtectedRoute><EditMenuPage /></ProtectedRoute>
          } />
          <Route path="/reservation" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/connexion" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
}
