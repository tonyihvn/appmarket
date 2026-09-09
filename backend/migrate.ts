import sequelize from './src/config/sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    const queryInterface = sequelize.getQueryInterface();
    
    // Check if columns already exist
    const table = await queryInterface.describeTable('app_requests');
    
    if (!table.replyMessage) {
      await queryInterface.addColumn('app_requests', 'replyMessage', {
        type: 'TEXT',
        allowNull: true,
      });
      console.log('✅ Added replyMessage column to app_requests');
    } else {
      console.log('⏭️  replyMessage column already exists');
    }

    if (!table.replyAt) {
      await queryInterface.addColumn('app_requests', 'replyAt', {
        type: 'DATETIME',
        allowNull: true,
      });
      console.log('✅ Added replyAt column to app_requests');
    } else {
      console.log('⏭️  replyAt column already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
