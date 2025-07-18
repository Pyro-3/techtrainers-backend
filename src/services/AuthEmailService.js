const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { logBusinessEvent, logError } = require("../utils/AdvancedLogger");

/**
 * Authentication Email Service for TechTrainers
 * Handles email verification, password reset, and 2FA notifications
 */

class AuthEmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = {};
    this.loadTemplates();
  }

  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "mail.techtrainers.ca",
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true" || false,
      auth: {
        user: process.env.EMAIL_USER || "noreply@techtrainers.ca",
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });
  }

  async loadTemplates() {
    const templateDir = path.join(__dirname, "../templates/emails/auth");

    try {
      // Ensure auth email templates directory exists
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }

      const templateFiles = [
        "email-verification",
        "email-verified-confirmation",
        "password-reset",
        "password-reset-confirmation",
        "phone-verification",
        "account-locked",
        "login-notification",
      ];

      for (const templateName of templateFiles) {
        const templatePath = path.join(templateDir, `${templateName}.hbs`);
        if (fs.existsSync(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, "utf8");
          this.templates[templateName.replace("-", "_")] =
            handlebars.compile(templateContent);
        }
      }
    } catch (error) {
      console.error("Error loading email templates:", error);
    }
  }

  /**
   * Send email verification token
   */
  async sendEmailVerification(user, verificationToken) {
    try {
      const verificationUrl = `${
        process.env.FRONTEND_URL
      }/verify-email?token=${verificationToken}&email=${encodeURIComponent(
        user.email
      )}`;

      const emailData = {
        userName: user.name,
        userEmail: user.email,
        verificationUrl,
        verificationCode: verificationToken.slice(-6).toUpperCase(), // Last 6 chars as backup
        companyName: process.env.COMPANY_NAME || "TechTrainers",
        supportEmail: process.env.SUPPORT_EMAIL || "support@techtrainers.ca",
        websiteUrl:
          process.env.COMPANY_WEBSITE || "https://www.techtrainers.ca",
        expirationHours: 24,
      };

      const htmlContent = this.templates.email_verification
        ? this.templates.email_verification(emailData)
        : this.generateEmailVerificationHTML(emailData);

      const mailOptions = {
        from: `"TechTrainers" <${
          process.env.NOREPLY_EMAIL || "noreply@techtrainers.ca"
        }>`,
        to: user.email,
        subject: "Verify Your TechTrainers Account",
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);

      await logBusinessEvent("EMAIL_VERIFICATION_SENT", {
        userId: user._id,
        email: user.email,
        userName: user.name,
      });

      console.log(`✅ Email verification sent to: ${user.email}`);
    } catch (error) {
      await logError("EMAIL_VERIFICATION_FAILED", error, {
        userId: user._id,
        email: user.email,
      });
      throw new Error("Failed to send email verification");
    }
  }

  /**
   * Send email verification success confirmation
   */
  async sendEmailVerificationConfirmation(user) {
    try {
      const emailData = {
        userName: user.name,
        userEmail: user.email,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        companyName: process.env.COMPANY_NAME || "TechTrainers",
        supportEmail: process.env.SUPPORT_EMAIL || "support@techtrainers.ca",
        websiteUrl:
          process.env.COMPANY_WEBSITE || "https://www.techtrainers.ca",
      };

      const htmlContent = this.templates.email_verified_confirmation
        ? this.templates.email_verified_confirmation(emailData)
        : this.generateEmailVerifiedHTML(emailData);

      const mailOptions = {
        from: `"TechTrainers" <${
          process.env.NOREPLY_EMAIL || "noreply@techtrainers.ca"
        }>`,
        to: user.email,
        subject: "Welcome to TechTrainers - Email Verified!",
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);

      await logBusinessEvent("EMAIL_VERIFIED_CONFIRMATION_SENT", {
        userId: user._id,
        email: user.email,
      });
    } catch (error) {
      console.error("Failed to send email verification confirmation:", error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user, resetToken) {
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL
      }/reset-password?token=${resetToken}&email=${encodeURIComponent(
        user.email
      )}`;

      const emailData = {
        userName: user.name,
        userEmail: user.email,
        resetUrl,
        resetCode: resetToken.slice(-8).toUpperCase(), // Last 8 chars as backup
        companyName: process.env.COMPANY_NAME || "TechTrainers",
        supportEmail: process.env.SUPPORT_EMAIL || "support@techtrainers.ca",
        websiteUrl:
          process.env.COMPANY_WEBSITE || "https://www.techtrainers.ca",
        expirationMinutes: 10,
      };

      const htmlContent = this.templates.password_reset
        ? this.templates.password_reset(emailData)
        : this.generatePasswordResetHTML(emailData);

      const mailOptions = {
        from: `"TechTrainers Security" <${
          process.env.NOREPLY_EMAIL || "noreply@techtrainers.ca"
        }>`,
        to: user.email,
        subject: "Reset Your TechTrainers Password",
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);

      await logBusinessEvent("PASSWORD_RESET_SENT", {
        userId: user._id,
        email: user.email,
      });

      console.log(`✅ Password reset sent to: ${user.email}`);
    } catch (error) {
      await logError("PASSWORD_RESET_FAILED", error, {
        userId: user._id,
        email: user.email,
      });
      throw new Error("Failed to send password reset email");
    }
  }

  /**
   * Send account locked notification
   */
  async sendAccountLocked(user, lockDuration) {
    try {
      const emailData = {
        userName: user.name,
        userEmail: user.email,
        lockDurationMinutes: Math.ceil(lockDuration / (60 * 1000)),
        supportEmail: process.env.SUPPORT_EMAIL || "support@techtrainers.ca",
        companyName: process.env.COMPANY_NAME || "TechTrainers",
        websiteUrl:
          process.env.COMPANY_WEBSITE || "https://www.techtrainers.ca",
      };

      const htmlContent = this.templates.account_locked
        ? this.templates.account_locked(emailData)
        : this.generateAccountLockedHTML(emailData);

      const mailOptions = {
        from: `"TechTrainers Security" <${
          process.env.NOREPLY_EMAIL || "noreply@techtrainers.ca"
        }>`,
        to: user.email,
        subject: "TechTrainers Account Temporarily Locked",
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);

      await logBusinessEvent("ACCOUNT_LOCKED_NOTIFICATION_SENT", {
        userId: user._id,
        email: user.email,
        lockDuration,
      });
    } catch (error) {
      console.error("Failed to send account locked notification:", error);
    }
  }

  // Fallback HTML generators (if templates not found)
  generateEmailVerificationHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${data.companyName}!</h1>
            <p>Please verify your email address to get started</p>
          </div>
          <div class="content">
            <h3>Hi ${data.userName},</h3>
            <p>Thank you for joining TechTrainers! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or use this verification code: <strong>${data.verificationCode}</strong></p>
            <p>This link will expire in ${data.expirationHours} hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>${data.companyName} | ${data.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
            <p>Reset your TechTrainers password</p>
          </div>
          <div class="content">
            <h3>Hi ${data.userName},</h3>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or use this reset code: <strong>${data.resetCode}</strong></p>
            <p>This link will expire in ${data.expirationMinutes} minutes.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>${data.companyName} | ${data.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateAccountLockedHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Account Temporarily Locked</h1>
            <p>Security protection activated</p>
          </div>
          <div class="content">
            <h3>Hi ${data.userName},</h3>
            <p>Your TechTrainers account has been temporarily locked due to multiple failed login attempts.</p>
            <p>Your account will be automatically unlocked in <strong>${data.lockDurationMinutes} minutes</strong>.</p>
            <p>If this wasn't you, please contact our support team immediately at ${data.supportEmail}.</p>
            <p>To help secure your account, consider:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Enabling two-factor authentication</li>
              <li>Checking for suspicious activity</li>
            </ul>
          </div>
          <div class="footer">
            <p>${data.companyName} Security Team | ${data.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateEmailVerifiedHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Verified Successfully!</h1>
            <p>Welcome to the TechTrainers community</p>
          </div>
          <div class="content">
            <h3>Congratulations ${data.userName}!</h3>
            <p>Your email has been successfully verified. You can now access all TechTrainers features:</p>
            <ul>
              <li>Book appointments with personal trainers</li>
              <li>Access workout plans and nutrition guides</li>
              <li>Track your fitness progress</li>
              <li>Join our fitness community</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" class="button">Start Your Fitness Journey</a>
            </p>
            <p>Need help getting started? Contact us at ${data.supportEmail}</p>
          </div>
          <div class="footer">
            <p>Welcome to ${data.companyName}! | ${data.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = AuthEmailService;
