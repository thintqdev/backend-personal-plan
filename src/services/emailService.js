const nodemailer = require('nodemailer');

// Email Service Configuration
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  // Initialize email transporter
  initialize() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email configuration (e.g., using SendGrid, Mailgun, etc.)
        this.transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development email configuration (using Ethereal for testing)
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
            pass: process.env.EMAIL_PASSWORD || 'ethereal.pass'
          }
        });
      }

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  // Send verification email
  async sendVerificationEmail(email, name, verificationToken) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email/${verificationToken}`;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'ThinPlan'}" <${process.env.EMAIL_FROM || 'noreply@thinplan.com'}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to ${process.env.APP_NAME || 'ThinPlan'}!</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Thank you for registering with ${process.env.APP_NAME || 'ThinPlan'}. To complete your registration, please verify your email address by clicking the button below:</p>
                
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
                
                <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 ${process.env.APP_NAME || 'ThinPlan'}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hi ${name},
          
          Thank you for registering with ${process.env.APP_NAME || 'ThinPlan'}. To complete your registration, please verify your email address by visiting this link:
          
          ${verificationUrl}
          
          Note: This verification link will expire in 24 hours.
          
          If you didn't create an account with us, please ignore this email.
          
          Best regards,
          ${process.env.APP_NAME || 'ThinPlan'} Team
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, name, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'ThinPlan'}" <${process.env.EMAIL_FROM || 'noreply@thinplan.com'}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
              .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>We received a request to reset your password for your ${process.env.APP_NAME || 'ThinPlan'} account.</p>
                
                <div class="warning">
                  <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is safe.
                </div>
                
                <p>To reset your password, click the button below:</p>
                
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This reset link will expire in 1 hour for security reasons</li>
                  <li>You can only use this link once</li>
                  <li>If you didn't request this reset, your account is still secure</li>
                </ul>
              </div>
              <div class="footer">
                <p>&copy; 2024 ${process.env.APP_NAME || 'ThinPlan'}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hi ${name},
          
          We received a request to reset your password for your ${process.env.APP_NAME || 'ThinPlan'} account.
          
          To reset your password, visit this link:
          ${resetUrl}
          
          Important:
          - This reset link will expire in 1 hour for security reasons
          - You can only use this link once
          - If you didn't request this reset, please ignore this email
          
          Best regards,
          ${process.env.APP_NAME || 'ThinPlan'} Team
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email (after successful verification)
  async sendWelcomeEmail(email, name) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'ThinPlan'}" <${process.env.EMAIL_FROM || 'noreply@thinplan.com'}>`,
        to: email,
        subject: `Welcome to ${process.env.APP_NAME || 'ThinPlan'}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to ${process.env.APP_NAME || 'ThinPlan'}! 🎉</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                
                <p>You can now enjoy all the features of ${process.env.APP_NAME || 'ThinPlan'}:</p>
                <ul>
                  <li>Personal dashboard and goal tracking</li>
                  <li>Finance management tools</li>
                  <li>Task and note organization</li>
                  <li>Progress monitoring and analytics</li>
                </ul>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/login" class="button">Get Started</a>
                
                <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                
                <p>Welcome aboard!</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 ${process.env.APP_NAME || 'ThinPlan'}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hi ${name},
          
          Congratulations! Your email has been successfully verified and your account is now active.
          
          You can now enjoy all the features of ${process.env.APP_NAME || 'ThinPlan'}:
          - Personal dashboard and goal tracking
          - Finance management tools
          - Task and note organization
          - Progress monitoring and analytics
          
          Get started: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/login
          
          If you have any questions or need assistance, feel free to contact our support team.
          
          Welcome aboard!
          
          Best regards,
          ${process.env.APP_NAME || 'ThinPlan'} Team
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify email service connection
  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Create and export email service instance
const emailService = new EmailService();

module.exports = emailService;