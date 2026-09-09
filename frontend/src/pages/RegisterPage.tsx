import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAppDispatch } from '../hooks/useRedux';
import { registerSuccess, setError, setLoading } from '../store/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setLoadingState] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'RegularUser' as 'AppBuilder' | 'RegularUser',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoadingState(true);
      dispatch(setLoading(true));

      const response = await api.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
      });

      if (response.data.success) {
        dispatch(
          registerSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        );

        toast.success('Registration successful!');
        navigate(formData.userType === 'AppBuilder' ? '/onboarding/profile' : '/');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-light">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Join AppsHub to start your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                Full Name
              </label>
              <div className="relative">
                {!formData.fullName && <User className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="input-field pl-16"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                Phone Number
              </label>
              <div className="relative">
                {!formData.phone && <Phone className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-field pl-16"
                  placeholder="+234 8012345678"
                />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                I want to
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="RegularUser">Browse & Buy Apps</option>
                <option value="AppBuilder">Build & Sell Apps</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                Password
              </label>
              <div className="relative">
                {!formData.password && <Lock className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field pl-16"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                Confirm Password
              </label>
              <div className="relative">
                {!formData.confirmPassword && <Lock className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field pl-16"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
