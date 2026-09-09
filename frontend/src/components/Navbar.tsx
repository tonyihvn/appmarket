import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, LogOut, Home, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useDarkMode } from '../hooks/useDarkMode';
import { logout } from '../store/authSlice';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">AppsHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 dark:text-light hover:text-blue-600 dark:hover:text-blue-400 transition">
              Explore
            </Link>
            {isAuthenticated && user?.userType === 'AppBuilder' && (
              <Link to="/submit-app" className="text-gray-700 dark:text-light hover:text-blue-600 dark:hover:text-blue-400 transition">
                Submit App
              </Link>
            )}
            <Link to="/projects" className="text-gray-700 dark:text-light hover:text-blue-600 dark:hover:text-blue-400 transition">
              Projects
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                {user?.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition font-bold"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-light hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-light hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-light"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              Explore
            </Link>
            {isAuthenticated && user?.userType === 'AppBuilder' && (
              <Link to="/submit-app" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                Submit App
              </Link>
            )}
            <Link to="/projects" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              Projects
            </Link>

            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition font-bold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-700 dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-700 dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
