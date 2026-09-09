import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';
import Category from './Category.sequelize';

export class App extends Model {
  public id!: number;
  public userId!: ForeignKey<User['id']>;
  public title!: string;
  public subtitle!: string;
  public description!: string;
  public techStack!: string;
  public logo!: string;
  public screenshots!: string;
  public categoryId!: ForeignKey<Category['id']>;
  public price!: number | null;
  public isFree!: boolean;
  public isSaaS!: boolean;
  public isOffline!: boolean;
  public githubRepository?: string;
  public distributionFormat!: 'executable' | 'web' | 'source' | 'hybrid';
  public deploymentMethod?: string | string[];
  public officialWebsite?: string;
  public liveDemo?: string;
  public documentation?: string;
  public rating!: number;
  public reviewCount!: number;
  public downloadCount!: number;
  public status!: 'draft' | 'published' | 'archived';
  public tags!: string;
  public featured!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

App.init(
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
    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    techStack: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    screenshots: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSaaS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isOffline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    githubRepository: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    distributionFormat: {
      type: DataTypes.ENUM('executable', 'web', 'source', 'hybrid'),
      allowNull: false,
    },
    deploymentMethod: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    officialWebsite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    liveDemo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'App',
    tableName: 'apps',
    timestamps: true,
    indexes: [
      {
        name: 'app_title_index',
        fields: ['title'],
      },
      {
        name: 'app_status_index',
        fields: ['status'],
      },
      {
        name: 'app_featured_index',
        fields: ['featured'],
      },
    ],
  }
);

App.belongsTo(User, { as: 'publisher', foreignKey: 'userId' });
App.belongsTo(Category, { foreignKey: 'categoryId' });

export default App;
