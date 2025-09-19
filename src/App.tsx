import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const UserSettingsPage = lazy(() => import('./pages/user/UserSettingsPage'));
const UserBookingsPage = lazy(() => import('./pages/user/UserBookingsPage'));
const KookerSettingsPage = lazy(() => import('./pages/kooker/KookerSettingsPage'));
const KookerProfilePage = lazy(() => import('./pages/kooker/KookerProfilePage'));
const KookerBookingsPage = lazy(() => import('./pages/kooker/KookerBookingsPage'));
const KookerCalendarPage = lazy(() => import('./pages/kooker/KookerCalendarPage'));
const KookerMealAvailabilityPage = lazy(() => import('./pages/kooker/KookerMealAvailabilityPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>}>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/kookers/:id" element={<KookerProfilePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
            
            <Route element={<AuthLayout />}>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                } 
              />
            </Route>

            {/* Email verification */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Private routes */}
            <Route element={<MainLayout />}>
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <UserSettingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <UserBookingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kooker-settings"
                element={
                  <PrivateRoute>
                    <KookerSettingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kooker-bookings"
                element={
                  <PrivateRoute>
                    <KookerBookingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kooker-calendar"
                element={
                  <PrivateRoute>
                    <KookerCalendarPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kooker-meal-availability"
                element={
                  <PrivateRoute>
                    <KookerMealAvailabilityPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <MessagesPage />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Not found */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
        <Toaster 
          position="top-right" 
          closeButton={true}
          richColors={true}
          expand={true}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;