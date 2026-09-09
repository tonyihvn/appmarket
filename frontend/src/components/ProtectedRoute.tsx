import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  requiredUserType?: 'AppBuilder' | 'RegularUser';
}

export const ProtectedRoute = ({
  children,
  requiredAuth = true,
  requiredUserType,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check authentication
  if (requiredAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user type if specified
  if (requiredUserType && user?.userType !== requiredUserType) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-4">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-light mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
