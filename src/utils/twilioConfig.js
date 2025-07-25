let twilioClient = null;

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (accountSid && authToken && accountSid.startsWith('AC')) {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio initialized successfully');
  } else {
    console.log('⚠️ Twilio credentials not properly configured. SMS features disabled.');
  }
} catch (error) {
  console.log('⚠️ Twilio initialization failed:', error.message);
}

module.exports = {
  twilioClient,
  isConfigured: () => twilioClient !== null
};
