const { sendEmail } = require("../utils/EmailService");
const User = require("../models/User");
const WorkoutLog = require("../models/WorkoutLog");

/**
 * AI-Enhanced Email Service for TechTrainers
 * Integrates with OpenAI to provide personalized, contextual emails
 */

class AIEmailService {
  constructor() {
    this.motivationalQuotes = [
      "The only bad workout is the one that didn't happen.",
      "Your body can do it. It's your mind you need to convince.",
      "Success isn't given. It's earned in the gym, in every training session, in every choice.",
      "The pain you feel today will be the strength you feel tomorrow.",
      "Champions don't become champions in the ring. They become champions in their training.",
      "Every expert was once a beginner. Every pro was once an amateur.",
      "The groundwork for all happiness is good health.",
      "Take care of your body. It's the only place you have to live.",
    ];

    this.aiTips = [
      "Start with 10-15 minute workouts and gradually increase duration as your fitness improves.",
      "Focus on compound movements like squats, deadlifts, and push-ups for maximum efficiency.",
      "Consistency beats intensity - aim for 3-4 workouts per week rather than one intense session.",
      "Listen to your body and allow for proper rest and recovery between sessions.",
      "Set specific, measurable goals and track your progress to stay motivated.",
      "Proper nutrition is just as important as exercise for achieving your fitness goals.",
      "Find activities you enjoy - fitness should be fun, not a chore!",
      "Remember to warm up before and cool down after every workout to prevent injury.",
    ];
  }

  /**
   * Get a random motivational quote
   */
  getRandomQuote() {
    return this.motivationalQuotes[
      Math.floor(Math.random() * this.motivationalQuotes.length)
    ];
  }

  /**
   * Get a random AI tip
   */
  getRandomAITip() {
    return this.aiTips[Math.floor(Math.random() * this.aiTips.length)];
  }

  /**
   * Generate personalized content based on user data
   */
  async generatePersonalizedContent(user, contentType) {
    const userWorkouts = await WorkoutLog.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivity = userWorkouts.length > 0 ? userWorkouts[0] : null;
    const totalWorkouts = userWorkouts.length;

    switch (contentType) {
      case "welcome":
        return this.generateWelcomeContent(user);

      case "first_workout":
        return this.generateFirstWorkoutContent(user, recentActivity);

      case "re_engagement":
        return this.generateReEngagementContent(user, totalWorkouts);

      case "milestone":
        return this.generateMilestoneContent(user, totalWorkouts);

      default:
        return this.generateGenericContent(user);
    }
  }

  /**
   * Generate welcome email content
   */
  generateWelcomeContent(user) {
    const fitnessLevel = user.fitnessLevel || "beginner";
    const goals = user.goals || ["general fitness"];

    let personalizedTip = "";
    if (fitnessLevel === "beginner") {
      personalizedTip =
        "Start slow and focus on building consistency. Even 15 minutes of activity daily can make a huge difference!";
    } else if (fitnessLevel === "intermediate") {
      personalizedTip =
        "Challenge yourself with progressive overload - gradually increase intensity, weight, or duration each week.";
    } else {
      personalizedTip =
        "Consider periodization in your training to prevent plateaus and continue making gains.";
    }

    return {
      aiTip: personalizedTip,
      motivationalQuote: this.getRandomQuote(),
      personalizedMessage: `Based on your ${fitnessLevel} fitness level and goals of ${goals.join(
        ", "
      )}, we've curated the perfect starting plan for you!`,
    };
  }

  /**
   * Generate first workout celebration content
   */
  generateFirstWorkoutContent(user, workout) {
    const duration = workout?.duration || 30;
    const exercises = workout?.exercises?.length || 5;
    const estimatedCalories = Math.round(duration * 4.5); // Rough estimate

    return {
      workoutDuration: duration,
      exercisesCompleted: exercises,
      caloriesBurned: estimatedCalories,
      motivationalQuote: this.getRandomQuote(),
      aiCoachingTip:
        "Great start! For your next workout, try to add 5 more minutes or one additional exercise to keep progressing.",
    };
  }

  /**
   * Generate re-engagement content
   */
  generateReEngagementContent(user, totalWorkouts) {
    const lastWorkoutDate = user.lastWorkoutDate || user.createdAt;
    const daysSince = Math.floor(
      (new Date() - new Date(lastWorkoutDate)) / (1000 * 60 * 60 * 24)
    );

    let specialOffer = "";
    let personalizedMessage = "";

    if (daysSince <= 7) {
      specialOffer =
        "Get back on track with a complimentary 15-minute trainer consultation!";
      personalizedMessage =
        "You've been doing great! A short break is normal - let's get you back into your rhythm.";
    } else if (daysSince <= 30) {
      specialOffer = "Welcome back! Enjoy 20% off your next trainer session.";
      personalizedMessage =
        "Life happens, and we understand! You've built a foundation - now let's rebuild that momentum together.";
    } else {
      specialOffer = "Fresh start package: 50% off your first month back!";
      personalizedMessage =
        "Starting over takes courage, and we admire you for being here. Let's create a sustainable routine that fits your current lifestyle.";
    }

    return {
      daysSinceLastWorkout: daysSince,
      specialOffer,
      personalizedMessage,
      aiMotivation:
        "Remember, the hardest part is showing up. Once you take that first step, your body and mind will thank you!",
    };
  }

