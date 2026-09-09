import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import ProjectRequest from './ProjectRequest.sequelize';

export class Bid extends Model {
  public id!: number;
  public projectId!: ForeignKey<ProjectRequest['id']>;
  public bidderId!: ForeignKey<User['id']>;
  public bidAmount!: number;
  public proposal!: string;
  public deliveryDays!: number;
  public status!: 'pending' | 'accepted' | 'rejected' | 'completed';
  public attachments?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Bid.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProjectRequest,
        key: 'id',
      },
    },
    bidderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    bidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    proposal: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deliveryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
      defaultValue: 'pending',
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Bid',
    tableName: 'bids',
    timestamps: true,
  }
);

Bid.belongsTo(ProjectRequest, { foreignKey: 'projectId' });
Bid.belongsTo(User, { as: 'bidder', foreignKey: 'bidderId' });

export default Bid;
