import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';

export class Freelancer extends Model {
  public id!: number;
  public userId!: ForeignKey<User['id']>;
  public skills!: string;
  public experience!: string;
  public portfolio?: string;
  public hourlyRate!: number;
  public bio?: string;
  public availability!: 'available' | 'unavailable';
  public createdAt!: Date;
  public updatedAt!: Date;
}

Freelancer.init(
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
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    portfolio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    availability: {
      type: DataTypes.ENUM('available', 'unavailable'),
      defaultValue: 'available',
    },
  },
  {
    sequelize,
    modelName: 'Freelancer',
    tableName: 'freelancers',
    timestamps: true,
  }
);

Freelancer.belongsTo(User, { foreignKey: 'userId' });

export default Freelancer;
