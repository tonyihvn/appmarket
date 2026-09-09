## AppsHub Project Structure

```
appmarket/
│
├── backend/                          # Express.js API Server
│   ├── src/
│   │   ├── models/                   # MongoDB Models
│   │   │   ├── User.ts               # User schema with authentication
│   │   │   ├── Company.ts            # Company profile model
│   │   │   ├── Freelancer.ts         # Freelancer profile model
│   │   │   ├── App.ts                # App listing model
│   │   │   ├── Category.ts           # App categories
│   │   │   ├── Review.ts             # App reviews
│   │   │   ├── Bid.ts                # Project bids
│   │   │   ├── ProjectRequest.ts     # Project requests
│   │   │   ├── Service.ts            # Developer services
│   │   │   ├── DemoSession.ts        # Demo scheduling
│   │   │   └── BlogPost.ts           # Blog posts
│   │   │
│   │   ├── controllers/              # Business Logic
│   │   │   ├── authController.ts     # Auth logic
│   │   │   ├── userController.ts     # User management
│   │   │   ├── appController.ts      # App management
│   │   │   ├── categoryController.ts # Category operations
│   │   │   ├── reviewController.ts   # Review management
│   │   │   ├── bidController.ts      # Bid management
│   │   │   ├── projectController.ts  # Project operations
│   │   │   └── serviceController.ts  # Service management
│   │   │
│   │   ├── routes/                   # API Routes
│   │   │   ├── auth.ts               # /api/auth
│   │   │   ├── users.ts              # /api/users
│   │   │   ├── apps.ts               # /api/apps
│   │   │   ├── categories.ts         # /api/categories
│   │   │   ├── reviews.ts            # /api/reviews
│   │   │   ├── bids.ts               # /api/bids
│   │   │   ├── projects.ts           # /api/projects
│   │   │   └── services.ts           # /api/services
│   │   │
│   │   ├── middleware/               # Custom Middleware
│   │   │   ├── auth.ts               # JWT authentication
│   │   │   └── validation.ts         # Request validation
│   │   │
│   │   ├── config/
│   │   │   └── database.ts           # MongoDB connection
│   │   │
│   │   └── server.ts                 # Express app setup
│   │
│   ├── .env.example                  # Environment template
│   ├── .gitignore
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   └── README.md
│
├── frontend/                         # React TypeScript App
│   ├── src/
│   │   ├── pages/                    # Page Components
│   │   │   ├── LandingPage.tsx       # Hero + featured apps
│   │   │   ├── LoginPage.tsx         # User login
│   │   │   ├── RegisterPage.tsx      # User registration
│   │   │   ├── AppsPage.tsx          # Browse all apps
│   │   │   ├── AppDetailPage.tsx     # Single app detail
│   │   │   ├── SubmitAppPage.tsx     # App submission form
│   │   │   ├── DashboardPage.tsx     # User dashboard
│   │   │   └── ProjectsPage.tsx      # Project marketplace
│   │   │
│   │   ├── components/               # Reusable Components
│   │   │   ├── Navbar.tsx            # Navigation bar
│   │   │   ├── Footer.tsx            # Footer
│   │   │   ├── SearchBar.tsx         # Search functionality
│   │   │   ├── AppCard.tsx           # App grid card
│   │   │   ├── CategoryGrid.tsx      # Category tiles
│   │   │   └── Loading.tsx           # Loading states
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                # API client (Axios)
│   │   │
│   │   ├── store/                    # Redux State Management
│   │   │   ├── index.ts              # Store configuration
│   │   │   ├── authSlice.ts          # Auth state
│   │   │   └── appSlice.ts           # App state
│   │   │
│   │   ├── hooks/                    # Custom React Hooks
│   │   │   ├── useRedux.ts           # Redux hooks
│   │   │   └── useDarkMode.ts        # Theme toggle
│   │   │
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css           # Global styles
│   │   │
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # Entry point
│   │
│   ├── index.html                    # HTML template
│   ├── .env.example                  # Environment template
│   ├── .gitignore
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.ts            # Tailwind configuration
│   ├── postcss.config.cjs            # PostCSS config
│   ├── vite.config.ts                # Vite configuration
│   └── README.md
│
├── .github/
│   └── copilot-instructions.md       # Development checklist
│
├── README.md                         # Project overview
├── SETUP.md                          # Detailed setup guide
├── QUICKSTART.md                     # Quick start guide
└── PROJECT_STRUCTURE.md              # This file
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Pages (LandingPage, AppDetailPage, etc.)       │    │
│  └─────────────┬──────────────────────────────────┘    │
│                │                                        │
│  ┌─────────────▼──────────────────────────────────┐    │
│  │ Components (AppCard, SearchBar, Navbar, etc.)  │    │
│  └─────────────┬──────────────────────────────────┘    │
│                │                                        │
│  ┌─────────────▼──────────────────────────────────┐    │
│  │ Redux Store (authSlice, appSlice)              │    │
│  └─────────────┬──────────────────────────────────┘    │
│                │                                        │
│  ┌─────────────▼──────────────────────────────────┐    │
│  │ API Service (api.ts - Axios client)            │    │
│  └─────────────┬──────────────────────────────────┘    │
└────────────────┼──────────────────────────────────────┘
                 │ HTTP Requests
                 │
         ┌───────▼────────┐
         │  Backend API   │
         │  (Express.js)  │
         └───────┬────────┘
                 │
         ┌───────▼──────────────┐
         │   Controllers &      │
         │   Business Logic     │
         │   (authController,   │
         │    appController,    │
         │    etc.)            │
         └───────┬──────────────┘
                 │
         ┌───────▼──────────────┐
         │    MongoDB           │
         │    Database          │
         │  (Models stored)     │
         └──────────────────────┘
```

