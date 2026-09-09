import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  try {
    // Check if columns already exist before adding them
    const table = await queryInterface.describeTable('app_requests');
    
    if (!table.replyMessage) {
      await queryInterface.addColumn('app_requests', 'replyMessage', {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      console.log('✅ Added replyMessage column');
    }

    if (!table.replyAt) {
      await queryInterface.addColumn('app_requests', 'replyAt', {
        type: DataTypes.DATE,
        allowNull: true,
      });
      console.log('✅ Added replyAt column');
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface) {
  try {
    await queryInterface.removeColumn('app_requests', 'replyMessage');
    await queryInterface.removeColumn('app_requests', 'replyAt');
    console.log('✅ Rollback completed successfully');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}
