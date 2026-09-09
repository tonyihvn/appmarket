import { DataTypes } from 'sequelize';

export async function up(sequelize: any) {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // Check if column already exists
    const table = await queryInterface.describeTable('users');
    
    if (!table.isAdmin) {
      await queryInterface.addColumn('users', 'isAdmin', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
      console.log('✅ Added isAdmin column to users table');
    } else {
      console.log('ℹ️  isAdmin column already exists');
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

export async function down(sequelize: any) {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.removeColumn('users', 'isAdmin');
  console.log('✅ Removed isAdmin column from users table');
}
