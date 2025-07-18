const express = require("express");
const router = express.Router();
const { userAuth } = require("../middleware/userAuth");
const { apiLimiter } = require("../middleware/rateLimit");
const { validate } = require("../middleware/ReqValidation");
const Joi = require("joi");
const Chat = require("../models/Chat");
const { xssSanitizer } = require("../middleware/reqSanitization");
const openAIChatbot = require("../services/OpenAIFitnessChatbot");
const User = require("../models/User");
const rateLimit = require("express-rate-limit");

/**
 * Chat Routes
 * Handles AI trainer chat functionality
 */

// Message validation schema
const messageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(500).required().messages({
    "string.empty": "Message content is required",
    "string.min": "Message must not be empty",
    "string.max": "Message cannot exceed 500 characters",
    "any.required": "Message content is required",
  }),
});

// Rate limit for chat messages - more lenient than regular API
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    status: "error",
    message:
      "Too many messages sent. Please wait a moment before sending more.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/chat/message
// @desc    Send a message to the AI trainer (OpenAI-powered)
// @access  Private
router.post(
  "/message",
  userAuth,
  chatLimiter,
  validate(messageSchema),
  async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user._id;

      // Sanitize the message to prevent XSS
      const sanitizedMessage = xssSanitizer(message);

      // Moderate the message first
      const moderation = await openAIChatbot.moderateMessage(sanitizedMessage);
      if (moderation.flagged) {
        return res.status(400).json({
          status: "error",
          message:
            "Your message contains inappropriate content. Please keep conversations fitness-focused and respectful.",
        });
      }

      // Get user context for personalized responses
      const user = await User.findById(userId).select(
        "fitnessLevel subscriptionPlan goals preferences workoutStats"
      );
      const userContext = {
        userId: userId.toString(),
        fitnessLevel: user?.fitnessLevel || "beginner",
        subscriptionPlan: user?.subscriptionPlan || "free",
        goals: user?.goals || [],
        preferences: user?.preferences || {},
        workoutStats: user?.workoutStats || {},
      };

      // Create and save user message
      const userMessage = new Chat({
        userId,
        sender: "user",
        content: sanitizedMessage,
        timestamp: new Date(),
      });
      await userMessage.save();

      // Generate AI response
      const response = await openAIChatbot.generateResponse(
        sanitizedMessage,
        userContext
      );

      // Create and save assistant message
      const assistantMessage = new Chat({
        userId,
        sender: "assistant",
        content: response,
        timestamp: new Date(),
        metadata: {
          userContext: {
            fitnessLevel: userContext.fitnessLevel,
            subscriptionPlan: userContext.subscriptionPlan,
            goals: userContext.goals,
          },
        },
      });
      await assistantMessage.save();

      res.json({
        status: "success",
        data: {
          message: {
            id: assistantMessage._id,
            from: "assistant",
            content: response,
            timestamp: assistantMessage.timestamp,
          },
        },
      });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to process message",
      });
    }
  }
);

// @route   GET /api/chat/messages
// @desc    Get chat message history
// @access  Private
router.get("/messages", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await Chat.countDocuments({ userId });

    // Fetch messages from database
    const messages = await Chat.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id sender content timestamp")
      .lean();

    // Transform for client-friendly format
    const formattedMessages = messages.map((msg) => ({
      id: msg._id,
      from: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    res.json({
      status: "success",
      data: {
        messages: formattedMessages.reverse(), // Reverse to get chronological order
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve messages",
    });
  }
});

// @route   DELETE /api/chat/messages
// @desc    Clear chat history
// @access  Private
router.delete("/messages", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all messages for this user
    const result = await Chat.deleteMany({ userId });

    res.json({
      status: "success",
      message: "Chat history cleared successfully",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Delete messages error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to clear chat history",
    });
  }
});

