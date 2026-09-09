import axios, { AxiosInstance } from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear authentication state
          store.dispatch(logout());
          
          // Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  register(data: any) {
    return this.api.post('/auth/register', data);
  }

  login(data: any) {
    return this.api.post('/auth/login', data);
  }

  verifyEmail(data: any) {
    return this.api.post('/auth/verify-email', data);
  }

  // User endpoints
  getUserProfile() {
    return this.api.get('/users/profile');
  }

  updateUserProfile(data: any) {
    return this.api.put('/users/profile', data);
  }

  createCompanyProfile(data: any) {
    return this.api.post('/users/company-profile', data);
  }

  createFreelancerProfile(data: any) {
    return this.api.post('/users/freelancer-profile', data);
  }

  getCompanyProfile(userId: string) {
    return this.api.get(`/users/company/${userId}`);
  }

  getFreelancerProfile(userId: string) {
    return this.api.get(`/users/freelancer/${userId}`);
  }

  getUsersByType(type: string, limit?: number, skip?: number) {
    return this.api.get(`/users/type/${type}`, {
      params: { limit, skip },
    });
  }

  // App endpoints
  getApps(params?: any) {
    return this.api.get('/apps', { params });
  }

  getApp(id: string) {
    return this.api.get(`/apps/${id}`);
  }

  createApp(data: any) {
    return this.api.post('/apps', data);
  }

  updateApp(id: string, data: any) {
    return this.api.put(`/apps/${id}`, data);
  }

  deleteApp(id: string) {
    return this.api.delete(`/apps/${id}`);
  }

  getAppsByCategory(categorySlug: string, params?: any) {
    return this.api.get(`/apps/category/${categorySlug}`, { params });
  }

  getFeaturedApps(limit?: number) {
    return this.api.get('/apps/featured', {
      params: { limit },
    });
  }

  // Project/Request endpoints
  getProjectRequests(params?: any) {
    return this.api.get('/projects', { params });
  }

  getProjectRequest(id: string) {
    return this.api.get(`/projects/${id}`);
  }

  createProjectRequest(data: any) {
    return this.api.post('/projects', data);
  }

  updateProjectStatus(id: string, status: string) {
    return this.api.put(`/projects/${id}/status`, { status });
  }

  getUserProjects() {
    return this.api.get('/projects/user/my-projects');
  }

  searchApps(query: string, limit?: number) {
    return this.api.get('/apps/search', {
      params: { q: query, limit },
    });
  }

  getUserApps() {
    return this.api.get('/apps/user/my-apps');
  }

  // Category endpoints
  getCategories() {
    return this.api.get('/categories');
  }

  getCategory(slug: string) {
    return this.api.get(`/categories/${slug}`);
  }

  // Admin category endpoints
  createCategory(data: any) {
    return this.api.post('/categories', data);
  }

  updateCategory(id: string, data: any) {
    return this.api.put(`/categories/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.api.delete(`/categories/${id}`);
  }

  // Review endpoints
  getAppReviews(appId: string, params?: any) {
    return this.api.get(`/reviews/${appId}`, { params });
  }

  createReview(data: any) {
    return this.api.post('/reviews', data);
  }

  updateReview(id: string, data: any) {
    return this.api.put(`/reviews/${id}`, data);
  }

  deleteReview(id: string) {
    return this.api.delete(`/reviews/${id}`);
  }

  // Bid endpoints
  getBids(projectId: string, params?: any) {
    return this.api.get(`/bids/project/${projectId}`, { params });
  }

  createBid(data: any) {
    return this.api.post('/bids', data);
  }

  updateBidStatus(id: string, status: string) {
    return this.api.put(`/bids/${id}/status`, { status });
  }

  getUserBids() {
    return this.api.get('/bids/user/my-bids');
  }

  // Favorite endpoints
  addFavorite(appId: string) {
    return this.api.post('/favorites', { appId });
  }

  removeFavorite(appId: string) {
    return this.api.delete(`/favorites/${appId}`);
  }

  getUserFavorites(page?: number, limit?: number) {
    return this.api.get('/favorites/list', {
      params: { page, limit },
    });
  }

  isFavorited(appId: string) {
    return this.api.get(`/favorites/check/${appId}`);
  }

  getFavoriteCount(appId: string) {
    return this.api.get(`/favorites/count/${appId}`);
  }

  // App Request endpoints
  createAppRequest(appId: string, message: string) {
    return this.api.post('/app-requests', { appId, message });
  }

  getPublisherAppRequests(page?: number, limit?: number, status?: string) {
    return this.api.get('/app-requests/publisher/all', {
      params: { page, limit, status },
    });
  }

  getAppRequests(appId: string, page?: number, limit?: number) {
    return this.api.get(`/app-requests/app/${appId}`, {
      params: { page, limit },
    });
  }

  updateAppRequestStatus(requestId: string, status: string) {
    return this.api.put(`/app-requests/${requestId}/status`, { status });
  }

  getUserAppRequests(page?: number, limit?: number) {
    return this.api.get('/app-requests/user/my-requests', {
      params: { page, limit },
    });
  }

  replyToAppRequest(requestId: string, replyMessage: string) {
    return this.api.put(`/app-requests/${requestId}/reply`, { replyMessage });
  }

  deleteAppRequest(requestId: string) {
    return this.api.delete(`/app-requests/${requestId}`);
  }

  // Upload endpoints
  uploadLogo(formData: FormData) {
    return this.api.post('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  uploadScreenshot(formData: FormData) {
    return this.api.post('/upload/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  uploadEditorImage(formData: FormData) {
    return this.api.post('/upload/editor-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Admin endpoints for dashboard
  getAllUsers(params?: any) {
    return this.api.get('/users/admin/all', { params });
  }

  getAllProjects(params?: any) {
    return this.api.get('/projects/admin/all', { params });
  }

  getAllBids(params?: any) {
    return this.api.get('/bids/admin/all', { params });
  }

  getAllReviews(params?: any) {
    return this.api.get('/reviews/admin/all', { params });
  }

  getAllAppRequests(params?: any) {
    return this.api.get('/app-requests/admin/all', { params });
  }

  deleteUser(userId: string) {
    return this.api.delete(`/users/${userId}`);
  }

  deleteProject(projectId: string) {
    return this.api.delete(`/projects/${projectId}`);
  }

  deleteBid(bidId: string) {
    return this.api.delete(`/bids/${bidId}`);
  }

  deleteReviewAdmin(reviewId: string) {
    return this.api.delete(`/reviews/admin/${reviewId}`);
  }
}

export default new ApiService();
