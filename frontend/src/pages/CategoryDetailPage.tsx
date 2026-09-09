import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { AppCard } from '../components/AppCard';
import { Loading } from '../components/Loading';
import api from '../services/api';
import { setApps, setLoading } from '../store/appSlice';
import { ArrowLeft, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export const CategoryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { apps, isLoading } = useAppSelector((state) => state.apps);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndApps = async () => {
      if (!slug) {
        setError('No category specified');
        dispatch(setLoading(false));
        return;
      }
      
      dispatch(setLoading(true));
      try {
        // Fetch category details using the dedicated endpoint
        console.log('Fetching category with slug:', slug);
        const categoryRes = await api.getCategory(slug);
        console.log('Category Response:', categoryRes);
        
        // Handle both possible response formats
        const foundCategory = categoryRes.data?.category || categoryRes.data?.data || categoryRes.data;
        
        console.log('Found category:', foundCategory);
        
        if (!foundCategory || !foundCategory.id) {
          setError('Category data invalid - missing id');
          dispatch(setLoading(false));
          return;
        }
        
        // Ensure _id is set for consistency
        if (!foundCategory._id) {
          foundCategory._id = foundCategory.id;
        }
        
        setCategory(foundCategory);

        // Fetch apps for this category using the slug
        console.log('Fetching apps for category slug:', foundCategory.slug || slug);
        const appsRes = await api.getApps({ category: foundCategory.slug || slug });
        console.log('Apps Response:', appsRes);
        
        const appsData = appsRes.data?.apps || appsRes.data || [];
        console.log('Apps found:', appsData.length);
        dispatch(setApps(appsData));
      } catch (err: any) {
        console.error('Error fetching category:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load category';
        console.error('Error details:', {
          status: err.response?.status,
          message: err.message,
          data: err.response?.data,
        });
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCategoryAndApps();
  }, [slug, dispatch]);

  if (isLoading) return <Loading />;

  if (error || !category) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-light mb-2">
            {error || 'Category Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? 'There was an error loading this category. Please try again.' : 'The category you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/apps')}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Back to Apps
          </button>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl"
              style={{ backgroundColor: category.color + '20' }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-light">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Filter size={20} />
            <span>{apps.length} apps available</span>
          </div>
        </div>

        {/* Apps Grid */}
        {apps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <AppCard key={app._id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No apps found in this category yet.
            </p>
            <button
              onClick={() => navigate('/submit-app')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Submit an App
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
