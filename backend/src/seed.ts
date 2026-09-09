import dotenv from 'dotenv';
import sequelize from './config/sequelize';
import Category from './models/Category.sequelize';
import User from './models/User.sequelize';

dotenv.config();

const categories = [
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Financial and accounting applications',
    icon: '💰',
    color: '#10B981',
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Educational and learning tools',
    icon: '📚',
    color: '#3B82F6',
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Entertainment and media applications',
    icon: '🎬',
    color: '#F59E0B',
  },
  {
    name: 'Events',
    slug: 'events',
    description: 'Event management and ticketing',
    icon: '🎪',
    color: '#EC4899',
  },
  {
    name: 'AI Apps',
    slug: 'ai',
    description: 'Artificial Intelligence powered applications',
    icon: '🤖',
    color: '#8B5CF6',
  },
  {
    name: 'Government',
    slug: 'government',
    description: 'Government and public sector solutions',
    icon: '🏛️',
    color: '#6366F1',
  },
  {
    name: 'Company ERPs',
    slug: 'erp',
    description: 'Enterprise Resource Planning systems',
    icon: '⚙️',
    color: '#1F2937',
  },
  {
    name: 'Social Apps',
    slug: 'social',
    description: 'Social networking and communication',
    icon: '👥',
    color: '#06B6D4',
  },
  {
    name: 'Video',
    slug: 'video',
    description: 'Video streaming and editing tools',
    icon: '🎥',
    color: '#EF4444',
  },
  {
    name: 'Automobile',
    slug: 'automobile',
    description: 'Automotive and transportation solutions',
    icon: '🚗',
    color: '#0EA5E9',
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports and fitness applications',
    icon: '⚽',
    color: '#22C55E',
  },
  {
    name: 'Ministry',
    slug: 'ministry',
    description: 'Religious and ministry management tools',
    icon: '⛪',
    color: '#A78BFA',
  },
];

async function seedDatabase() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    // Sync all models
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Database synchronized');

    // Add isAdmin column if it doesn't exist
    try {
      const table = await sequelize.getQueryInterface().describeTable('users');
      if (!table.isAdmin) {
        console.log('📝 Adding isAdmin column to users table...');
        await sequelize.getQueryInterface().addColumn('users', 'isAdmin', {
          type: require('sequelize').DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        });
        console.log('✅ Added isAdmin column');
      }
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.log('ℹ️  isAdmin column already exists or error checking column');
      }
    }

    // Seed Categories
    // Check if categories already exist to avoid foreign key issues
    const existingCategoryCount = await Category.count();
    
    if (existingCategoryCount === 0) {
      console.log('🗑️  Clearing existing categories');
      await Category.destroy({ where: {} });
    }
    
    // Only insert new categories if none exist
    if (existingCategoryCount === 0) {
      await Category.bulkCreate(categories);
      console.log(`✅ Seeded ${categories.length} categories`);
    } else {
      console.log(`ℹ️  Categories already exist (${existingCategoryCount}), skipping seed`);
    }

    // Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@appshub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      // Create new admin user - password will be hashed by beforeCreate hook
      await User.create({
        fullName: 'Admin User',
        email: adminEmail,
        phone: '+234 (123) 456-7890',
        password: adminPassword,
        userType: 'RegularUser',
        isEmailVerified: true,
        isAdmin: true,
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔐 Password: ${adminPassword}`);
    } else {
      // Update existing admin user to ensure isAdmin is true
      await existingAdmin.update({ isAdmin: true });
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      console.log(`   📧 Email: ${adminEmail}`);
    }

    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}



seedDatabase();