// @route   POST /api/chat/feedback
// @desc    Submit feedback about chat responses
// @access  Private
router.post(
  "/feedback",
  userAuth,
  validate(
    Joi.object({
      messageId: Joi.string().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().max(500),
    })
  ),
  async (req, res) => {
    try {
      const { messageId, rating, comment } = req.body;
      const userId = req.user._id;

      // Find the assistant message
      const message = await Chat.findOne({
        _id: messageId,
        userId,
        sender: "assistant",
      });

      if (!message) {
        return res.status(404).json({
          status: "error",
          message: "Message not found",
        });
      }

      // Update with feedback
      message.feedback = {
        rating,
        comment: comment || "",
        timestamp: new Date(),
      };

      await message.save();

      res.json({
        status: "success",
        message: "Feedback submitted successfully",
        data: {
          messageId,
        },
      });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to submit feedback",
      });
    }
  }
);

// @route   POST /api/chat/workout-suggestion
// @desc    Get AI-powered workout suggestions
// @access  Private
router.post(
  "/workout-suggestion",
  userAuth,
  validate(
    Joi.object({
      goals: Joi.array().items(Joi.string()).optional(),
      availableTime: Joi.string().optional(),
      equipment: Joi.string().optional(),
    })
  ),
  async (req, res) => {
    try {
      const { goals, availableTime, equipment } = req.body;
      const userId = req.user._id;

      // Get user context
      const user = await User.findById(userId).select(
        "fitnessLevel subscriptionPlan goals"
      );
      const userContext = {
        userId: userId.toString(),
        fitnessLevel: user?.fitnessLevel || "beginner",
        goals: goals || user?.goals || ["general fitness"],
        availableTime: availableTime || "45 minutes",
        equipment: equipment || "basic gym equipment",
      };

      const suggestion = await openAIChatbot.generateWorkoutSuggestion(
        userContext
      );

      // Save the suggestion as a chat message
      const suggestionMessage = new Chat({
        userId,
        sender: "assistant",
        content: `🏋️‍♂️ **Workout Suggestion:** ${suggestion}`,
        timestamp: new Date(),
        messageType: "workout_suggestion",
        metadata: {
          userContext: {
            fitnessLevel: userContext.fitnessLevel,
            goals: userContext.goals,
          },
        },
      });
      await suggestionMessage.save();

      res.json({
        status: "success",
        data: {
          suggestion: suggestion,
          messageId: suggestionMessage._id,
          timestamp: suggestionMessage.timestamp,
        },
      });
    } catch (error) {
      console.error("Workout suggestion error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to generate workout suggestion",
      });
    }
  }
);

// @route   POST /api/chat/nutrition-advice
// @desc    Get AI-powered nutrition advice
// @access  Private
router.post(
  "/nutrition-advice",
  userAuth,
  validate(
    Joi.object({
      goals: Joi.array().items(Joi.string()).optional(),
      dietaryRestrictions: Joi.string().optional(),
    })
  ),
  async (req, res) => {
    try {
      const { goals, dietaryRestrictions } = req.body;
      const userId = req.user._id;

      // Get user context
      const user = await User.findById(userId).select(
        "fitnessLevel subscriptionPlan goals"
      );
      const userContext = {
        userId: userId.toString(),
        fitnessLevel: user?.fitnessLevel || "beginner",
        goals: goals || user?.goals || ["general fitness"],
        dietaryRestrictions: dietaryRestrictions || null,
      };

      const advice = await openAIChatbot.generateNutritionAdvice(userContext);

      // Save the advice as a chat message
      const adviceMessage = new Chat({
        userId,
        sender: "assistant",
        content: `🥗 **Nutrition Advice:** ${advice}`,
        timestamp: new Date(),
        messageType: "nutrition_advice",
        metadata: {
          userContext: {
            fitnessLevel: userContext.fitnessLevel,
            goals: userContext.goals,
          },
        },
      });
      await adviceMessage.save();

      res.json({
        status: "success",
        data: {
          advice: advice,
          messageId: adviceMessage._id,
          timestamp: adviceMessage.timestamp,
        },
      });
    } catch (error) {
      console.error("Nutrition advice error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to generate nutrition advice",
      });
    }
  }
);

// @route   GET /api/chat/stats
// @desc    Get chat usage statistics
// @access  Private
router.get("/stats", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = "24h" } = req.query;

    const stats = await openAIChatbot.getChatStats(
      userId.toString(),
      timeframe
    );

    res.json({
      status: "success",
      data: {
        stats: stats,
        timeframe: timeframe,
      },
    });
  } catch (error) {
    console.error("Chat stats error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve chat statistics",
    });
  }
});

module.exports = router;
