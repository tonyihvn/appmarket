import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { SearchBar } from '../components/SearchBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { AppCard } from '../components/AppCard';
import { LoadingGrid } from '../components/Loading';
import { setFeaturedApps, setLoading, setError, setCategories } from '../store/appSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export const LandingPage = () => {
  const dispatch = useAppDispatch();
  const { featuredApps, isLoading, categories } = useAppSelector((state) => state.apps);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));

        // Fetch featured apps
        const appsRes = await api.getFeaturedApps(8);
        if (appsRes.data.success) {
          dispatch(setFeaturedApps(appsRes.data.apps || []));
        } else if (appsRes.data.apps) {
          dispatch(setFeaturedApps(appsRes.data.apps || []));
        }

        // Fetch categories
        const catsRes = await api.getCategories();
        if (catsRes.data.success) {
          dispatch(setCategories(catsRes.data.categories || []));
        } else if (catsRes.data.categories) {
          dispatch(setCategories(catsRes.data.categories || []));
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        const message = error.response?.data?.message || 'Failed to load data';
        dispatch(setError(message));
        toast.error(message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-900 dark:to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-light mb-4">
              Discover & Distribute <span className="gradient-text">Amazing Apps</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              The ultimate marketplace for developers and clients to bring every imagined project to life
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar placeholder="e.g. Point of Sale Apps" />
        </div>
      </section>

      {/* Category Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-8">Browse Categories</h2>
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured Apps Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-light">Featured Apps</h2>
          <Link to="/apps" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <LoadingGrid count={8} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredApps.map((app: any) => (
              <AppCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-light mb-12">
            Why Choose AppsHub?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Lightning Fast',
                description: 'Discover apps instantly with our powerful search and filtering',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure',
                description: 'Safe transactions and verified developers for your peace of mind',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Community',
                description: 'Connect with thousands of developers and companies worldwide',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Growth',
                description: 'Monetize your apps and grow your business with AppsHub',
              },
            ].map((feature, i) => (
              <div key={i} className="card text-center">
                <div className="text-blue-600 dark:text-blue-400 mx-auto mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-light mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers selling their apps on AppsHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link
              to="/submit-app"
              className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
            >
              Submit Your App
            </Link>
            <Link
              to="/request-app"
              className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition"
            >
              Request an App
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              to="/apps"
              className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition"
            >
              Browse Apps
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
