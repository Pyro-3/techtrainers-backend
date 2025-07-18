const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const { formatDate } = require('../utils/dateTimeUtils');

/**
 * Email service for sending notifications
 */

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Load and compile email template
 * @param {string} templateName - Template name
 * @param {Object} data - Data for template
 * @returns {Promise<string>} Compiled HTML
 */
const compileTemplate = async (templateName, data) => {
  try {
    const templatesDir = path.join(__dirname, '..', 'templates', 'emails');
    const filePath = path.join(templatesDir, `${templateName}.html`);
    const templateSource = await fs.readFile(filePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    console.error(`Failed to compile email template ${templateName}:`, error);
    throw new Error('Email template error');
  }
};

/**
 * Send appointment-related emails
 * @param {Object} params - Email parameters
 * @returns {Promise<void>}
 */
const sendAppointmentEmail = async (params) => {
  try {
    const { type, appointment, user, trainer, meetingLink, oldDate, cancelledBy, reason } = params;
    
    // Format appointment date and time
    const formattedDate = formatDate(appointment.date, 'MMMM D, YYYY');
    const formattedTime = formatDate(appointment.date, 'h:mm A');
    const formattedEndTime = formatDate(
      new Date(appointment.date.getTime() + appointment.duration * 60000),
      'h:mm A'
    );
    
    // Base data for all templates
    const baseTemplateData = {
      userName: user.name,
      trainerName: trainer.name,
      appointmentDate: formattedDate,
      appointmentTime: `${formattedTime} - ${formattedEndTime}`,
      appointmentDuration: `${appointment.duration} minutes`,
      appointmentType: appointment.type === 'online' ? 'Online (Microsoft Teams)' : 'In-Person'
    };
    
    // Handle different email types
    let userSubject, userTemplate, userTemplateData;
    let trainerSubject, trainerTemplate, trainerTemplateData;
    
    switch (type) {
      case 'online-appointment-created':
        // User email
        userSubject = 'Your Online Training Session is Confirmed';
        userTemplate = 'online-appointment-user';
        userTemplateData = {
          ...baseTemplateData,
          meetingLink,
          notes: appointment.notes || 'No additional notes provided.'
        };
        
        // Trainer email
        trainerSubject = 'New Online Training Session Scheduled';
        trainerTemplate = 'online-appointment-trainer';
        trainerTemplateData = {
          ...baseTemplateData,
          meetingLink,
          userEmail: user.email,
          notes: appointment.notes || 'No additional notes provided.'
        };
        break;
        
      case 'online-appointment-created-without-link':
        // Fallback if Teams creation fails
        userSubject = 'Your Online Training Session is Scheduled';
        userTemplate = 'online-appointment-fallback-user';
        userTemplateData = {
          ...baseTemplateData,
          notes: appointment.notes || 'No additional notes provided.'
        };
        
        // Trainer email
        trainerSubject = 'New Online Training Session Scheduled';
        trainerTemplate = 'online-appointment-fallback-trainer';
        trainerTemplateData = {
          ...baseTemplateData,
          userEmail: user.email,
          notes: appointment.notes || 'No additional notes provided.'
        };
        break;
        
      case 'in-person-appointment-created':
        // User email
        userSubject = 'Your In-Person Training Session is Confirmed';
        userTemplate = 'in-person-appointment-user';
        userTemplateData = {
          ...baseTemplateData,
          location: formatLocation(appointment.location),
          notes: appointment.notes || 'No additional notes provided.'
        };
        
        // Trainer email
        trainerSubject = 'New In-Person Training Session Scheduled';
        trainerTemplate = 'in-person-appointment-trainer';
        trainerTemplateData = {
          ...baseTemplateData,
          location: formatLocation(appointment.location),
          userEmail: user.email,
          notes: appointment.notes || 'No additional notes provided.'
        };
        break;
        
      case 'appointment-cancelled':
        // User email
        userSubject = 'Your Training Session Has Been Cancelled';
        userTemplate = 'appointment-cancelled-user';
        userTemplateData = {
          ...baseTemplateData,
          cancelledBy: cancelledBy === 'trainer' ? `by ${trainer.name}` : 'by you',
          reason: reason || 'No reason provided'
        };
        
        // Trainer email
        trainerSubject = 'Training Session Cancelled';
        trainerTemplate = 'appointment-cancelled-trainer';
        trainerTemplateData = {
          ...baseTemplateData,
          cancelledBy: cancelledBy === 'client' ? `by ${user.name}` : 'by you',
          userEmail: user.email,
          reason: reason || 'No reason provided'
        };
        break;
        
      case 'appointment-confirmed':
        // Only need to send if status was pending before
        userSubject = 'Your Training Session is Confirmed';
        userTemplate = 'appointment-confirmed-user';
        userTemplateData = {
          ...baseTemplateData,
          meetingLink: appointment.meetingLink,
          location: appointment.location ? formatLocation(appointment.location) : null
        };
        
        // No need for trainer email as they confirmed it
        break;
        
      case 'appointment-rescheduled':
        // Format old date for comparison
        const formattedOldDate = formatDate(oldDate, 'MMMM D, YYYY');
        const formattedOldTime = formatDate(oldDate, 'h:mm A');
        const formattedOldEndTime = formatDate(
          new Date(oldDate.getTime() + appointment.duration * 60000),
          'h:mm A'
        );
        
        // User email
        userSubject = 'Your Training Session Has Been Rescheduled';
        userTemplate = 'appointment-rescheduled-user';
        userTemplateData = {
          ...baseTemplateData,
          oldDate: formattedOldDate,
          oldTime: `${formattedOldTime} - ${formattedOldEndTime}`,
          rescheduledBy: cancelledBy === 'trainer' ? `by ${trainer.name}` : 'by you',
          meetingLink: appointment.meetingLink,
          location: appointment.location ? formatLocation(appointment.location) : null
        };
        
        // Trainer email
        trainerSubject = 'Training Session Rescheduled';
        trainerTemplate = 'appointment-rescheduled-trainer';
        trainerTemplateData = {
          ...baseTemplateData,
          oldDate: formattedOldDate,
          oldTime: `${formattedOldTime} - ${formattedOldEndTime}`,
          rescheduledBy: cancelledBy === 'client' ? `by ${user.name}` : 'by you',
          userEmail: user.email,
          meetingLink: appointment.meetingLink,
          location: appointment.location ? formatLocation(appointment.location) : null
        };
        break;
        
      case 'appointment-reminder':
        // User email
        userSubject = 'Reminder: Upcoming Training Session';
        userTemplate = 'appointment-reminder-user';
        userTemplateData = {
          ...baseTemplateData,
          meetingLink: appointment.meetingLink,
          location: appointment.location ? formatLocation(appointment.location) : null,
          reminderTime: '24 hours'
        };
        
        // Trainer email
        trainerSubject = 'Reminder: Upcoming Training Session';
        trainerTemplate = 'appointment-reminder-trainer';
        trainerTemplateData = {
          ...baseTemplateData,
          meetingLink: appointment.meetingLink,
          userEmail: user.email,
          location: appointment.location ? formatLocation(appointment.location) : null,
          reminderTime: '24 hours'
        };
        break;
        
      default:
        throw new Error('Invalid email type');
    }
    
    // Send emails
    const emails = [];
    
    // Send user email
    if (userTemplate) {
      const userHtml = await compileTemplate(userTemplate, userTemplateData);
      emails.push(
        transporter.sendMail({
          from: `"TechTrainer" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: userSubject,
          html: userHtml
        })
      );
    }
    
    // Send trainer email
    if (trainerTemplate) {
      const trainerHtml = await compileTemplate(trainerTemplate, trainerTemplateData);
      emails.push(
        transporter.sendMail({
          from: `"TechTrainer" <${process.env.EMAIL_USER}>`,
          to: trainer.email,
          subject: trainerSubject,
          html: trainerHtml
        })
      );
    }
    
    // Wait for all emails to send
    await Promise.all(emails);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send appointment email:', error);
    // Don't throw - we don't want appointment creation to fail if email fails
    return { success: false, error: error.message };
  }
};

/**
 * Format location for display in emails
 * @param {Object} location - Location object
 * @returns {string} Formatted location string
 */
const formatLocation = (location) => {
  if (!location) return 'Location not specified';
  
  const parts = [];
  if (location.address) parts.push(location.address);
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.zipCode) parts.push(location.zipCode);
  
  return parts.join(', ') || 'Location details not provided';
};

module.exports = {
  sendAppointmentEmail,
  compileTemplate,
  transporter
};