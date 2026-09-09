import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Package,
  FileText,
  Star,
  MessageSquare,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import api from '../services/api';
import { Loading } from '../components/Loading';
import toast from 'react-hot-toast';
import { User, App, Category, ProjectRequest, Review } from '../types';

type AdminTab = 'overview' | 'apps' | 'categories' | 'users' | 'projects' | 'bids' | 'reviews' | 'requests';
type UserFilter = 'all' | 'company' | 'freelancer';

interface AppRequest {
  _id: string;
  userId: string;
  appId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  app?: App;
  user?: User;
}

interface OverviewStats {
  totalUsers: number;
  totalApps: number;
  totalProjects: number;
  totalBids: number;
  totalReviews: number;
  totalRequests: number;
}

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Check admin status
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user?.isAdmin, navigate]);

  // State Management
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Overview
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalApps: 0,
    totalProjects: 0,
    totalBids: 0,
    totalReviews: 0,
    totalRequests: 0,
  });

  // Apps
  const [apps, setApps] = useState<App[]>([]);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [editAppForm, setEditAppForm] = useState({ title: '', subtitle: '', featured: false });

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '', slug: '', icon: '', color: '#3B82F6' });

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    isAdmin: false,
  });

  // Projects
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [editingProject, setEditingProject] = useState<ProjectRequest | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    description: '',
    budget: 0,
  });

  // Bids
  const [bids, setBids] = useState<any[]>([]);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);

  // App Requests
  const [appRequests, setAppRequests] = useState<AppRequest[]>([]);

  // Fetch overview data
  const fetchOverviewData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, appsRes, projectsRes, bidsRes, reviewsRes, requestsRes] = await Promise.all([
        api.getAllUsers({ limit: 1 }),
        api.getApps({ limit: 1 }),
        api.getAllProjects({ limit: 1 }),
        api.getAllBids({ limit: 1 }),
        api.getAllReviews({ limit: 1 }),
        api.getAllAppRequests({ limit: 1 }),
      ]);

      setStats({
        totalUsers: usersRes.data?.total || 0,
        totalApps: appsRes.data?.total || 0,
        totalProjects: projectsRes.data?.total || 0,
        totalBids: bidsRes.data?.total || 0,
        totalReviews: reviewsRes.data?.total || 0,
        totalRequests: requestsRes.data?.total || 0,
      });
    } catch (err) {
      console.error('Error fetching overview:', err);
      toast.error('Failed to load dashboard overview');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch apps
  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const response = await api.getApps({ limit: 100 });
      setApps(response.data?.data || response.data?.apps || []);
    } catch (err) {
      console.error('Error fetching apps:', err);
      toast.error('Failed to load apps');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCategories();
      setCategories(response.data?.data || response.data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const typeParam = userFilter !== 'all' ? (userFilter === 'company' ? 'Company' : 'Freelancer') : undefined;
      const response = await api.getAllUsers({ type: typeParam, limit: 100 });
      setUsers(response.data?.data || response.data?.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllProjects({ limit: 100 });
      setProjects(response.data?.data || response.data?.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bids
  const fetchBids = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllBids({ limit: 100 });
      setBids(response.data?.data || response.data?.bids || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
      toast.error('Failed to load bids');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllReviews({ limit: 100 });
      setReviews(response.data?.data || response.data?.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch app requests
  const fetchAppRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllAppRequests({ limit: 100 });
      setAppRequests(response.data?.data || response.data?.requests || []);
    } catch (err) {
      console.error('Error fetching app requests:', err);
      toast.error('Failed to load app requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'apps') {
      fetchApps();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'bids') {
      fetchBids();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'requests') {
      fetchAppRequests();
    }
  }, [activeTab, userFilter]);

  // App Operations
  const handleEditApp = (app: App) => {
    setEditingApp(app);
    setEditAppForm({
      title: app.title,
      subtitle: app.subtitle,
      featured: app.featured,
    });
  };

  const handleSaveApp = async () => {
    if (!editingApp) return;
    try {
      setIsLoading(true);
      await api.updateApp(editingApp._id, {
        title: editAppForm.title,
        subtitle: editAppForm.subtitle,
        featured: editAppForm.featured,
      });
      toast.success('App updated successfully');
      setEditingApp(null);
      fetchApps();
    } catch (err) {
      console.error('Error updating app:', err);
      toast.error('Failed to update app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this app?')) return;
    try {
      setIsLoading(true);
      await api.deleteApp(appId);
      toast.success('App deleted successfully');
      fetchApps();
    } catch (err) {
      console.error('Error deleting app:', err);
      toast.error('Failed to delete app');
    } finally {
      setIsLoading(false);
    }
  };

  // Category Operations
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryForm({
      name: category.name,
      description: category.description,
      slug: category.slug,
      icon: category.icon || '',
      color: category.color || '#3B82F6',
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editCategoryForm.name) return;
    try {
      setIsLoading(true);
      await api.updateCategory(editingCategory.id, editCategoryForm);
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setShowCategoryModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      setIsLoading(true);
      await api.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  // User Operations
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      isAdmin: user.isAdmin || false,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setIsLoading(true);
      await api.updateUserProfile(editUserForm);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setIsLoading(true);
      await api.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  // Project Operations
  const handleEditProject = (project: ProjectRequest) => {
    setEditingProject(project);
    setEditProjectForm({
      title: project.title,
      description: project.description,
      budget: project.budget,
    });
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    try {
      setIsLoading(true);
      // Note: You may need to adjust the API endpoint based on your backend
      await api.updateProjectStatus(editingProject._id, 'open');
      toast.success('Project updated successfully');
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      setIsLoading(true);
      await api.deleteProject(projectId);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  // Bid Operations
  const handleUpdateBidStatus = async (bidId: string, status: 'accepted' | 'rejected') => {
    try {
      setIsLoading(true);
      await api.updateBidStatus(bidId, status);
      toast.success(`Bid ${status} successfully`);
      fetchBids();
    } catch (err) {
      console.error('Error updating bid:', err);
      toast.error('Failed to update bid status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    if (!window.confirm('Are you sure you want to delete this bid?')) return;
    try {
      setIsLoading(true);
      await api.deleteBid(bidId);
      toast.success('Bid deleted successfully');
      fetchBids();
    } catch (err) {
      console.error('Error deleting bid:', err);
      toast.error('Failed to delete bid');
    } finally {
      setIsLoading(false);
    }
  };

  // App Request Operations
  const handleUpdateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setIsLoading(true);
      await api.updateAppRequestStatus(requestId, status);
      toast.success(`Request ${status} successfully`);
      fetchAppRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error('Failed to update request status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      setIsLoading(true);
      await api.deleteAppRequest(requestId);
      toast.success('Request deleted successfully');
      fetchAppRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
      toast.error('Failed to delete request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      setIsLoading(true);
      await api.deleteReviewAdmin(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Failed to delete review');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={32} className="text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage the AppsHub platform</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          {(['overview', 'apps', 'categories', 'users', 'projects', 'bids', 'reviews', 'requests'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading && <Loading />}

      {!isLoading && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
              <StatCard icon={Package} title="Total Apps" value={stats.totalApps} color="bg-green-500" />
              <StatCard icon={FileText} title="Total Projects" value={stats.totalProjects} color="bg-purple-500" />
              <StatCard icon={MessageSquare} title="Total Bids" value={stats.totalBids} color="bg-orange-500" />
              <StatCard icon={Star} title="Total Reviews" value={stats.totalReviews} color="bg-yellow-500" />
              <StatCard icon={AlertCircle} title="App Requests" value={stats.totalRequests} color="bg-red-500" />
            </div>
          )}

          {/* Apps Tab */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              {apps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No apps found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {apps.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{app.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{app.subtitle}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            {app.status}
                          </span>
                          {app.featured && (
                            <span className="px-3 py-1 bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditApp(app)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteApp(app._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setEditCategoryForm({ name: '', description: '', slug: '', icon: '', color: '#3B82F6' });
                  setShowCategoryModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                + Add Category
              </button>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{category.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {category.appCount} apps
                          </p>
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg ml-2 flex-shrink-0"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition text-sm"
                        >
                          <Edit2 size={16} className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition text-sm"
                        >
                          <Trash2 size={16} className="inline mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                {(['all', 'company', 'freelancer'] as UserFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setUserFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      userFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Filter size={16} className="inline mr-2" />
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold text-gray-900 dark:text-white">Name</th>
                        <th className="px-4 py-2 text-left font-bold text-gray-900 dark:text-white">Email</th>
                        <th className="px-4 py-2 text-left font-bold text-gray-900 dark:text-white">Type</th>
                        <th className="px-4 py-2 text-left font-bold text-gray-900 dark:text-white">Rating</th>
                        <th className="px-4 py-2 text-center font-bold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800">
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700">
                          <td className="px-4 py-2 text-gray-900 dark:text-white">{user.fullName}</td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{user.userType}</td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            {Number(user.rating || 0).toFixed(1)} ({user.reviewCount || 0})
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition inline-block"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition inline-block"
                              title="Delete"
                            >
                              <Trash2 size={16} />
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

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No projects found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
                        <div className="flex gap-2 flex-wrap text-xs">
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            Budget: ₦{project.budget.toLocaleString()}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            {project.status}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            {project.bidsCount} bids
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bids Tab */}
          {activeTab === 'bids' && (
            <div className="space-y-4">
              {bids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No bids found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bids.map((bid) => (
                    <div
                      key={bid._id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          Bid Amount: ₦{bid.bidAmount?.toLocaleString() || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{bid.proposal}</p>
                        <div className="flex gap-2 flex-wrap text-xs">
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            Status: {bid.status}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            Delivery: {bid.deliveryDays} days
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {bid.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBidStatus(bid._id, 'accepted')}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Accept"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateBidStatus(bid._id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteBid(bid._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            {review.status}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            {review.helpful} helpful
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition ml-4"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {appRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No app requests found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {appRequests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {request.app?.title || 'App Request'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{request.message}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                            {request.status}
                          </span>
                          {request.user && (
                            <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                              {request.user.fullName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateRequestStatus(request._id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(request._id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(request._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit Category Modal */}
      {showCategoryModal && (
        <Modal title={editingCategory ? 'Edit Category' : 'Add Category'} onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }} onSave={handleSaveCategory}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editCategoryForm.name}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={editCategoryForm.description}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={editCategoryForm.slug}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={editCategoryForm.color}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit App Modal */}
      {editingApp && (
        <Modal title="Edit App" onClose={() => setEditingApp(null)} onSave={handleSaveApp}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editAppForm.title}
                onChange={(e) => setEditAppForm({ ...editAppForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={editAppForm.subtitle}
                onChange={(e) => setEditAppForm({ ...editAppForm, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editAppForm.featured}
                onChange={(e) => setEditAppForm({ ...editAppForm, featured: e.target.checked })}
                className="rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Mark as Featured
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal title="Edit User" onClose={() => setEditingUser(null)} onSave={handleSaveUser}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editUserForm.fullName}
                onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editUserForm.isAdmin}
                onChange={(e) => setEditUserForm({ ...editUserForm, isAdmin: e.target.checked })}
                className="rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Make Admin
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <Modal title="Edit Project" onClose={() => setEditingProject(null)} onSave={handleSaveProject}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editProjectForm.title}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={editProjectForm.description}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget
              </label>
              <input
                type="number"
                value={editProjectForm.budget}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, budget: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper Components
interface StatCardProps {
  icon: any;
  title: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-start gap-4">
      <div className={`${color} p-3 rounded-lg text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, onSave, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
