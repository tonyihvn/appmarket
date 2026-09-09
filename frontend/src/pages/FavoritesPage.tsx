import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import { Loading } from '../components/Loading';
import api from '../services/api';
import toast from 'react-hot-toast';

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserFavorites(page, 12);
        if (response.data.favorites) {
          setFavorites(response.data.favorites);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error: any) {
        toast.error('Failed to load favorites');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, navigate, page]);

  const handleRemoveFavorite = async (appId: string) => {
    try {
      await api.removeFavorite(appId);
      setFavorites(favorites.filter((app) => app._id !== appId));
      toast.success('Removed from favorites');
    } catch (error: any) {
      toast.error('Failed to remove from favorites');
    }
  };

  if (isLoading && favorites.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-light flex items-center gap-3 mb-2">
            <Heart size={32} className="text-red-500" />
            My Favorite Apps
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {favorites.length === 0 ? 'No favorite apps yet' : `${favorites.length} app${favorites.length !== 1 ? 's' : ''} in your favorites`}
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="card text-center py-12">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              You haven't added any favorite apps yet.
            </p>
            <button
              onClick={() => navigate('/apps')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Explore Apps
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((app) => (
              <div key={app._id} className="card hover:shadow-lg transition group">
                {/* Image */}
                <div
                  className="relative mb-4 cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => navigate(`/apps/${app._id}`)}
                >
                  <img
                    src={app.logo}
                    alt={app.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3
                    className="font-bold text-lg text-gray-900 dark:text-light mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => navigate(`/apps/${app._id}`)}
                  >
                    {app.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {app.subtitle}
                  </p>

                  {/* Info */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-yellow-500 font-semibold text-sm">
                        {typeof app.rating === 'number' ? app.rating.toFixed(1) : '0'} ★ ({app.reviewCount || 0})
                      </span>
                      <span className="badge text-xs">
                        {app.isFree ? 'Free' : `₦${app.price?.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {(app.downloadCount / 1000).toFixed(1)}k downloads
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/apps/${app._id}`)}
                      className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(app._id)}
                      className="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      title="Remove from favorites"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {favorites.length > 0 && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
