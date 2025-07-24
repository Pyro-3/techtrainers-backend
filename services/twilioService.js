const twilio = require('twilio');

// Check if Twilio credentials are properly configured
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
let isConfigured = false;

// Validate Twilio configuration
if (accountSid && authToken && phoneNumber) {
  if (accountSid.startsWith('AC')) {
    try {
      client = twilio(accountSid, authToken);
      isConfigured = true;
      console.log('✅ Twilio service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio:', error.message);
    }
  } else {
    console.warn('⚠️ Twilio Account SID must start with "AC". SMS features disabled.');
  }
} else {
  console.warn('⚠️ Twilio credentials not found. SMS features disabled.');
  console.warn('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
}

async function sendSMS(to, message) {
  if (!isConfigured) {
    throw new Error('Twilio is not properly configured. SMS features are disabled.');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: to
    });
    console.log(`✅ SMS sent successfully to ${to}, SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('❌ Twilio SMS Error:', error);
    throw error;
  }
}

function isAvailable() {
  return isConfigured;
}

module.exports = { 
  sendSMS, 
  isAvailable,
  isConfigured 
};
