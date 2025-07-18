const twilio = require("twilio");
const { logBusinessEvent, logError } = require("../utils/AdvancedLogger");

/**
 * SMS Service for TechTrainers
 * Handles phone verification and 2FA SMS notifications
 */

class SmsService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log("✅ Twilio SMS service initialized");
      } else {
        console.warn(
          "⚠️ Twilio credentials not found. SMS features will be disabled."
        );
        console.log(
          "Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables"
        );
      }
    } catch (error) {
      console.error("❌ Failed to initialize Twilio:", error.message);
    }
  }

  /**
   * Check if SMS service is available
   */
  isAvailable() {
    return this.client !== null && this.fromNumber;
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(
    phoneNumber,
    verificationCode,
    userName = "User"
  ) {
    try {
      if (!this.isAvailable()) {
        throw new Error("SMS service not available");
      }

      const message = `Hi ${userName}! Your TechTrainers verification code is: ${verificationCode}. This code expires in 10 minutes. If you didn't request this, please ignore this message.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      await logBusinessEvent("PHONE_VERIFICATION_SMS_SENT", {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        messageSid: result.sid,
        userName,
      });

      console.log(
        `✅ Phone verification SMS sent to: ${this.maskPhoneNumber(
          phoneNumber
        )}`
      );
      return result;
    } catch (error) {
      await logError("PHONE_VERIFICATION_SMS_FAILED", error, {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        userName,
      });
      throw new Error(`Failed to send verification SMS: ${error.message}`);
    }
  }

  /**
   * Send 2FA authentication code
   */
  async send2FACode(phoneNumber, authCode, userName = "User") {
    try {
      if (!this.isAvailable()) {
        throw new Error("SMS service not available");
      }

      const message = `TechTrainers Security Code: ${authCode}. Use this code to complete your login. This code expires in 5 minutes. Never share this code with anyone.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      await logBusinessEvent("2FA_SMS_SENT", {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        messageSid: result.sid,
        userName,
      });

      console.log(`✅ 2FA SMS sent to: ${this.maskPhoneNumber(phoneNumber)}`);
      return result;
    } catch (error) {
      await logError("2FA_SMS_FAILED", error, {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        userName,
      });
      throw new Error(`Failed to send 2FA SMS: ${error.message}`);
    }
  }

  /**
   * Send account security alert
   */
  async sendSecurityAlert(phoneNumber, alertType, userName = "User") {
    try {
      if (!this.isAvailable()) {
        console.log("SMS service not available for security alert");
        return null;
      }

      let message;
      switch (alertType) {
        case "PASSWORD_CHANGED":
          message = `TechTrainers Security Alert: Your password was changed. If this wasn't you, contact support immediately at support@techtrainers.ca`;
          break;
        case "PHONE_CHANGED":
          message = `TechTrainers Security Alert: Your phone number was updated. If this wasn't you, contact support immediately at support@techtrainers.ca`;
          break;
        case "EMAIL_CHANGED":
          message = `TechTrainers Security Alert: Your email was updated. If this wasn't you, contact support immediately at support@techtrainers.ca`;
          break;
        case "ACCOUNT_LOCKED":
          message = `TechTrainers Security Alert: Your account was locked due to suspicious activity. Contact support at support@techtrainers.ca if you need assistance.`;
          break;
        default:
          message = `TechTrainers Security Alert: Unusual activity detected on your account. Contact support at support@techtrainers.ca if you have concerns.`;
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      await logBusinessEvent("SECURITY_ALERT_SMS_SENT", {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        alertType,
        messageSid: result.sid,
        userName,
      });

      console.log(
        `✅ Security alert SMS sent to: ${this.maskPhoneNumber(phoneNumber)}`
      );
      return result;
    } catch (error) {
      console.error("Failed to send security alert SMS:", error);
      // Don't throw error for security alerts - they're nice to have but not critical
      return null;
    }
  }

  /**
   * Send appointment reminder (if phone number provided)
   */
  async sendAppointmentReminder(phoneNumber, appointmentDetails) {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      const { trainerName, date, time, type } = appointmentDetails;
      const formattedDate = new Date(date).toLocaleDateString("en-CA");

      const message = `TechTrainers Reminder: You have a ${type} session with ${trainerName} on ${formattedDate} at ${time}. See you there! Reply STOP to opt out.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      await logBusinessEvent("APPOINTMENT_REMINDER_SMS_SENT", {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        trainerName,
        appointmentDate: date,
        messageSid: result.sid,
      });

      return result;
    } catch (error) {
      console.error("Failed to send appointment reminder SMS:", error);
      return null;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check for Canadian phone number (10 digits) or international (10-15 digits)
    if (cleaned.length === 10) {
      // Assume North American number, add +1
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      // North American with country code
      return `+${cleaned}`;
    } else if (cleaned.length >= 10 && cleaned.length <= 15) {
      // International number
      return `+${cleaned}`;
    } else {
      throw new Error("Invalid phone number format");
    }
  }

  /**
   * Mask phone number for logging (privacy)
   */
  maskPhoneNumber(phoneNumber) {
    if (!phoneNumber) return "unknown";

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      const lastFour = cleaned.slice(-4);
      const masked = "*".repeat(cleaned.length - 4) + lastFour;
      return `+${masked}`;
    }
    return "***";
  }

  /**
   * Generate verification code
   */
  generateVerificationCode(length = 6) {
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * Check if phone number is likely valid for SMS
   */
  async validateSmsCapability(phoneNumber) {
    try {
      if (!this.isAvailable()) {
        return { valid: false, reason: "SMS service not available" };
      }

      // Basic validation
      const formattedNumber = this.validatePhoneNumber(phoneNumber);

      // Optional: Use Twilio Lookup API to validate number
      if (process.env.TWILIO_LOOKUP_ENABLED === "true") {
        try {
          const lookup = await this.client.lookups.v1
            .phoneNumbers(formattedNumber)
            .fetch();
          return {
            valid: true,
            formatted: lookup.phoneNumber,
            countryCode: lookup.countryCode,
            carrier: lookup.carrier,
          };
        } catch (lookupError) {
          return { valid: false, reason: "Phone number not found or invalid" };
        }
      }

      return { valid: true, formatted: formattedNumber };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Get SMS service status
   */
  getServiceStatus() {
    return {
      available: this.isAvailable(),
      provider: this.client ? "Twilio" : "None",
      fromNumber: this.fromNumber || "Not configured",
      features: {
        phoneVerification: this.isAvailable(),
        twoFactorAuth: this.isAvailable(),
        securityAlerts: this.isAvailable(),
        appointmentReminders: this.isAvailable(),
      },
    };
  }
}

// Export singleton instance
module.exports = new SmsService();
