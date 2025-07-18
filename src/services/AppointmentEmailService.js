const { logger } = require("../utils/AdvancedLogger");

/**
 * Appointment Email Service
 * Handles appointment booking, confirmation, and reminder emails
 */
class AppointmentEmailService {
  constructor() {
    this.emailService = require("./AuthEmailService");
  }

  /**
   * Send appointment booking confirmation to client
   */
  async sendBookingConfirmation(user, appointment) {
    try {
      const subject = `Appointment Booked - ${appointment.sessionType}`;
      const emailBody = this.generateBookingConfirmationEmail(
        user,
        appointment
      );

      await this.emailService.sendEmail(user.email, subject, emailBody);

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
}

module.exports = new AppointmentEmailService();
