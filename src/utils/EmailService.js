const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

/**
 * Email service for sending notifications and alerts
 */

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Load and compile an email template
 * @param {string} templateName - The name of the template file without extension
 * @param {Object} data - Data to inject into the template
 */
const compileTemplate = async (templateName, data) => {
  const templatesDir = path.join(__dirname, '../templates/emails');
  const templatePath = path.join(templatesDir, `${templateName}.html`);
  
  try {
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    console.error(`Template error (${templateName}):`, error);
    throw new Error(`Failed to compile email template: ${templateName}`);
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Data for template
 * @param {Array} [options.attachments] - Email attachments
 */
const sendEmail = async (options) => {
  try {
    const { to, subject, template, data, attachments = [] } = options;
    
    // Compile the template with data
    const html = await compileTemplate(template, data);
    
    // Send mail
    const info = await transporter.sendMail({
      from: `"TechTrainer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });
    
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Predefined email types
const emails = {
  /**
   * Send welcome email to new user
   * @param {Object} user - User object with email and name
   */
  sendWelcomeEmail: async (user) => {
    return sendEmail({
      to: user.email,
      subject: 'Welcome to TechTrainer!',
      template: 'welcome',
      data: {
        name: user.name,
        loginLink: `${process.env.CLIENT_URL}/login`
      }
    });
  },
  
  /**
   * Send password reset email
   * @param {Object} user - User object with email and name
   * @param {string} resetToken - Password reset token
   */
  sendPasswordResetEmail: async (user, resetToken) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    return sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.name,
        resetLink,
        expiryHours: 1
      }
    });
  },
  
  /**
   * Send workout reminder email
   * @param {Object} user - User object
   * @param {Object} workout - Workout details
   */
  sendWorkoutReminder: async (user, workout) => {
    return sendEmail({
      to: user.email,
      subject: 'Your Workout Reminder',
      template: 'workout-reminder',
      data: {
        name: user.name,
        workoutName: workout.title,
        workoutTime: new Date(workout.scheduledFor).toLocaleTimeString(),
        workoutLink: `${process.env.CLIENT_URL}/workouts/${workout._id}`
      }
    });
  }
};

module.exports = {
  sendEmail,
  compileTemplate,
  emails
};