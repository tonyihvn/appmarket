import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { AppCard } from '../components/AppCard';
import { LoadingGrid } from '../components/Loading';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setApps, setLoading, setError, setCategories } from '../store/appSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AppsPage = () => {
  const dispatch = useAppDispatch();
  const { apps, isLoading, categories } = useAppSelector((state) => state.apps);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));

        // Fetch categories
        const catsRes = await api.getCategories();
        if (catsRes.data.success) {
          dispatch(setCategories(catsRes.data.categories || []));
        } else if (catsRes.data.categories) {
          dispatch(setCategories(catsRes.data.categories || []));
        }

        // Fetch apps
        const params: any = { limit: 24, sortBy };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;

        const appsRes = await api.getApps(params);
        if (appsRes.data.success) {
          dispatch(setApps(appsRes.data.apps || []));
        } else if (appsRes.data.apps) {
          dispatch(setApps(appsRes.data.apps || []));
        }
      } catch (error: any) {
        console.error('Error loading apps:', error);
        const message = error.response?.data?.message || 'Failed to load apps';
        dispatch(setError(message));
        toast.error(message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch, selectedCategory, searchQuery, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-light mb-6">Discover Apps</h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-light mb-6">Categories</h2>
          <CategoryGrid
            categories={categories}
            onCategoryClick={(slug) => setSelectedCategory(slug)}
          />
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-light">
            {selectedCategory ? `${selectedCategory} Apps` : 'All Apps'}
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-48"
          >
            <option value="-createdAt">Newest</option>
            <option value="-rating">Highest Rated</option>
            <option value="-downloadCount">Most Downloaded</option>
          </select>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          <LoadingGrid count={12} />
        ) : apps.length === 0 ? (
          <div className="card text-center py-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-light mb-4">
              No apps found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find an app matching your criteria. Would you like us to build it for you?
            </p>
            <Link
              to="/request-app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Request Custom App
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <AppCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
