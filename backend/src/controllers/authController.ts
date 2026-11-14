import { Request, Response } from 'express';
import User from '../models/User.sequelize';
import { generateToken } from '../middleware/auth';
import Joi from 'joi';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';

// Register Validation Schema
const registerSchema = Joi.object({
  fullName: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().required().min(6),
  userType: Joi.string().valid('AppBuilder', 'RegularUser').default('RegularUser'),
});

// Login Validation Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Generate verification token
const generateVerificationToken = (): { token: string; expires: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expires };
};

// Generate password reset token
const generatePasswordResetToken = (): { token: string; expires: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expires };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
    }

    const { fullName, email, phone, password, userType } = value;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate verification token
    const { token: verificationToken, expires: verificationExpires } = generateVerificationToken();

    // Create new user (password will be hashed by Sequelize hook)
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      userType,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpire: verificationExpires,
    });

    // Send verification email
    await sendVerificationEmail(email, fullName, verificationToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email to continue.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    let isPasswordMatch = false;
    try {
      isPasswordMatch = await user.matchPassword(password);
    } catch (passwordError) {
      console.error('Password match error:', passwordError);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in',
        isEmailVerified: false,
        email: user.email,
      });
    }

    // Generate token
    const token = generateToken(user.id.toString(), user.email, user.isAdmin || false);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification token are required',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Check if token matches and hasn't expired
    if (
      user.emailVerificationToken !== token ||
      !user.emailVerificationTokenExpire ||
      new Date() > user.emailVerificationTokenExpire
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Update email verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpire = null;
    await user.save();

    // Generate new token for verified user
    const authToken = generateToken(user.id.toString(), user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token: authToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Security: Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link will be sent',
      });
    }

    // Generate password reset token
    const { token: resetToken, expires: resetExpires } = generatePasswordResetToken();

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpire = resetExpires;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, user.fullName, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, email, new password, and confirmation are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Check if reset token matches and hasn't expired
    if (
      user.passwordResetToken !== token ||
      !user.passwordResetTokenExpire ||
      new Date() > user.passwordResetTokenExpire
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const { token: verificationToken, expires: verificationExpires } = generateVerificationToken();

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpire = verificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, user.fullName, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email has been resent',
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
