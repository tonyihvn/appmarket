import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppsPage } from './pages/AppsPage';
import { AppDetailPage } from './pages/AppDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubmitAppPage } from './pages/SubmitAppPage';
import { EditAppPage } from './pages/EditAppPage';
import { RequestAppPage } from './pages/RequestAppPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OnboardingProfilePage } from './pages/OnboardingProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Styles
import './styles/globals.css';
import 'react-quill/dist/quill.snow.css';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="flex flex-col min-h-screen bg-light dark:bg-dark">
            <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/onboarding/profile"
                element={
                  <ProtectedRoute requiredAuth={true}>
                    <OnboardingProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/apps/:id" element={<AppDetailPage />} />
              <Route path="/category/:slug" element={<CategoryDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/submit-app" element={<SubmitAppPage />} />
              <Route
                path="/edit-app/:id"
                element={
                  <ProtectedRoute requiredAuth={true}>
                    <EditAppPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request-app"
                element={
                  <ProtectedRoute requiredAuth={true}>
                    <RequestAppPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredAuth={true}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute requiredAuth={true}>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredAuth={true}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Placeholder routes */}
              <Route
                path="*"
                element={
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-light mb-4">
                        Page Not Found
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This page is still under development
                      </p>
                      <a
                        href="/"
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>

          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
