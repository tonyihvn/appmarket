import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  verificationToken: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background-color: white; padding: 30px; }
        .content p { margin: 15px 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .verify-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
        .verify-button:hover { opacity: 0.9; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .link-text { word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Thank you for registering with AppMarket! To complete your registration and activate your account, please verify your email address by clicking the button below.</p>
          
          <div class="button-container">
            <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p class="link-text"><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you did not create this account, please ignore this email or contact our support team.</p>
          
          <p>Best regards,<br><strong>AppMarket Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 AppMarket. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - AppMarket',
    html: htmlContent,
    text: `Please verify your email by visiting: ${verificationUrl}`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetToken: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background-color: white; padding: 30px; }
        .content p { margin: 15px 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .reset-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
        .reset-button:hover { opacity: 0.9; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .link-text { word-break: break-all; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>We received a request to reset the password associated with your AppMarket account. Click the button below to create a new password.</p>
          
          <div class="button-container">
            <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p class="link-text"><a href="${resetUrl}">${resetUrl}</a></p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact our support team immediately.
          </div>
          
          <p><strong>Why are we sending this?</strong><br>
          This is a secure notification about a password reset request for your account. If you did not request this, your account may have been compromised. Please contact support immediately.</p>
          
          <p>Best regards,<br><strong>AppMarket Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 AppMarket. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - AppMarket',
    html: htmlContent,
    text: `Click the link to reset your password: ${resetUrl}`,
  });
};
