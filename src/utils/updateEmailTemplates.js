/**
 * Email Template Update Utility for TechTrainers
 * This script helps manage and update email templates in the system
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

class EmailTemplateUpdater {
  constructor() {
    this.templatesDir = path.join(__dirname, "../templates/emails");
    this.authTemplatesDir = path.join(__dirname, "../templates/emails/auth");
    this.testOutputDir = path.join(__dirname, "../../../test-email-output");

    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure all necessary directories exist
   */
  ensureDirectories() {
    [this.templatesDir, this.authTemplatesDir, this.testOutputDir].forEach(
      (dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ Created directory: ${dir}`);
        }
      }
    );
  }

  /**
   * Get all email template files
   */
  getTemplateFiles() {
    const templateFiles = {};

    // Main templates
    if (fs.existsSync(this.templatesDir)) {
      const mainTemplates = fs
        .readdirSync(this.templatesDir)
        .filter((file) => file.endsWith(".hbs"))
        .map((file) => ({
          name: file.replace(".hbs", ""),
          path: path.join(this.templatesDir, file),
          type: "appointment",
        }));

      templateFiles.appointment = mainTemplates;
    }

    // Auth templates
    if (fs.existsSync(this.authTemplatesDir)) {
      const authTemplates = fs
        .readdirSync(this.authTemplatesDir)
        .filter((file) => file.endsWith(".hbs"))
        .map((file) => ({
          name: file.replace(".hbs", ""),
          path: path.join(this.authTemplatesDir, file),
          type: "auth",
        }));

      templateFiles.auth = authTemplates;
    }

    return templateFiles;
  }

  /**
   * Create authentication email templates
   */
  createAuthTemplates() {
    console.log("📧 Creating authentication email templates...\n");

    const authTemplates = {
      "email-verification": this.getEmailVerificationTemplate(),
      "email-verified-confirmation":
        this.getEmailVerifiedConfirmationTemplate(),
      "password-reset": this.getPasswordResetTemplate(),
      "password-reset-confirmation":
        this.getPasswordResetConfirmationTemplate(),
      "phone-verification": this.getPhoneVerificationTemplate(),
      "account-locked": this.getAccountLockedTemplate(),
      "login-notification": this.getLoginNotificationTemplate(),
    };

    Object.entries(authTemplates).forEach(([name, template]) => {
      const filePath = path.join(this.authTemplatesDir, `${name}.hbs`);
      fs.writeFileSync(filePath, template);
      console.log(`✅ Created: ${name}.hbs`);
    });

    console.log("\n📧 Authentication email templates created successfully!");
  }

  /**
   * Test email templates with sample data
   */
  testTemplates() {
    console.log("🧪 Testing email templates...\n");

    const sampleData = this.getSampleData();
    const templates = this.getTemplateFiles();

    // Test appointment templates
    if (templates.appointment) {
      templates.appointment.forEach((template) => {
        this.testTemplate(template, sampleData.appointment);
      });
    }

    // Test auth templates
    if (templates.auth) {
      templates.auth.forEach((template) => {
        this.testTemplate(template, sampleData.auth);
      });
    }

    console.log(`\n✅ Test output saved to: ${this.testOutputDir}`);
  }

  /**
   * Test individual template
   */
  testTemplate(template, data) {
    try {
      const templateContent = fs.readFileSync(template.path, "utf8");
      const compiledTemplate = handlebars.compile(templateContent);
      const html = compiledTemplate(data);

      const outputPath = path.join(this.testOutputDir, `${template.name}.html`);
      fs.writeFileSync(outputPath, html);

      console.log(`✅ Tested: ${template.name} (${template.type})`);
    } catch (error) {
      console.error(`❌ Error testing ${template.name}:`, error.message);
    }
  }

  /**
   * Get sample data for testing
   */
  getSampleData() {
    return {
      appointment: {
        clientName: "John Doe",
        clientEmail: "john.doe@example.com",
        clientPhone: "+1-416-555-0123",
        clientFitnessLevel: "Intermediate",
        clientNotes: "Looking to improve strength and endurance",
        trainerName: "Sarah Johnson",
        trainerEmail: "sarah.johnson@techtrainers.ca",
        trainerPhone: "+1-416-555-0456",
        trainerSpecialization: "Strength Training & Nutrition",
        trainerExperience: "5+ years",
        appointmentDate: "Monday, July 15, 2025",
        appointmentTime: "2:00 PM EST",
        newAppointmentDate: "Tuesday, July 16, 2025",
        newAppointmentTime: "3:00 PM EST",
        oldAppointmentDate: "Monday, July 15, 2025",
        oldAppointmentTime: "2:00 PM EST",
        sessionType: "Personal Training",
        duration: "60",
        location: "TechTrainers Fitness Center - Downtown",
        newLocation: "TechTrainers Fitness Center - Downtown",
        oldLocation: "TechTrainers Fitness Center - Downtown",
        locationDetails: "123 Main Street, Suite 200, Toronto, ON M5V 3A8",
        parkingInfo: "Free parking available in the building garage",
        bookingId: "TT-2025-001234",
        reminderTime: "tomorrow at 2:00 PM",
        hoursUntilSession: "24",
        cancelledBy: "Client",
        cancellationTime: "July 14, 2025 at 3:30 PM",
        cancellationReason: "Schedule conflict",
        rescheduledBy: "Client",
        rescheduleTime: "July 14, 2025 at 4:00 PM",
        rescheduleReason: "Work meeting conflict",
        refundAmount: "75.00",
        refundMethod: "Credit Card",
        refundTransactionId: "TXN-789012",
        companyName: process.env.COMPANY_NAME || "TechTrainers",
        companyWebsite:
          process.env.COMPANY_WEBSITE || "https://www.techtrainers.ca",
        supportEmail: process.env.SUPPORT_EMAIL || "support@techtrainers.ca",
        supportUrl:
          process.env.SUPPORT_URL || "https://www.techtrainers.ca/support",
        supportPhone: "+1-416-555-TECH",
        acceptUrl: "https://www.techtrainers.ca/trainer/accept/TT-2025-001234",
        rescheduleUrl: "https://www.techtrainers.ca/reschedule/TT-2025-001234",
        cancelUrl: "https://www.techtrainers.ca/cancel/TT-2025-001234",
        viewAppointmentUrl:
          "https://www.techtrainers.ca/appointments/TT-2025-001234",
        addToCalendarUrl:
          "https://www.techtrainers.ca/calendar/add/TT-2025-001234",
        confirmAttendanceUrl:
          "https://www.techtrainers.ca/confirm/TT-2025-001234",
        bookNewAppointmentUrl: "https://www.techtrainers.ca/book",
        viewAvailableTrainersUrl: "https://www.techtrainers.ca/trainers",
        manageAppointmentsUrl: "https://www.techtrainers.ca/appointments",
        unsubscribeUrl: "https://www.techtrainers.ca/unsubscribe",
        privacyUrl: "https://www.techtrainers.ca/privacy",
      },
      auth: {
        userName: "John Doe",
        userEmail: "john.doe@example.com",
        verificationUrl:
          "https://www.techtrainers.ca/verify-email?token=abc123&email=john.doe@example.com",
        verificationCode: "VERIFY123",
        resetUrl:
          "https://www.techtrainers.ca/reset-password?token=reset456&email=john.doe@example.com",
        resetCode: "RESET456",
        phoneNumber: "+1-416-555-0123",
        phoneVerificationCode: "123456",
        loginUrl: "https://www.techtrainers.ca/login",
        lockDurationMinutes: "30",
        companyName: process.env.COMPANY_NAME || "TechTrainers",
        companyWebsite:
          process.env.COMPANY_WEBSITE || "https://www.techtrainers.ca",
        supportEmail: process.env.SUPPORT_EMAIL || "support@techtrainers.ca",
        supportUrl:
          process.env.SUPPORT_URL || "https://www.techtrainers.ca/support",
        expirationHours: "24",
        expirationMinutes: "10",
      },
    };
  }

  /**
   * Email verification template
   */
  getEmailVerificationTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to {{companyName}}!</h1>
            <p>Please verify your email address to get started</p>
        </div>
        <div class="content">
            <h3>Hi {{userName}},</h3>
            <p>Thank you for joining TechTrainers! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            </p>
            <p>Or use this verification code: <strong>{{verificationCode}}</strong></p>
            <p>This link will expire in {{expirationHours}} hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Email verified confirmation template
   */
  getEmailVerifiedConfirmationTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Email Verified Successfully!</h1>
            <p>Welcome to the TechTrainers community</p>
        </div>
        <div class="content">
            <h3>Congratulations {{userName}}!</h3>
            <p>Your email has been successfully verified. You can now access all TechTrainers features:</p>
            <ul>
                <li>Book appointments with personal trainers</li>
                <li>Access workout plans and nutrition guides</li>
                <li>Track your fitness progress</li>
                <li>Join our fitness community</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{loginUrl}}" class="button">Start Your Fitness Journey</a>
            </p>
            <p>Need help getting started? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
        <div class="footer">
            <p>Welcome to {{companyName}}! | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Password reset template
   */
  getPasswordResetTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
            <p>Reset your TechTrainers password</p>
        </div>
        <div class="content">
            <h3>Hi {{userName}},</h3>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
            </p>
            <p>Or use this reset code: <strong>{{resetCode}}</strong></p>
            <p>This link will expire in {{expirationMinutes}} minutes.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Password reset confirmation template
   */
  getPasswordResetConfirmationTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Your password has been updated</p>
        </div>
        <div class="content">
            <h3>Hi {{userName}},</h3>
            <p>Your password has been successfully reset. You can now log in to your account with your new password.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{loginUrl}}" class="button">Log In Now</a>
            </p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} Security Team | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Phone verification template
   */
  getPhoneVerificationTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phone Verification - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .code { font-size: 24px; font-weight: 700; color: #3b82f6; text-align: center; background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 Phone Verification</h1>
            <p>Verify your phone number</p>
        </div>
        <div class="content">
            <h3>Hi {{userName}},</h3>
            <p>Please enter this verification code to verify your phone number:</p>
            <div class="code">{{phoneVerificationCode}}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Account locked template
   */
  getAccountLockedTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Locked - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Account Temporarily Locked</h1>
            <p>Security protection activated</p>
        </div>
        <div class="content">
            <h3>Hi {{userName}},</h3>
            <p>Your TechTrainers account has been temporarily locked due to multiple failed login attempts.</p>
            <p>Your account will be automatically unlocked in <strong>{{lockDurationMinutes}} minutes</strong>.</p>
            <p>If this wasn't you, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} Security Team | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Login notification template
   */
  getLoginNotificationTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Notification - TechTrainers</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #fafaf9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .footer { background: #292524; color: #a8a29e; padding: 20px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Login Notification</h1>
            <p>Account access notification</p>
        </div>
        <div class="content">
            <h3>Hi {{userName}},</h3>
            <p>We noticed a login to your TechTrainers account.</p>
            <p>If this was you, no action is needed.</p>
            <p>If you didn't log in, please contact our support team immediately and consider changing your password.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} Security Team | <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Display template status
   */
  displayStatus() {
    console.log("📊 Email Template Status Report\n");
    console.log("=".repeat(50));

    const templates = this.getTemplateFiles();

    if (templates.appointment) {
      console.log("\n📧 Appointment Templates:");
      templates.appointment.forEach((template) => {
        const size = fs.statSync(template.path).size;
        console.log(`  ✅ ${template.name}.hbs (${size} bytes)`);
      });
    }

    if (templates.auth) {
      console.log("\n🔐 Authentication Templates:");
      templates.auth.forEach((template) => {
        const size = fs.statSync(template.path).size;
        console.log(`  ✅ ${template.name}.hbs (${size} bytes)`);
      });
    }

    console.log("\n" + "=".repeat(50));
    console.log("📁 Template Directories:");
    console.log(`  📂 Main: ${this.templatesDir}`);
    console.log(`  📂 Auth: ${this.authTemplatesDir}`);
    console.log(`  📂 Test Output: ${this.testOutputDir}`);
  }

  /**
   * Main update function
   */
  update() {
    console.log("🔄 Starting Email Template Update...\n");

    this.displayStatus();
    this.createAuthTemplates();
    this.testTemplates();

    console.log("\n🎉 Email template update completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Review generated templates in test output directory");
    console.log("2. Configure email settings in .env file");
    console.log("3. Test email sending functionality");
    console.log("4. Deploy templates to production");
  }
}

// Export the class
module.exports = EmailTemplateUpdater;

// Run if called directly
if (require.main === module) {
  const updater = new EmailTemplateUpdater();

  // Check command line arguments
  const args = process.argv.slice(2);

  if (args.includes("--status")) {
    updater.displayStatus();
  } else if (args.includes("--test")) {
    updater.testTemplates();
  } else if (args.includes("--auth")) {
    updater.createAuthTemplates();
  } else {
    updater.update();
  }
}
