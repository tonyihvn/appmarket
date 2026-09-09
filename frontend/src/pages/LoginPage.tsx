import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAppDispatch } from '../hooks/useRedux';
import { loginSuccess, setError, setLoading } from '../store/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setLoadingState] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoadingState(true);
      dispatch(setLoading(true));

      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        );

        toast.success('Logged in successfully!');
        // Redirect to admin dashboard if admin, otherwise to regular dashboard
        if (response.data.user?.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-light">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Sign in to your AppsHub account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                Email Address
              </label>
              <div className="relative">
                {!formData.email && <Mail className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-16"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-light">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                {!formData.password && <Lock className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-16"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              Remember me
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
