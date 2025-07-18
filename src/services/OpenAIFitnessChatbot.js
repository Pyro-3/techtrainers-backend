const OpenAI = require("openai");
const { logger } = require("../utils/AdvancedLogger");

/**
 * OpenAI-Powered Fitness Chatbot Service
 * Enhanced AI assistant specifically trained for fitness coaching
 */
class OpenAIFitnessChatbot {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.enabled = !!this.apiKey;

    if (this.enabled) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    } else {
      console.warn(
        "⚠️ OpenAI API key not found. Chat features will be disabled."
      );
      console.warn(
        "Please set OPENAI_API_KEY environment variable to enable AI chat features."
      );
      this.openai = null;
    }

    // System prompt for the fitness assistant
    this.systemPrompt = `You are TechTrainer's expert fitness assistant, a knowledgeable and encouraging personal trainer with expertise in:

CORE EXPERTISE:
- Strength training and muscle building
- Weight loss and nutrition
- Workout programming and periodization
- Exercise form and technique
- Injury prevention and recovery
- Motivation and mindset coaching
- Canadian fitness culture and accessibility

PERSONALITY:
- Encouraging and supportive
- Professional but approachable
- Evidence-based recommendations
- Adaptable to all fitness levels
- Motivational without being pushy
- Inclusive and body-positive

GUIDELINES:
- Always ask about fitness level, goals, and any limitations
- Provide specific, actionable advice
- Emphasize safety and proper form
- Suggest modifications for different skill levels
- Encourage consistency over perfection
- Never diagnose medical conditions - refer to healthcare professionals
- Keep responses concise but comprehensive
- Use Canadian spelling and terminology where appropriate

USER CONTEXT:
- Users are TechTrainer app members (beginner, intermediate, or advanced)
- They have access to workout plans, progress tracking, and trainer consultations
- Many are Canadian users
- Range from complete beginners to experienced lifters

RESPONSE FORMAT:
- Keep responses under 200 words unless detailed explanation is needed
- Use bullet points for lists
- Include relevant emojis sparingly
- Ask follow-up questions to provide better assistance
- Suggest using TechTrainer features when relevant

Remember: You're not just answering questions - you're coaching and motivating users on their fitness journey.`;
  }

  /**
   * Generate AI response based on user message and context
   */
  async generateResponse(userMessage, userContext = {}) {
    if (!this.enabled) {
      return {
        response:
          "I'm sorry, but the AI chat feature is currently unavailable. Please check your OpenAI API configuration.",
        tokens: 0,
        conversationId: null,
      };
    }

    try {
      // Build context about the user for more personalized responses
      const contextMessage = this.buildUserContextMessage(userContext);

      // Get conversation history for context
      const conversationHistory = await this.getRecentConversationHistory(
        userContext.userId
      );

      // Build messages array for OpenAI
      const messages = [
        { role: "system", content: this.systemPrompt },
        { role: "system", content: contextMessage },
        ...conversationHistory,
        { role: "user", content: userMessage },
      ];

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = completion.choices[0].message.content.trim();

      // Log the interaction
      await logger.logBusinessEvent("info", "OpenAI chat response generated", {
        userId: userContext.userId,
        messageLength: userMessage.length,
        responseLength: response.length,
        tokensUsed: completion.usage.total_tokens,
        model: completion.model,
      });

      return response;
    } catch (error) {
      await logger.logError("OpenAI chat generation failed", {
        error: error.message,
        userId: userContext.userId,
        userMessage: userMessage.substring(0, 100) + "...",
        stack: error.stack,
      });

      // Fallback to basic response if OpenAI fails
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Build user context message for personalized responses
   */
  buildUserContextMessage(userContext) {
    const {
      userId,
      fitnessLevel = "beginner",
      subscriptionPlan = "free",
      workoutStats = {},
      goals = [],
      preferences = {},
    } = userContext;

    return `USER PROFILE:
- Fitness Level: ${fitnessLevel}
- Subscription: ${subscriptionPlan}
- Workout Stats: ${workoutStats.totalWorkouts || 0} workouts completed, ${
      workoutStats.currentStreak || 0
    } day streak
- Goals: ${goals.length > 0 ? goals.join(", ") : "No specific goals set"}
- Preferences: ${preferences.preferredTime || "Not specified"} workouts
- User ID: ${userId}

Tailor your response to their fitness level and subscription tier. Encourage them to use TechTrainer features relevant to their plan.`;
  }

  /**
   * Get recent conversation history for context
   */
  async getRecentConversationHistory(userId, limit = 6) {
    try {
      const Chat = require("../models/Chat");

      const recentMessages = await Chat.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select("sender content timestamp");

      // Convert to OpenAI message format and reverse for chronological order
      return recentMessages.reverse().map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));
    } catch (error) {
      await logger.logError("Failed to get conversation history", {
        error: error.message,
        userId,
      });
      return [];
    }
  }

  /**
   * Fallback response when OpenAI is unavailable
   */
  getFallbackResponse(userMessage) {
    const lowercaseMessage = userMessage.toLowerCase();

    if (
      lowercaseMessage.includes("workout") ||
      lowercaseMessage.includes("exercise")
    ) {
      return "I'd be happy to help with your workout! While I'm experiencing some technical difficulties, I can still provide basic guidance. Focus on compound movements like squats, deadlifts, and push-ups. What specific exercises are you interested in?";
    } else if (
      lowercaseMessage.includes("diet") ||
      lowercaseMessage.includes("nutrition")
    ) {
      return "Nutrition is crucial for fitness success! Focus on whole foods, adequate protein (0.8-1g per pound of body weight), and stay hydrated. I'm having some connection issues but can provide basic nutrition guidance. What are your specific nutrition questions?";
    } else if (
      lowercaseMessage.includes("motivation") ||
      lowercaseMessage.includes("struggling")
    ) {
      return "I understand the struggle - fitness journeys have ups and downs! Remember that consistency beats perfection. Set small, achievable goals and celebrate your progress. What specific challenges are you facing today?";
    } else {
      return "I'm your TechTrainer assistant, though I'm experiencing some technical difficulties right now. I'm here to help with workouts, nutrition, and motivation. What specific fitness questions do you have?";
    }
  }

  /**
   * Generate workout suggestions based on user profile
   */
  async generateWorkoutSuggestion(userContext) {
    if (!this.enabled) {
      return {
        workout:
          "AI workout suggestions are currently unavailable. Please try basic routines based on your fitness level.",
        tokens: 0,
      };
    }

    const { fitnessLevel, goals, availableTime, equipment } = userContext;

    const workoutPrompt = `Generate a specific workout recommendation for a ${fitnessLevel} user with these details:
- Goals: ${goals.join(", ")}
- Available time: ${availableTime || "45 minutes"}
- Equipment: ${equipment || "basic gym equipment"}
- Format: Provide exercise names, sets, reps, and brief form tips
- Keep it practical and achievable`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: workoutPrompt },
        ],
        max_tokens: 400,
        temperature: 0.6,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      await logger.logError("Workout suggestion generation failed", {
        error: error.message,
        userContext,
      });

      return `Here's a basic ${fitnessLevel} workout suggestion:
1. Warm-up: 5-10 minutes light cardio
2. Compound movements: squats, deadlifts, push-ups
3. Accessory work: planks, lunges, rows
4. Cool-down: 5-10 minutes stretching

For more detailed workout plans, check out your TechTrainer dashboard!`;
    }
  }

  /**
   * Generate nutrition advice based on user goals
   */
  async generateNutritionAdvice(userContext) {
    if (!this.enabled) {
      return `Here are some basic nutrition tips for your goals:
• Eat adequate protein (0.8-1g per pound of body weight)
• Include complex carbohydrates for energy
• Don't forget healthy fats from nuts, avocados, and fish
• Stay hydrated throughout the day
• Focus on whole, unprocessed foods when possible

For personalized meal plans, consider upgrading to our Advanced plan!`;
    }

    const { goals, fitnessLevel, dietaryRestrictions } = userContext;

    const nutritionPrompt = `Provide nutrition advice for a ${fitnessLevel} user with these goals: ${goals.join(
      ", "
    )}
${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions}` : ""}
Focus on practical, Canadian-accessible foods and realistic meal planning.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: nutritionPrompt },
        ],
        max_tokens: 350,
        temperature: 0.6,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      await logger.logError("Nutrition advice generation failed", {
        error: error.message,
        userContext,
      });

      return `Here are some basic nutrition tips for your goals:
• Eat adequate protein (0.8-1g per pound of body weight)
• Include complex carbohydrates for energy
• Don't forget healthy fats from nuts, avocados, and fish
• Stay hydrated throughout the day
• Focus on whole, unprocessed foods when possible

For personalized meal plans, consider upgrading to our Advanced plan!`;
    }
  }

  /**
   * Moderate chat messages for safety and appropriateness
   */
  async moderateMessage(message) {
    if (!this.enabled) {
      // If OpenAI is not available, allow the message but log it
      return { flagged: false, safe: true };
    }

    try {
      const moderation = await this.openai.moderations.create({
        input: message,
      });

      const flagged = moderation.results[0].flagged;
      const categories = moderation.results[0].categories;

      if (flagged) {
        await logger.logSecurityEvent("Inappropriate chat message flagged", {
          flaggedCategories: Object.keys(categories).filter(
            (key) => categories[key]
          ),
          messageLength: message.length,
        });
      }

      return {
        flagged,
        categories,
        safe: !flagged,
      };
    } catch (error) {
      await logger.logError("Message moderation failed", {
        error: error.message,
        messageLength: message.length,
      });

      // If moderation fails, allow the message but log it
      return { flagged: false, safe: true };
    }
  }

  /**
   * Get chat usage statistics
   */
  async getChatStats(userId, timeframe = "24h") {
    try {
      const Chat = require("../models/Chat");

      const timeLimit = new Date();
      if (timeframe === "24h") {
        timeLimit.setHours(timeLimit.getHours() - 24);
      } else if (timeframe === "7d") {
        timeLimit.setDate(timeLimit.getDate() - 7);
      } else if (timeframe === "30d") {
        timeLimit.setDate(timeLimit.getDate() - 30);
      }

      const stats = await Chat.aggregate([
        { $match: { userId, timestamp: { $gte: timeLimit } } },
        {
          $group: {
            _id: "$sender",
            count: { $sum: 1 },
            averageLength: { $avg: { $strLenCP: "$content" } },
          },
        },
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averageLength: Math.round(stat.averageLength),
        };
        return acc;
      }, {});
    } catch (error) {
      await logger.logError("Chat stats retrieval failed", {
        error: error.message,
        userId,
        timeframe,
      });
      return {};
    }
  }
}

module.exports = new OpenAIFitnessChatbot();