  /**
   * Generate milestone celebration content
   */
  generateMilestoneContent(user, totalWorkouts) {
    let milestone = "";
    let achievement = "";

    if (totalWorkouts === 5) {
      milestone = "5 Workouts Completed!";
      achievement =
        "You're building a solid foundation! Consistency is key, and you're proving you have what it takes.";
    } else if (totalWorkouts === 10) {
      milestone = "Double Digits!";
      achievement =
        "10 workouts down! You're officially developing a habit. Research shows it takes 21 days to form a habit - you're almost halfway there!";
    } else if (totalWorkouts === 25) {
      milestone = "Quarter Century!";
      achievement =
        "25 workouts is no small feat! You're showing real dedication to your health and fitness goals.";
    } else if (totalWorkouts === 50) {
      milestone = "Half Century Champion!";
      achievement =
        "50 workouts! You've transformed from a beginner to a dedicated fitness enthusiast. Your commitment is inspiring!";
    } else {
      milestone = `${totalWorkouts} Workouts Strong!`;
      achievement =
        "Every workout is a victory, and you're racking up the wins! Keep up the fantastic work.";
    }

    return {
      milestone,
      achievement,
      totalWorkouts,
      motivationalQuote: this.getRandomQuote(),
    };
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    try {
      const content = await this.generatePersonalizedContent(user, "welcome");

      const emailData = {
        userName: user.username || user.email.split("@")[0],
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        preferencesUrl: `${process.env.FRONTEND_URL}/email-preferences`,
        ...content,
      };

      await sendEmail({
        to: user.email,
        subject: `Welcome to TechTrainers, ${emailData.userName}! 🎉`,
        template: "ai-welcome-email",
        data: emailData,
      });

      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  }

  /**
   * Send first workout celebration email
   */
  async sendFirstWorkoutCelebration(user, workout) {
    try {
      const content = await this.generatePersonalizedContent(
        user,
        "first_workout"
      );

      const emailData = {
        userName: user.username || user.email.split("@")[0],
        nextWorkoutUrl: `${process.env.FRONTEND_URL}/workouts`,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        preferencesUrl: `${process.env.FRONTEND_URL}/email-preferences`,
        ...content,
      };

      await sendEmail({
        to: user.email,
        subject: `🎉 Amazing work on your first workout, ${emailData.userName}!`,
        template: "ai-first-workout-celebration",
        data: emailData,
      });

      console.log(`First workout celebration email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending first workout celebration email:", error);
    }
  }

  /**
   * Send re-engagement email
   */
  async sendReEngagementEmail(user) {
    try {
      const content = await this.generatePersonalizedContent(
        user,
        "re_engagement"
      );

      const emailData = {
        userName: user.username || user.email.split("@")[0],
        quickWorkoutUrl: `${process.env.FRONTEND_URL}/quick-workouts`,
        trainerBookingUrl: `${process.env.FRONTEND_URL}/trainers`,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        preferencesUrl: `${process.env.FRONTEND_URL}/email-preferences`,
        ...content,
      };

      await sendEmail({
        to: user.email,
        subject: `We miss you at TechTrainers, ${emailData.userName}! 🤗`,
        template: "ai-re-engagement",
        data: emailData,
      });

      console.log(`Re-engagement email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending re-engagement email:", error);
    }
  }

  /**
   * Automated email triggers based on user activity
   */
  async checkAndSendAutomatedEmails() {
    try {
      // Check for users who completed their first workout
      const newUsers = await User.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        firstWorkoutEmailSent: { $ne: true },
      });

      for (const user of newUsers) {
        const workoutCount = await WorkoutLog.countDocuments({
          userId: user._id,
        });
        if (workoutCount === 1) {
          await this.sendFirstWorkoutCelebration(user);
          await User.findByIdAndUpdate(user._id, {
            firstWorkoutEmailSent: true,
          });
        }
      }

      // Check for inactive users (7+ days)
      const inactiveUsers = await User.find({
        lastWorkoutDate: {
          $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        reEngagementEmailSent: { $ne: true },
      });

      for (const user of inactiveUsers) {
        await this.sendReEngagementEmail(user);
        await User.findByIdAndUpdate(user._id, { reEngagementEmailSent: true });
      }

      console.log(
        `Processed ${newUsers.length} new users and ${inactiveUsers.length} inactive users for automated emails`
      );
    } catch (error) {
      console.error("Error in automated email processing:", error);
    }
  }
}

module.exports = new AIEmailService();