## Key Files Explained

### Backend Entry Point
- `backend/src/server.ts` - Initializes Express, connects to MongoDB, sets up all routes

### Core Models
- **User.ts** - Stores user credentials, profile, and authentication info
- **App.ts** - Stores app listings with metadata (tech stack, price, ratings, etc.)
- **Company.ts** & **Freelancer.ts** - Provider profiles with expertise and verification

### Authentication Flow
1. User registers at `/api/auth/register`
2. Password hashed with bcryptjs
3. JWT token returned and stored in localStorage
4. Token sent with all subsequent requests via Authorization header
5. Auth middleware (`auth.ts`) validates token on protected routes

### API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

## Component Hierarchy

```
App
├── Navbar
│   ├── Search
│   ├── Theme Toggle
│   └── Auth Links
├── Router
│   ├── LandingPage
│   │   ├── SearchBar
│   │   ├── CategoryGrid
│   │   └── AppCard[]
│   ├── AppsPage
│   │   ├── SearchBar
│   │   ├── CategoryGrid
│   │   ├── AppCard[]
│   │   └── Loading
│   ├── AppDetailPage
│   │   └── Review Section
│   ├── DashboardPage
│   │   ├── Stats
│   │   └── AppTable
│   └── ...
└── Footer
```

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for token signing
- `NODE_ENV` - Development or production
- `JWT_EXPIRE` - Token expiration time

### Frontend
- `VITE_API_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_ENV` - Environment (development/production)

## Security Considerations

1. **Password** - Hashed with bcryptjs (10 salt rounds)
2. **Authentication** - JWT tokens with expiration
3. **Protected Routes** - Middleware checks auth before accessing
4. **Validation** - Joi schemas validate all inputs
5. **CORS** - Configured to allow frontend requests only
6. **Environment Variables** - Sensitive data in .env files

## Performance Optimizations

1. **Database Indexing** - Text indexes on app search fields
2. **Pagination** - Limit/skip for large datasets
3. **Code Splitting** - React Router lazy loading
4. **Image Optimization** - Logo and screenshot handling
5. **Caching** - Redux stores API responses

---

For more details, see README.md, SETUP.md, and QUICKSTART.md
