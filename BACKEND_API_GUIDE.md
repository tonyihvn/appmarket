# Backend API Endpoints Implementation Guide

This document outlines the backend endpoints required to support the new SettingsPage features and company/badge system.

## User Profile Endpoints

### PUT `/api/users/profile`
Update user profile information including bio, phone, profile picture, and passport image.

**Request Body:**
```typescript
{
  fullName?: string;
  phone?: string;
  bio?: string;
  profilePicture?: string; // Base64 encoded image
  passportImage?: string;  // Base64 encoded image
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: User;
}
```

---

## Social Media Endpoints

### PUT `/api/users/social-media`
Update user's social media links.

**Request Body:**
```typescript
{
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: User;
}
```

---

## Company Endpoints

### POST `/api/companies`
Create a new company profile for a user.

**Request Body:**
```typescript
{
  companyName: string;
  companyAbout: string;
  companyLogo?: string; // Base64 encoded image
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  company: {
    id: string;
    userId: string;
    companyName: string;
    companyLogo?: string;
    companyAbout: string;
    createdAt: string;
  };
}
```

### PUT `/api/companies/:companyId`
Update company information.

**Request Body:**
```typescript
{
  companyName?: string;
  companyAbout?: string;
  companyLogo?: string; // Base64 encoded image
}
```

### GET `/api/companies`
Get user's companies list.

**Response:**
```typescript
{
  success: boolean;
  companies: Array<{
    id: string;
    userId: string;
    companyName: string;
    companyLogo?: string;
    createdAt: string;
  }>;
}
```

### GET `/api/companies/saved`
Get all saved companies from other users (for dropdown selector).

**Response:**
```typescript
{
  success: boolean;
  companies: Array<{
    id: string;
    companyName: string;
    companyLogo?: string;
  }>;
}
```

---

## Password Management Endpoint

### POST `/api/users/change-password`
Change user password.

**Request Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## Badge and Ranking Endpoints

### GET `/api/badges`
Get all badge definitions (admin endpoint).

**Response:**
```typescript
{
  success: boolean;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    score: number;
    category: string; // 'achievement', 'speed', 'quality', 'reliability'
  }>;
}
```

