import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';

export class Service extends Model {
  public id!: number;
  public userId!: ForeignKey<User['id']>;
  public title!: string;
  public description!: string;
  public pricePerHour!: number;
  public category!: string;
  public tags?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Service.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pricePerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
    timestamps: true,
  }
);

Service.belongsTo(User, { foreignKey: 'userId' });

export default Service;
