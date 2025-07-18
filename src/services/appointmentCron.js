const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendAppointmentEmail } = require('./emailService');

/**
 * Cron service for scheduled tasks
 */

/**
 * Send appointment reminders 24 hours before scheduled time
 */
const sendAppointmentReminders = async () => {
  try {
    console.log('Running appointment reminder job');
    
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    // Find appointments scheduled for tomorrow that haven't had reminders sent
    const appointments = await Appointment.find({
      date: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd
      },
      status: 'confirmed',
      reminderSent: false
    });
    
    console.log(`Found ${appointments.length} appointments requiring reminders`);
    
    // Send reminder for each appointment
    for (const appointment of appointments) {
      try {
        const user = await User.findById(appointment.userId);
        const trainer = await User.findById(appointment.trainerId);
        
        if (user && trainer) {
          await sendAppointmentEmail({
            type: 'appointment-reminder',
            appointment,
            user,
            trainer
          });
          
          // Mark reminder as sent
          appointment.reminderSent = true;
          await appointment.save();
          
          console.log(`Sent reminder for appointment ${appointment._id}`);
        }
      } catch (reminderError) {
        console.error(`Failed to send reminder for appointment ${appointment._id}:`, reminderError);
      }
    }
  } catch (error) {
    console.error('Appointment reminder job failed:', error);
  }
};

/**
 * Schedule cron jobs
 */
const scheduleCronJobs = () => {
  // Run appointment reminders every day at 9:00 AM
  cron.schedule('0 9 * * *', sendAppointmentReminders);
  
  console.log('Scheduled cron jobs successfully');
};

module.exports = {
  scheduleCronJobs,
  sendAppointmentReminders // Exported for manual execution or testing
};