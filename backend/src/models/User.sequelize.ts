import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';
import bcrypt from 'bcryptjs';

export class User extends Model {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public phone!: string;
  public password!: string;
  public userType!: 'AppBuilder' | 'RegularUser';
  public isEmailVerified!: boolean;
  public isAdmin!: boolean;
  public profilePicture?: string;
  public bio?: string;
  public rating!: number;
  public reviewCount!: number;
  public badges!: string;
  public emailVerificationToken?: string;
  public emailVerificationTokenExpire?: Date;
  public passwordResetToken?: string;
  public passwordResetTokenExpire?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  public async matchPassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.ENUM('AppBuilder', 'RegularUser'),
      defaultValue: 'RegularUser',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
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
    badges: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerificationTokenExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetTokenExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
