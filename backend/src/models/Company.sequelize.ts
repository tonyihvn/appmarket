import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';

export class Company extends Model {
  public id!: number;
  public userId!: ForeignKey<User['id']>;
  public companyName!: string;
  public companySize!: string;
  public industry!: string;
  public website?: string;
  public logo?: string;
  public description?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companySize: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: true,
  }
);

Company.belongsTo(User, { foreignKey: 'userId' });

export default Company;
