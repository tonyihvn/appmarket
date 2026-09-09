# Quick Start Guide - AppsHub

Get AppsHub running in 5 minutes!

## Prerequisites

- Node.js 16 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Step 1: Clone & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/appshub
JWT_SECRET=your_secret_key_here
NODE_ENV=development
JWT_EXPIRE=7d" > .env

# Start the server
npm run dev
```

The API will be available at `http://localhost:5000`

## Step 2: Setup Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AppsHub
VITE_APP_ENV=development" > .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 3: Test the Application

### Create an Account
1. Go to `http://localhost:3000/register`
2. Sign up as either:
   - **App Builder** (to list and sell apps)
   - **Regular User** (to browse and buy apps)

### Browse Apps
1. Click "Explore" in the navbar
2. Browse categories or use the search bar

### Submit an App (if you registered as App Builder)
1. Go to Dashboard
2. Click "Submit App"
3. Fill in app details and submit

## Database Setup

If using MongoDB locally:

```bash
# On macOS (with Homebrew)
brew services start mongodb-community

# On Windows (with MongoDB installed)
mongod

# On Linux
sudo systemctl start mongod
```

For MongoDB Atlas (Cloud):
1. Create account at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## Project Structure

```
appmarket/
├── backend/
│   ├── src/
│   │   ├── models/       (Database schemas)
│   │   ├── controllers/  (Business logic)
│   │   ├── routes/       (API endpoints)
│   │   ├── middleware/   (Auth, validation)
│   │   └── server.ts     (Entry point)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/        (Page components)
│   │   ├── components/   (UI components)
│   │   ├── services/     (API client)
│   │   ├── store/        (Redux state)
│   │   ├── types/        (TypeScript types)
│   │   └── App.tsx       (Main component)
│   └── package.json
│
└── README.md
```

## Available Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Sign up page
- `/apps` - Browse all apps
- `/apps/:id` - App details
- `/projects` - Project marketplace

### Protected Routes (After Login)
- `/dashboard` - User dashboard
- `/submit-app` - Submit new app
- `/profile` - Profile settings

## API Endpoints Overview

```
Authentication
POST /api/auth/register
POST /api/auth/login

Apps
GET  /api/apps
POST /api/apps
GET  /api/apps/:id
PUT  /api/apps/:id
DELETE /api/apps/:id

Projects
GET  /api/projects
POST /api/projects
GET  /api/projects/:id

Services
GET  /api/services
POST /api/services
GET  /api/services/:id
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB is accessible on the specified host

### CORS Errors
- Ensure backend is running on `http://localhost:5000`
- Update `VITE_API_URL` if backend port changed

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# The dist/ folder contains your production-ready files
```

## Next Steps

1. Customize the design in `frontend/src/styles/globals.css`
2. Add more features (payments, notifications, etc.)
3. Deploy to your hosting provider
4. Set up email verification
5. Add image uploads

## Support

For issues or questions:
1. Check the SETUP.md for detailed documentation
2. Review the code comments
3. Check API responses for error messages

## License

MIT

Happy coding! 🚀
