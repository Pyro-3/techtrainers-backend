# TechTrainers Email Routing & AI Prompt Guide

## 📧 Email Address Routing

Your TechTrainers platform now has specialized email addresses for different types of inquiries:

### **info@techtrainers.ca** - General Information

**Use for:**

- Company information requests
- Membership plan inquiries
- Partnership opportunities
- Media and press inquiries
- General questions about services

### **support@techtrainers.ca** - Technical Support

**Use for:**

- Platform technical issues
- Login and account problems
- App troubleshooting
- Payment processing issues
- Bug reports and system errors

### **bookings@techtrainers.ca** - Booking & Appointments

**Use for:**

- Session scheduling assistance
- Booking system problems
- Appointment rescheduling
- Group booking coordination
- Special accommodation requests

### **trainers@techtrainers.ca** - Trainer Support

**Use for:**

- Trainer application inquiries
- Certification verification
- Trainer onboarding support
- Professional development questions
- Trainer platform training

## 🤖 AI Prompt Specializations

### **COMPLETE-TECHTRAINERS-PROMPT.md** ⭐ (RECOMMENDED)

**Best for:** Full OpenAI web interface setup
**Includes:** All features, all email addresses, comprehensive responses
**Use when:** You want one complete AI assistant for everything

### **booking-assistant-prompt.md** 📅

**Best for:** Dedicated booking and scheduling assistant
**Specializes in:**

- Session scheduling
- Trainer selection guidance
- Booking troubleshooting
- Payment and pricing information
- Cancellation and rescheduling policies

### **trainer-support-prompt.md** 👨‍💼

**Best for:** Trainer recruitment and support
**Specializes in:**

- Trainer application process
- Certification requirements
- Platform training and onboarding
- Professional development
- Trainer business support

### **workout-assistant-prompt.md** 💪

**Best for:** Exercise and fitness guidance
**Specializes in:**

- Workout plan creation
- Exercise form and technique
- Fitness progression
- Equipment alternatives
- Safety guidelines

### **nutrition-assistant-prompt.md** 🥗

**Best for:** Nutrition and meal planning
**Specializes in:**

- Meal planning assistance
- Pre/post workout nutrition
- Dietary guidance
- Nutrition timing
- Healthy eating habits

### **platform-support-prompt.md** 🔧

**Best for:** Technical platform assistance
**Specializes in:**

- Platform navigation help
- Feature explanations
- Troubleshooting guidance
- Account management
- Technical issue resolution

## 🎯 Quick Implementation Guide

### For OpenAI Web Interface (Easiest)

1. Copy content from **COMPLETE-TECHTRAINERS-PROMPT.md**
2. Paste into OpenAI system instructions
3. Set temperature to 0.7, max tokens to 500
4. Test with sample questions

### For Specialized AI Assistants

1. Choose the appropriate specialized prompt file
2. Copy and configure in your AI system
3. Route specific inquiries to specialized assistants
4. Use email addresses for complex cases

## 📬 Email Integration in AI Responses

All prompts now automatically include appropriate email addresses based on context:

**General questions** → Direct to info@techtrainers.ca
**Technical issues** → Direct to support@techtrainers.ca
**Booking problems** → Direct to bookings@techtrainers.ca
**Trainer inquiries** → Direct to trainers@techtrainers.ca

## 🧪 Test Scenarios

### Booking Questions

- "How do I book a session with a trainer?"
- "I need to reschedule my appointment"
- "What are your cancellation policies?"

**Expected:** AI provides booking guidance + directs to bookings@techtrainers.ca

### Trainer Questions

- "I want to become a trainer on your platform"
- "What certifications do you require?"
- "How does trainer payment work?"

**Expected:** AI provides trainer info + directs to trainers@techtrainers.ca

### Technical Questions

- "I can't log into my account"
- "The app keeps crashing"
- "My payment didn't go through"

**Expected:** AI provides troubleshooting + directs to support@techtrainers.ca

### General Questions

- "What membership plans do you offer?"
- "Do you have corporate programs?"
- "How does TechTrainers work?"

**Expected:** AI provides information + directs to info@techtrainers.ca

## ⚙️ Environment Configuration

Your `.env` file now includes:

```env
INFO_EMAIL=info@techtrainers.ca
SUPPORT_EMAIL=support@techtrainers.ca
BOOKINGS_EMAIL=bookings@techtrainers.ca
TRAINERS_EMAIL=trainers@techtrainers.ca
NOREPLY_EMAIL=noreply@techtrainers.ca
```

## 🚀 Ready to Launch!

Your TechTrainers AI system is now equipped with:

✅ **Comprehensive email routing** for all inquiry types
✅ **Specialized AI prompts** for different use cases
✅ **Professional contact information** in all responses
✅ **Clear escalation paths** for complex issues
✅ **Brand-consistent messaging** across all interactions

## 📞 Need Help?

- **General questions:** info@techtrainers.ca
- **Technical support:** support@techtrainers.ca
- **Booking assistance:** bookings@techtrainers.ca
- **Trainer support:** trainers@techtrainers.ca

Your AI assistant will now provide professional, helpful responses while efficiently routing users to the right support channels! 🎯
