const { logger } = require("../utils/AdvancedLogger");
const EmailAnalytics = require("../models/EmailAnalytics");

/**
 * Appointment Email Service
 * Handles appointment booking, confirmation, and reminder emails
 * Enhanced with retry logic and email tracking
 */
class AppointmentEmailService {
  constructor() {
    this.emailService = require("./AuthEmailService");
  }

  /**
   * Send email with retry logic and error handling
   * @param {Object} mailOptions - Email configuration
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise} Email send result
   */
  async sendEmailWithRetry(mailOptions, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await this.emailService.sendEmail(
          mailOptions.to,
          mailOptions.subject,
          mailOptions.html
        );
        
        // Log successful email with metadata
        await this.logEmailSuccess(
          mailOptions.to, 
          mailOptions.subject, 
          mailOptions.type,
          mailOptions.metadata || {}
        );
        return result;
      } catch (error) {
        // Log email error with metadata
        await this.logEmailError(
          mailOptions.to, 
          mailOptions.subject, 
          error, 
          i + 1,
          mailOptions.type,
          mailOptions.metadata || {}
        );
        
        // If this is the last retry, throw the error
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // Exponential backoff delay
        await this.delay(1000 * Math.pow(2, i));
      }
    }
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log successful email delivery
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {string} type - Email type
   * @param {Object} metadata - Additional metadata
   */
  async logEmailSuccess(email, subject, type, metadata = {}) {
    try {
      // Create email analytics record
      await EmailAnalytics.create({
        recipientEmail: email,
        emailType: type,
        subject,
        status: 'sent',
        relatedAppointmentId: metadata.appointmentId,
        relatedUserId: metadata.userId,
        emailProvider: 'smtp',
        metadata: {
          templateVersion: '1.0',
          ...metadata
        }
      });

      // Also log to business events
      await logger.logBusinessEvent("info", "Email sent successfully", {
        email,
        subject,
        type,
        timestamp: new Date().toISOString(),
        status: "sent"
      });
    } catch (error) {
      // If analytics logging fails, don't break the email flow
      await logger.logError("Failed to log email analytics", {
        email,
        subject,
        error: error.message
      });
    }
  }

  /**
   * Log email delivery error
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {Error} error - Error object
   * @param {number} attempt - Attempt number
   * @param {string} type - Email type
   * @param {Object} metadata - Additional metadata
   */
  async logEmailError(email, subject, error, attempt, type = 'unknown', metadata = {}) {
    try {
      // Create or update email analytics record
      await EmailAnalytics.create({
        recipientEmail: email,
        emailType: type,
        subject,
        status: 'failed',
        errorMessage: error.message,
        retryAttempts: attempt,
        relatedAppointmentId: metadata.appointmentId,
        relatedUserId: metadata.userId,
        emailProvider: 'smtp',
        metadata: {
          templateVersion: '1.0',
          ...metadata
        }
      });

      // Also log to error system
      await logger.logError("Email delivery failed", {
        email,
        subject,
        error: error.message,
        attempt,
        timestamp: new Date().toISOString(),
        status: "failed"
      });
    } catch (analyticsError) {
      // If analytics logging fails, don't break the email flow
      await logger.logError("Failed to log email error analytics", {
        email,
        subject,
        originalError: error.message,
        analyticsError: analyticsError.message
      });
    }
  }

  /**
   * Check if user has email preferences enabled for specific type
   * @param {Object} user - User object
   * @param {string} emailType - Type of email to check
   * @returns {boolean} Whether email should be sent
   */
  shouldSendEmail(user, emailType) {
    if (!user.preferences?.email) {
      return true; // Default to sending if no preferences set
    }

    const emailPrefs = user.preferences.email;
    
    switch (emailType) {
      case 'appointmentReminder':
        return emailPrefs.appointmentReminders;
      case 'promotional':
        return emailPrefs.promotionalEmails;
      case 'trainerUpdate':
        return emailPrefs.trainerUpdates;
      case 'system':
        return emailPrefs.systemNotifications;
      case 'weeklyProgress':
        return emailPrefs.weeklyProgressSummary;
      case 'marketing':
        return emailPrefs.marketingEmails;
      default:
        return true; // Default to sending for unknown types
    }
  }

  /**
   * Send appointment booking confirmation to client
   */
  async sendBookingConfirmation(user, appointment) {
    try {
      // Check if user wants to receive appointment notifications
      if (!this.shouldSendEmail(user, 'appointmentReminder')) {
        await logger.logBusinessEvent("info", "Booking confirmation email skipped due to user preferences", {
          appointmentId: appointment._id,
          userEmail: user.email,
        });
        return;
      }

      const subject = `Appointment Booked - ${appointment.sessionType}`;
      const emailBody = this.generateBookingConfirmationEmail(
        user,
        appointment
      );

      const mailOptions = {
        to: user.email,
        subject,
        html: emailBody,
        type: 'appointmentConfirmation',
        metadata: {
          appointmentId: appointment._id,
          userId: user._id,
          trainerId: appointment.trainerId
        }
      };

      await this.sendEmailWithRetry(mailOptions);

      await logger.logBusinessEvent("info", "Booking confirmation email sent", {
        appointmentId: appointment._id,
        userEmail: user.email,
        trainerId: appointment.trainerId,
      });
    } catch (error) {
      await logger.logError("Failed to send booking confirmation email", {
        error: error.message,
        appointmentId: appointment._id,
        userEmail: user.email,
      });
      throw error;
    }
  }

  /**
   * Send appointment notification to trainer
   */
  async sendTrainerNotification(appointment) {
    try {
      const subject = `New Appointment Booking - ${appointment.sessionType}`;
      const emailBody = this.generateTrainerNotificationEmail(appointment);

      await this.emailService.sendEmail(
        appointment.trainerEmail,
        subject,
        emailBody
      );

      await logger.logBusinessEvent("info", "Trainer notification email sent", {
        appointmentId: appointment._id,
        trainerEmail: appointment.trainerEmail,
      });
    } catch (error) {
      await logger.logError("Failed to send trainer notification email", {
        error: error.message,
        appointmentId: appointment._id,
        trainerEmail: appointment.trainerEmail,
      });
      throw error;
    }
  }

  /**
   * Send appointment reminder (24 hours before)
   */
  async sendAppointmentReminder(appointment, user) {
    try {
      const subject = `Appointment Reminder - Tomorrow at ${appointment.time}`;
      const emailBody = this.generateReminderEmail(appointment, user);

      await this.emailService.sendEmail(user.email, subject, emailBody);

      await logger.logBusinessEvent("info", "Appointment reminder sent", {
        appointmentId: appointment._id,
        userEmail: user.email,
      });
    } catch (error) {
      await logger.logError("Failed to send appointment reminder", {
        error: error.message,
        appointmentId: appointment._id,
        userEmail: user.email,
      });
      throw error;
    }
  }

  /**
   * Send appointment cancellation notification
   */
  async sendCancellationNotification(appointment, user) {
    try {
      const subject = `Appointment Cancelled - ${appointment.sessionType}`;
      const emailBody = this.generateCancellationEmail(appointment, user);

      // Send to both client and trainer
      await Promise.all([
        this.emailService.sendEmail(user.email, subject, emailBody),
        this.emailService.sendEmail(
          appointment.trainerEmail,
          subject,
          emailBody
        ),
      ]);

      await logger.logBusinessEvent("info", "Cancellation notifications sent", {
        appointmentId: appointment._id,
        userEmail: user.email,
        trainerEmail: appointment.trainerEmail,
      });
    } catch (error) {
      await logger.logError("Failed to send cancellation notifications", {
        error: error.message,
        appointmentId: appointment._id,
      });
      throw error;
    }
  }

  /**
   * Generate booking confirmation email HTML
   */
  generateBookingConfirmationEmail(user, appointment) {
    const appointmentDate = new Date(appointment.date).toLocaleDateString();

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #92400e 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Appointment Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your training session has been booked</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Appointment Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <p><strong>Session Type:</strong> ${appointment.sessionType}</p>
            <p><strong>Trainer:</strong> ${appointment.trainerName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
            ${
              appointment.notes
                ? `<p><strong>Notes:</strong> ${appointment.notes}</p>`
                : ""
            }
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d97706;">
            <h3 style="color: #92400e; margin-bottom: 10px;">What's Next?</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Your trainer will contact you within 24 hours to confirm details</li>
              <li>You'll receive a reminder 24 hours before your session</li>
              <li>Bring comfortable workout clothes and water</li>
              <li>Arrive 10 minutes early for your session</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@techtrainers.ca" style="color: #d97706;">support@techtrainers.ca</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate trainer notification email HTML
   */
  generateTrainerNotificationEmail(appointment) {
    const appointmentDate = new Date(appointment.date).toLocaleDateString();

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Appointment Booking</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">You have a new session request</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Client Information</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <p><strong>Client Email:</strong> ${appointment.clientEmail}</p>
            ${
              appointment.clientPhone
                ? `<p><strong>Phone:</strong> ${appointment.clientPhone}</p>`
                : ""
            }
            <p><strong>Session Type:</strong> ${appointment.sessionType}</p>
            <p><strong>Requested Date:</strong> ${appointmentDate}</p>
            <p><strong>Preferred Time:</strong> ${appointment.time}</p>
            ${
              appointment.notes
                ? `<p><strong>Client Notes:</strong> ${appointment.notes}</p>`
                : ""
            }
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">Action Required</h3>
            <p style="color: #1e40af; margin: 0;">
              Please contact the client within 24 hours to confirm the session details and finalize the booking.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Questions? Contact support at <a href="mailto:support@techtrainers.ca" style="color: #3b82f6;">support@techtrainers.ca</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate reminder email HTML
   */
  generateReminderEmail(appointment, user) {
    const appointmentDate = new Date(appointment.date).toLocaleDateString();

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Appointment Reminder</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your training session is tomorrow!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Session Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <p><strong>Session Type:</strong> ${appointment.sessionType}</p>
            <p><strong>Trainer:</strong> ${appointment.trainerName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
            <h3 style="color: #047857; margin-bottom: 10px;">Preparation Checklist</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>Wear comfortable workout clothes</li>
              <li>Bring water and a towel</li>
              <li>Arrive 10 minutes early</li>
              <li>Bring any questions you have about your fitness goals</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Need to reschedule? Contact us at <a href="mailto:support@techtrainers.ca" style="color: #059669;">support@techtrainers.ca</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate cancellation email HTML
   */
  generateCancellationEmail(appointment, user) {
    const appointmentDate = new Date(appointment.date).toLocaleDateString();

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Appointment Cancelled</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your training session has been cancelled</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Cancelled Session Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <p><strong>Session Type:</strong> ${appointment.sessionType}</p>
            <p><strong>Trainer:</strong> ${appointment.trainerName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
          </div>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h3 style="color: #b91c1c; margin-bottom: 10px;">What's Next?</h3>
            <p style="color: #b91c1c; margin: 0;">
              You can book a new appointment anytime through your TechTrainers dashboard or contact us for assistance.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@techtrainers.ca" style="color: #dc2626;">support@techtrainers.ca</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Send no-show notification to user
   * @param {Object} user - User object
   * @param {Object} appointment - Appointment object
   */
  async sendNoShowNotification(user, appointment) {
    try {
      // Check if user wants to receive system notifications
      if (!this.shouldSendEmail(user, 'system')) {
        await logger.logBusinessEvent("info", "No-show notification email skipped due to user preferences", {
          appointmentId: appointment._id,
          userEmail: user.email,
        });
        return;
      }

      const subject = `Missed Appointment - ${appointment.sessionType}`;
      const emailBody = this.generateNoShowNotificationEmail(user, appointment);

      const mailOptions = {
        to: user.email,
        subject,
        html: emailBody,
        type: 'noShowNotification',
        metadata: {
          appointmentId: appointment._id,
          userId: user._id,
          trainerId: appointment.trainerId
        }
      };

      await this.sendEmailWithRetry(mailOptions);

      await logger.logBusinessEvent("info", "No-show notification email sent", {
        appointmentId: appointment._id,
        userEmail: user.email,
        trainerId: appointment.trainerId,
      });
    } catch (error) {
      await logger.logError("Failed to send no-show notification email", {
        error: error.message,
        appointmentId: appointment._id,
        userEmail: user.email,
      });
      throw error;
    }
  }

  /**
   * Generate no-show notification email HTML
   * @param {Object} user - User object
   * @param {Object} appointment - Appointment object
   * @returns {string} HTML email content
   */
  generateNoShowNotificationEmail(user, appointment) {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
          <img src="https://techtrainers.ca/logo-white.png" alt="TechTrainers" style="height: 40px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Missed Appointment</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">We missed you at your training session</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${user.name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            We noticed you weren't able to make it to your scheduled appointment today. We understand that things come up!
          </p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #b91c1c; margin-bottom: 15px;">Missed Session Details</h3>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 5px 0;"><strong>Session Type:</strong> ${appointment.sessionType}</p>
              <p style="margin: 5px 0;"><strong>Trainer:</strong> ${appointment.trainerName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
            </div>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0369a1; margin-bottom: 15px;">What's Next?</h3>
            <p style="color: #0369a1; margin-bottom: 15px;">
              Don't worry! You can easily reschedule or book a new appointment:
            </p>
            <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Visit your TechTrainers dashboard to book a new session</li>
              <li style="margin-bottom: 8px;">Contact us directly for assistance with rescheduling</li>
              <li style="margin-bottom: 8px;">Speak with your trainer about setting up regular sessions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://techtrainers.ca/book-appointment" 
               style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Book New Appointment
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <p style="color: #6b7280; margin: 0; font-size: 14px; text-align: center;">
              <strong>Cancellation Policy Reminder:</strong><br>
              Please provide at least 24 hours notice for cancellations to avoid no-show fees.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@techtrainers.ca" style="color: #dc2626;">support@techtrainers.ca</a>
          </p>
          <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
            TechTrainers Canada - Your Fitness Journey Starts Here
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = new AppointmentEmailService();
