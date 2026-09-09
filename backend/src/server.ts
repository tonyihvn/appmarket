import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import sequelize from './config/sequelize';

// Load environment variables
dotenv.config();

// Import all models to register them with Sequelize
import './models/User.sequelize';
import './models/Category.sequelize';
import './models/App.sequelize';
import './models/Review.sequelize';
import './models/Favorite.sequelize';
import './models/ProjectRequest.sequelize';
import './models/AppRequest.sequelize';
import './models/Bid.sequelize';
import './models/Service.sequelize';
import './models/BlogPost.sequelize';
import './models/DemoSession.sequelize';
import './models/Company.sequelize';
import './models/Freelancer.sequelize';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import appRoutes from './routes/apps';
import categoryRoutes from './routes/categories';
import reviewRoutes from './routes/reviews';
import bidRoutes from './routes/bids';
import projectRoutes from './routes/projects';
import serviceRoutes from './routes/services';
import favoriteRoutes from './routes/favorites';
import appRequestRoutes from './routes/appRequests';
import uploadRoutes from './routes/upload';

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Sequelize and sync database
const initializeDB = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Sync database (create tables if they don't exist)
    // Set alter: false to avoid altering existing tables
    // Use force: false to preserve existing data
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ All models synchronized with database.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize database
initializeDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/app-requests', appRequestRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AppsHub API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});

export default app;
