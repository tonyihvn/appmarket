import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { AppCard } from '../components/AppCard';
import { Loading } from '../components/Loading';
import { SearchBar } from '../components/SearchBar';
import api from '../services/api';
import { setApps, setLoading } from '../store/appSlice';
import { ArrowLeft } from 'lucide-react';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { apps, isLoading } = useAppSelector((state) => state.apps);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);

    const searchApps = async () => {
      if (!query.trim()) {
        dispatch(setApps([]));
        dispatch(setLoading(false));
        setHasSearched(false);
        return;
      }

      dispatch(setLoading(true));
      setHasSearched(true);
      try {
        const response = await api.getApps({ search: query });
        // Handle different response structures
        const appsData = response.data?.apps || response.data || [];
        dispatch(setApps(Array.isArray(appsData) ? appsData : []));
      } catch (error) {
        console.error('Error searching apps:', error);
        dispatch(setApps([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    searchApps();
  }, [searchParams, dispatch]);

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/apps')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition"
          >
            <ArrowLeft size={20} />
            Back to Apps
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-light mb-6">
            Search Results
          </h1>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Results Info - Only show if we have a search query and results */}
          {searchQuery && apps.length > 0 && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">"{searchQuery}"</span> returned{' '}
                  <span className="font-semibold">{apps.length}</span>{' '}
                  {apps.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section - Only show if we have results */}
        {hasSearched && apps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <AppCard key={app._id} app={app} />
            ))}
          </div>
        )}

        {/* No Results or Empty State - Only show if we searched and have no results */}
        {hasSearched && apps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
              No apps found matching "<span className="font-semibold">{searchQuery}</span>"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/request-app')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Request Custom App
              </button>
              <button
                onClick={() => navigate('/apps')}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-light font-medium rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Browse All Apps
              </button>
            </div>
          </div>
        )}

        {/* Initial State - No search yet */}
        {!hasSearched && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Enter a search query to find apps
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
