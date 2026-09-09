import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import App from './App.sequelize';

export class AppRequest extends Model {
  public id!: number;
  public appId!: ForeignKey<App['id']>;
  public publisherId!: ForeignKey<User['id']>;
  public requesterId!: ForeignKey<User['id']>;
  public requesterEmail!: string;
  public requesterPhone!: string;
  public requesterName!: string;
  public message!: string;
  public status!: 'pending' | 'reviewed' | 'approved' | 'rejected';
  public replyMessage?: string;
  public replyAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

AppRequest.init(
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
    publisherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    requesterEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requesterPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requesterName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 5000],
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    replyMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    replyAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AppRequest',
    tableName: 'app_requests',
    timestamps: true,
  }
);

AppRequest.belongsTo(App, { foreignKey: 'appId' });
AppRequest.belongsTo(User, { as: 'publisher', foreignKey: 'publisherId' });
AppRequest.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });

export default AppRequest;