### GET `/api/users/:userId/badges`
Get user's earned badges.

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      score: number;
      earnedDate: string;
    }>;
    totalBadgeScore: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    level: number;
  };
}
```

### POST `/api/users/:userId/badges`
Award badge to user (admin/system endpoint).

**Request Body:**
```typescript
{
  badgeId: string;
  reason: string; // e.g., "Project completed successfully"
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  badge: Badge;
}
```

---

## Project/Bid Endpoints

### GET `/api/users/projects`
Get user's projects (client users only).

**Query Parameters:**
- `status`: 'active' | 'completed' | 'cancelled' (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**
```typescript
{
  success: boolean;
  projects: Array<{
    id: string;
    title: string;
    budget: number;
    timeline: string;
    bidsCount: number;
    status: string;
    createdAt: string;
    selectedBidder?: {
      id: string;
      fullName: string;
      company?: string;
    };
  }>;
  total: number;
  page: number;
}
```

### GET `/api/users/bids`
Get user's bids (app builder users only).

**Query Parameters:**
- `status`: 'pending' | 'accepted' | 'rejected' | 'completed' (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**
```typescript
{
  success: boolean;
  bids: Array<{
    id: string;
    projectTitle: string;
    bidAmount: number;
    status: string;
    createdAt: string;
    project: {
      id: string;
      clientName: string;
      timeline: string;
    };
  }>;
  total: number;
  page: number;
}
```

---

## Project Selection/Award Endpoint

### POST `/api/projects/:projectId/select-bidder`
Select winning bidder for a project.

**Request Body:**
```typescript
{
  bidderId: string;
  bidId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  project: {
    id: string;
    selectedBidder: {
      id: string;
      fullName: string;
      company?: string;
    };
  };
}
```

---

## Rating/Review Endpoints

### POST `/api/projects/:projectId/rate`
Rate a completed project and selected bidder/company.

**Request Body:**
```typescript
{
  rating: number; // 1-5
  comment?: string;
  bidId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  review: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  };
  awardedBadges: Array<{
    id: string;
    name: string;
    score: number;
  }>;
}
```

---

## Badge Calculation Rules

### Tier Calculation
- **Bronze**: 0-99 points
- **Silver**: 100-499 points
- **Gold**: 500-999 points
- **Platinum**: 1000+ points

### Level Calculation
- Level increases every 50 points within a tier
- Max level: Varies by tier

### Points Award System
- **Successful Project Completion**: 10 points
- **5-Star Rating**: 50 points
- **4-Star Rating**: 35 points
- **3-Star Rating**: 20 points
- **Early Project Completion** (before deadline): +5-15 bonus points
- **100% Customer Satisfaction**: +25 bonus points
- **First 5 Projects**: +5 points each

### Badge Definitions

#### Achievement Badges
- `first_project` - Complete your first project (1pt)
- `five_star_master` - Receive 5-star rating (50pts)
- `trusted_seller` - Maintain 4.5+ rating for 10 projects (75pts)
- `top_performer` - Top 5% of platform users (100pts)

#### Speed Badges
- `speed_demon` - Complete 3 projects 1 week early (20pts)
- `quick_turnaround` - Complete 5+ projects in a month (40pts)
- `deadline_keeper` - 100% on-time delivery (60pts)

#### Quality Badges
- `quality_focus` - Zero negative reviews on 10 projects (80pts)
- `client_favorite` - 20+ projects completed (100pts)
- `excellence_master` - Average rating 4.8+ on 50 projects (150pts)

#### Reliability Badges
- `responsive_pro` - Always reply within 24 hours (30pts)
- `reliable_partner` - 50+ successful projects (120pts)
- `industry_expert` - Specialized expertise badge (awarded by admin) (200pts)

---

## Image Upload Handling

### Base64 Encoding Strategy
- Frontend converts images to base64 before sending
- Backend validates size (max 5MB)
- Backend validates format (JPG, PNG, GIF only)
- Store in database or cloud storage (S3, Cloudinary)

### Image Storage Options
1. **Database**: Store base64 in user record (simple, limited scale)
2. **Local File System**: Store in `/uploads/` directory (development friendly)
3. **Cloud Storage**: AWS S3, Cloudinary, Firebase Storage (production recommended)

### Recommended Implementation
```typescript
// backend/src/utils/imageHandler.ts
interface ImageUploadResult {
  url: string;
  size: number;
  format: string;
}

export async function handleImageUpload(
  base64Data: string,
  imageType: 'profile' | 'passport' | 'company'
): Promise<ImageUploadResult> {
  // 1. Validate base64 format
  // 2. Decode and validate file
  // 3. Check file size (max 5MB)
  // 4. Verify image format
  // 5. Upload to storage (local or cloud)
  // 6. Return URL
}
```

---

## Error Handling

### Standard Error Response
```typescript
{
  success: false;
  message: string; // User-friendly error message
  error?: string;  // Technical details (development only)
  status: number;  // HTTP status code
}
```

### Status Codes
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

---

## Authentication

All endpoints (except public routes) require:
```
Authorization: Bearer <JWT_TOKEN>
```

Token should contain `userId` for database lookups.

---

## Implementation Priority

### Phase 1 (High Priority)
1. User profile update endpoint
2. Social media update endpoint
3. Company CRUD endpoints
4. Password change endpoint

### Phase 2 (Medium Priority)
1. User projects/bids list endpoints
2. Project bidder selection endpoint
3. Rating/review endpoint
4. Badge award endpoint (basic)

### Phase 3 (Low Priority)
1. Badge calculation automation
2. Tier system updates
3. Admin badge management endpoints
4. Analytics/reporting endpoints
