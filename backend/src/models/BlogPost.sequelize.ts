import { DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User.sequelize';

export class BlogPost extends Model {
  public id!: number;
  public authorId!: ForeignKey<User['id']>;
  public title!: string;
  public content!: string;
  public excerpt!: string;
  public featuredImage?: string;
  public published!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

BlogPost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    authorId: {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'BlogPost',
    tableName: 'blog_posts',
    timestamps: true,
  }
);

BlogPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

export default BlogPost;
