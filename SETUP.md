# AppsHub - Complete Setup & Deployment Guide

## Project Overview

**AppsHub** is a professional full-stack application for buying, selling, and distributing software applications. This guide covers the complete setup, features, and deployment process.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   AppsHub Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐          ┌──────────────────┐    │
│  │   Frontend App   │          │   Backend API    │    │
│  │  (React + Vite)  │ ◄─────► │ (Express + Node) │    │
│  │  TypeScript      │          │  TypeScript      │    │
│  │  Tailwind CSS    │          │  MongoDB         │    │
│  └──────────────────┘          └──────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Features Implemented

### 1. **User Management**
- Multi-role authentication (AppBuilder, RegularUser)
- User profiles with JWT tokens
- Company and Freelancer profile creation
- User rating and badging system

### 2. **Marketplace Features**
- Browse featured apps in grid layout
- Category-based filtering
- Full-text search functionality
- App detail pages with reviews
- Live demo scheduling

### 3. **Developer Tools**
- App submission workflow
- App management dashboard
- Service listings
- Blog/update publishing capability

### 4. **Community Features**
- Project bidding system
- Review and rating system
- Developer ranking and verification

### 5. **UI/UX Design**
- Dark/Light mode toggle
- Responsive design (Mobile, Tablet, Desktop)
- Professional component library
- Smooth animations and transitions

## Backend Database Models

### User
- Full Name, Email, Phone
- Password (hashed with bcryptjs)
- User Type (AppBuilder/RegularUser)
- Email Verification Status
- Rating, Badges, Profile Picture

### Company
- Company Name, Logo, Website
- Address, Email, Phone
- Expertise Areas
- Verification Status

### Freelancer
- Personal Info, Phone, Website
- Tech Stack, About
- Portfolio Links
- Expertise Areas

### App
- Title, Subtitle, Description
- Tech Stack, Category
- Price (nullable for free apps)
- Screenshots, Logo
- Rating, Download Count
- Status (draft/published/archived)

### Category
- Name, Slug, Description
- Icon, Color
- App Count

### Review
- Rating (1-5), Comment
- Helpful Count
- Status (pending/approved/rejected)

### Bid
- Amount, Proposal, Delivery Days
- Status (pending/accepted/rejected/completed)

### ProjectRequest
- Title, Description, Budget
- Category, Required Skills
- Timeline, Status

### Service
- Title, Description, Price
- Delivery Time, Revisions
- Rating, Review Count

### BlogPost
- Title, Content, Excerpt
- Featured Image, Tags
- View Count, Published Status

### DemoSession
- Scheduled Date, Duration
- Meeting Link
- Status (scheduled/completed/cancelled)

## Backend API Endpoints

### Authentication
```
POST /api/auth/register       - Register new user
POST /api/auth/login          - Login user
POST /api/auth/verify-email   - Verify email
```

### Users
```
GET  /api/users/profile                    - Get user profile
PUT  /api/users/profile                    - Update profile
POST /api/users/company-profile            - Create company profile
POST /api/users/freelancer-profile         - Create freelancer profile
GET  /api/users/company/:userId            - Get company by user
GET  /api/users/freelancer/:userId         - Get freelancer by user
GET  /api/users/type/:type                 - Get users by type
```

### Apps
```
GET    /api/apps                           - List all apps
GET    /api/apps/:id                       - Get single app
POST   /api/apps                           - Create app (Protected)
PUT    /api/apps/:id                       - Update app (Protected)
DELETE /api/apps/:id                       - Delete app (Protected)
GET    /api/apps/category/:slug            - Get apps by category
GET    /api/apps/featured                  - Get featured apps
GET    /api/apps/search                    - Search apps
GET    /api/apps/user/my-apps              - Get user's apps (Protected)
```

### Categories
```
GET    /api/categories                     - List all categories
GET    /api/categories/:slug               - Get single category
POST   /api/categories                     - Create category
```

### Reviews
```
GET    /api/reviews/:appId                 - Get app reviews
POST   /api/reviews                        - Create review (Protected)
PUT    /api/reviews/:id                    - Update review (Protected)
DELETE /api/reviews/:id                    - Delete review (Protected)
```

### Bids
```
GET    /api/bids/project/:projectId        - Get project bids
POST   /api/bids                           - Create bid (Protected)
PUT    /api/bids/:id/status                - Update bid status (Protected)
GET    /api/bids/user/my-bids              - Get user's bids (Protected)
```

## Frontend Routes

```
/                        - Landing page
/login                   - Login page
/register                - Registration page
/apps                    - Browse all apps
/apps/:id                - App detail page
/submit-app              - Submit new app (Protected)
/dashboard               - User dashboard (Protected)
/category/:slug          - Category-filtered apps
/search?q=query          - Search results
```

## Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your settings
# MONGODB_URI=mongodb://localhost:27017/appshub
# JWT_SECRET=your_secret_key

# Run in development
npm run dev

# The server will start on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev

# The app will open on http://localhost:3000
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appshub
JWT_SECRET=your_super_secret_key
NODE_ENV=development
JWT_EXPIRE=7d
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AppsHub
VITE_APP_ENV=development
```

## Key Technologies

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Validation
- **Axios** - HTTP client

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Styling & Design System

### Tailwind CSS Configuration
- Primary Color: `#3B82F6` (Blue)
- Secondary Color: `#8B5CF6` (Purple)
- Accent Color: `#EC4899` (Pink)
- Dark Mode: Fully supported with `dark:` prefix

### Component Patterns
- Consistent badge system for labels
- Reusable card component
- Loading states and skeletons
- Error handling with toast notifications
- Responsive grid layouts

## Authentication Flow

1. User registers with email, phone, and password
2. Password is hashed with bcrypt
3. JWT token is generated and sent to client
4. Token stored in localStorage
5. Token included in all protected API requests
6. Server validates token on each request

## Development Workflow

### Code Structure
```
backend/
├── src/
│   ├── models/           # Database schemas
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation
│   ├── config/           # Database config
│   └── server.ts         # Entry point
└── package.json

frontend/
├── src/
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── services/         # API client
│   ├── store/            # Redux slices
│   ├── types/            # TypeScript types
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Global CSS
│   └── App.tsx           # Root component
└── index.html
```

### Best Practices
- Use TypeScript interfaces for type safety
- Follow RESTful API conventions
- Implement proper error handling
- Use Redux for complex state
- Lazy load routes for better performance
- Add loading and error states to UI

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set secure JWT secret
- [ ] Configure MongoDB for production
- [ ] Build frontend: `npm run build`
- [ ] Build backend: `npm run build`
- [ ] Set up CORS for production domain
- [ ] Configure SSL/HTTPS
- [ ] Set up email verification
- [ ] Implement payment processing
- [ ] Set up logging and monitoring
- [ ] Configure CDN for static assets

## Future Enhancements

1. **Payment Integration**
   - Stripe/Paypal integration
   - Wallet system for users

2. **Advanced Features**
   - Live chat support
   - Real-time notifications
   - Advanced analytics dashboard

3. **Mobile App**
   - React Native mobile application
   - Push notifications

4. **Performance**
   - Image optimization and compression
   - Caching strategies
   - Database indexing optimization

5. **Security**
   - Two-factor authentication
   - Rate limiting
   - Input sanitization
   - CSRF protection

## Support & Documentation

For API documentation, see `/api-docs`
For component documentation, check component JSDoc comments
For issues, create an issue on GitHub

## License

MIT

## Author

AppsHub Development Team
