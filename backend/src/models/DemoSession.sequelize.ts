import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import App from './App.sequelize';

export class DemoSession extends Model {
  public id!: number;
  public appId!: ForeignKey<App['id']>;
  public userId!: ForeignKey<User['id']>;
  public sessionDate!: Date;
  public scheduledTime!: string;
  public status!: 'scheduled' | 'completed' | 'cancelled';
  public notes?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

DemoSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    appId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: App,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    sessionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    scheduledTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DemoSession',
    tableName: 'demo_sessions',
    timestamps: true,
  }
);

DemoSession.belongsTo(App, { foreignKey: 'appId' });
DemoSession.belongsTo(User, { foreignKey: 'userId' });

export default DemoSession;
