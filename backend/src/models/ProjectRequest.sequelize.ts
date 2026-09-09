import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import Category from './Category.sequelize';

export class ProjectRequest extends Model {
  public id!: number;
  public clientId!: ForeignKey<User['id']>;
  public title!: string;
  public description!: string;
  public budget!: number;
  public budgetType!: 'fixed' | 'hourly';
  public categoryId!: ForeignKey<Category['id']>;
  public requiredSkills!: string;
  public timeline!: string;
  public attachments?: string;
  public status!: 'open' | 'in_progress' | 'closed' | 'completed';
  public bidsCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ProjectRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
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
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    budgetType: {
      type: DataTypes.ENUM('fixed', 'hourly'),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    requiredSkills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    timeline: {
      type: DataTypes.STRING,
      defaultValue: 'Flexible',
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'closed', 'completed'),
      defaultValue: 'open',
    },
    bidsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'ProjectRequest',
    tableName: 'project_requests',
    timestamps: true,
  }
);

ProjectRequest.belongsTo(User, { as: 'client', foreignKey: 'clientId' });
ProjectRequest.belongsTo(Category, { foreignKey: 'categoryId' });

export default ProjectRequest;
