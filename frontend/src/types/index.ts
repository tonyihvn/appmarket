/**
 * User related types
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: 'AppBuilder' | 'RegularUser';
  isEmailVerified: boolean;
  isAdmin?: boolean;
  profilePicture?: string;
  passportImage?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  badges: Badge[];
  totalBadgeScore?: number;
  // Social Media
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  // Company Info
  companyId?: string;
  company?: Company;
  companyName?: string;
  companyLogo?: string;
  companyAbout?: string;
  // Reputation
  successfulProjects?: number;
  totalProjects?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  score: number;
  earnedDate: string;
}

export interface UserBadging {
  userId: string;
  badges: Badge[];
  totalScore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  level: number;
}

export interface Company {
  _id: string;
  userId: string;
  companyName: string;
  logo?: string;
  information: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  expertise: string[];
  employees?: number;
  founded?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Freelancer {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  personalWebsite?: string;
  techStack: string[];
  about: string;
  expertise: string[];
  portfolio?: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * App related types
 */
export interface App {
  _id: string;
  userId: string;
  title: string;
  subtitle: string;
  description: string;
  techStack: string[];
  logo: string;
  screenshots: string[];
  category: Category;
  price: number | null;
  isFree: boolean;
  isSaaS: boolean;
  isOffline: boolean;
  githubRepository?: string;
  distributionFormat: 'executable' | 'web' | 'source' | 'hybrid';
  deploymentMethod?: string[];
  officialWebsite?: string;
  liveDemo?: string;
  documentation?: string;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  appCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Review related types
 */
export interface Review {
  _id: string;
  appId: string;
  userId: string;
  rating: number;
  comment: string;
  helpful: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

/**
 * Bidding related types
 */
export interface ProjectRequest {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  category: string;
  requiredSkills: string[];
  timeline: string;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'closed' | 'completed';
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  projectId: string;
  bidderId: string;
  bidAmount: number;
  proposal: string;
  deliveryDays: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Demo and Service related types
 */
export interface DemoSession {
  _id: string;
  appId: string;
  buyerId: string;
  sellerId: string;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  tags: string[];
  portfolio?: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  userId: string;
  appId?: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Auth types
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
