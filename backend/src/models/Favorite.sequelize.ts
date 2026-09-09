import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import App from './App.sequelize';

export class Favorite extends Model {
  public id!: number;
  public userId!: ForeignKey<User['id']>;
  public appId!: ForeignKey<App['id']>;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Favorite.init(
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
    appId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: App,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'appId'],
        name: 'user_app_unique',
      },
    ],
  }
);

Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(App, { foreignKey: 'appId' });

export default Favorite;
