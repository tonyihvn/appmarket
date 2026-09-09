import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Plus,
  Settings,
  LogOut,
  Heart,
  FileText,
  Send,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail as MailIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { Loading } from '../components/Loading';
import toast from 'react-hot-toast';

type TabType = 'apps' | 'projects' | 'bids' | 'favorites';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  status: string;
  bidsCount: number;
  createdAt: string;
  timeline: string;
}

interface Bid {
  id: string;
  projectId: string;
  amount: number;
  proposal: string;
  status: string;
  createdAt: string;
  project?: { title: string };
  bidder?: { fullName: string; email: string };
}

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [userApps, setUserApps] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('apps');
  const [selectedBidders, setSelectedBidders] = useState<string[]>([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
  });
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch user apps if AppBuilder
        if (user?.userType === 'AppBuilder') {
          try {
            const appsResponse = await api.getUserApps();
            if (appsResponse.data.success) {
              setUserApps(appsResponse.data.apps || []);
            }
          } catch (err) {
            console.error('Error fetching apps:', err);
            toast.error('Failed to load your apps');
          }
        }

        // Fetch user projects (for all users)
        try {
          const projectsResponse = await api.getUserProjects();
          if (projectsResponse?.data?.success) {
            setUserProjects(projectsResponse.data.projects || []);
          }
        } catch (err) {
          console.error('Error fetching projects:', err);
          // Don't show error if it's just not implemented
        }

        // Fetch user bids if AppBuilder
        if (user?.userType === 'AppBuilder') {
          try {
            const bidsResponse = await api.getUserBids();
            if (bidsResponse?.data?.success) {
              setUserBids(bidsResponse.data.bids || []);
            }
          } catch (err) {
            console.error('Error fetching bids:', err);
          }
        }

        // Fetch user favorites
        try {
          const favResponse = await api.getUserFavorites(1, 20);
          if (favResponse.data.favorites) {
            setFavorites(favResponse.data.favorites);
          }
        } catch (err) {
          console.error('Error fetching favorites:', err);
          setFavorites([]);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  const toggleBidderSelection = (bidderId: string) => {
    setSelectedBidders((prev) =>
      prev.includes(bidderId) ? prev.filter((id) => id !== bidderId) : [...prev, bidderId]
    );
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (selectedBidders.length === 0) {
      toast.error('Please select at least one bidder');
      return;
    }

    try {
      // Call API to send emails
      // await api.sendBidderEmails({
      //   bidderIds: selectedBidders,
      //   subject: emailData.subject,
      //   message: emailData.message,
      // });
      toast.success(`Email sent to ${selectedBidders.length} bidder(s)`);
      setShowEmailModal(false);
      setEmailData({ subject: '', message: '' });
      setSelectedBidders([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  };

  if (isLoading) return <Loading />;

  const stats = [
    {
      label: 'Total Apps',
      value: userApps.length,
      condition: user?.userType === 'AppBuilder',
    },
    {
      label: 'Total Downloads',
      value: userApps.reduce((sum, app) => sum + (app.downloadCount || 0), 0),
      condition: user?.userType === 'AppBuilder',
    },
    {
      label: 'Projects Posted',
      value: userProjects.length,
      condition: user?.userType === 'Client',
    },
    {
      label: 'Bids Received',
      value: userProjects.reduce((sum, proj) => sum + (proj.bidsCount || 0), 0),
      condition: user?.userType === 'Client',
    },
    {
      label: 'My Bids',
      value: userBids.length,
      condition: user?.userType === 'AppBuilder',
    },
    {
      label: 'Favorites',
      value: favorites.length,
      condition: true,
    },
  ];

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-light">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {user?.userType === 'AppBuilder'
                ? 'Manage your apps and track your performance'
                : 'Manage your projects and track bids'}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {user?.userType === 'AppBuilder' && (
              <button
                onClick={() => navigate('/submit-app')}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Submit App
              </button>
            )}
            {user?.userType === 'Client' && (
              <button
                onClick={() => navigate('/request-app')}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Request App
              </button>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats
            .filter((stat) => stat.condition)
            .map((stat, i) => (
              <div key={i} className="card">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-light">{stat.value}</p>
              </div>
            ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {user?.userType === 'AppBuilder' && (
            <button
              onClick={() => setActiveTab('apps')}
              className={`pb-3 px-1 font-medium transition whitespace-nowrap ${
                activeTab === 'apps'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              My Apps ({userApps.length})
            </button>
          )}
          {user?.userType === 'Client' && (
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-3 px-1 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              <FileText size={18} />
              My Projects ({userProjects.length})
            </button>
          )}
          {userProjects.length > 0 && user?.userType === 'AppBuilder' && (
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-3 px-1 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              <FileText size={18} />
              My Projects ({userProjects.length})
            </button>
          )}
          {user?.userType === 'AppBuilder' && (
            <button
              onClick={() => setActiveTab('bids')}
              className={`pb-3 px-1 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'bids'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              <Send size={18} />
              My Bids ({userBids.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 px-1 font-medium transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
            }`}
          >
            <Heart size={18} />
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'apps' && user?.userType === 'AppBuilder' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light flex items-center gap-2">
                <BarChart3 size={28} />
                My Apps
              </h2>
              <span className="text-gray-600 dark:text-gray-400">{userApps.length} apps</span>
            </div>

            {userApps.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't submitted any apps yet.</p>
                <button
                  onClick={() => navigate('/submit-app')}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Submit Your First App
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">App</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Downloads
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Rating
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userApps.map((app) => (
                      <tr
                        key={app._id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={app.logo} alt={app.title} className="w-10 h-10 rounded" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-light">{app.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{app.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge badge-success capitalize">{app.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-light">
                          {(app.downloadCount / 1000).toFixed(1)}k
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-light">{typeof app.rating === 'number' ? app.rating.toFixed(1) : '0'} ★</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button
                            onClick={() => navigate(`/apps/${app._id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/edit-app/${app._id}`)}
                            className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light flex items-center gap-2">
                <FileText size={28} />
                My Projects
              </h2>
              <span className="text-gray-600 dark:text-gray-400">{userProjects.length} projects</span>
            </div>

            {userProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't posted any projects yet.</p>
                <button
                  onClick={() => navigate('/request-app')}
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Post Your First Project
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Budget
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Timeline
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Bids
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-light max-w-xs truncate">
                            {project.title}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-light">
                          ₦{(project.budget || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{project.timeline}</td>
                        <td className="py-3 px-4">
                          <span className="badge badge-info">{project.bidsCount} bids</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              project.status === 'open' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bids' && user?.userType === 'AppBuilder' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light flex items-center gap-2">
                <Send size={28} />
                My Bids
              </h2>
              <span className="text-gray-600 dark:text-gray-400">{userBids.length} bids</span>
            </div>

            {userBids.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't placed any bids yet.</p>
                <Link
                  to="/projects"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition inline-block"
                >
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Bid Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-light">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBids.map((bid) => (
                      <tr
                        key={bid.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-light max-w-xs truncate">
                            {bid.project?.title || 'Project'}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-light font-medium">
                          ₦{(bid.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              bid.status === 'pending'
                                ? 'badge-warning'
                                : bid.status === 'accepted'
                                  ? 'badge-success'
                                  : 'badge-error'
                            }`}
                          >
                            {bid.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/projects/${bid.projectId}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            View Project
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6 flex items-center gap-2">
              <Heart size={28} className="text-red-500" />
              My Favorite Apps
            </h2>

            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't added any favorite apps yet.
                </p>
                <Link
                  to="/apps"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition inline-block"
                >
                  Browse Apps
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((app) => (
                  <div
                    key={app._id}
                    className="card hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/apps/${app._id}`)}
                  >
                    <img
                      src={app.logo}
                      alt={app.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-bold text-lg text-gray-900 dark:text-light mb-1">{app.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{app.subtitle}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-500 font-semibold">
                        {typeof app.rating === 'number' ? app.rating.toFixed(1) : '0'} ★ ({app.reviewCount || 0})
                      </span>
                      <span className="badge">{app.isFree ? 'Free' : `₦${app.price}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
