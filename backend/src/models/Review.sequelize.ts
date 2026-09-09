import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import App from './App.sequelize';

export class Review extends Model {
  public id!: number;
  public appId!: ForeignKey<App['id']>;
  public userId!: ForeignKey<User['id']>;
  public rating!: number;
  public comment!: string;
  public helpful!: number;
  public status!: 'pending' | 'approved' | 'rejected';
  public createdAt!: Date;
  public updatedAt!: Date;
}

Review.init(
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    helpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
  }
);

Review.belongsTo(App, { foreignKey: 'appId' });
Review.belongsTo(User, { as: 'reviewer', foreignKey: 'userId' });

export default Review;
