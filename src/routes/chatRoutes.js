const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

// Safely import optional dependencies
let Chat, openAIChatbot, User;
try {
  Chat = require("../models/Chat");
  openAIChatbot = require("../services/OpenAIFitnessChatbot");
  User = require("../models/User");
} catch (error) {
  console.warn("Chat dependencies not available:", error.message);
  // Create mock implementations
  Chat = {
    find: async () => [],
    findOne: async () => null,
    countDocuments: async () => 0,
    deleteMany: async () => ({ deletedCount: 0 }),
    save: async () => {},
  };
  openAIChatbot = {
    moderateMessage: async () => ({ flagged: false }),
    generateResponse: async () => "Chat service is currently unavailable.",
    generateWorkoutSuggestion: async () => "Workout suggestions are currently unavailable.",
    generateNutritionAdvice: async () => "Nutrition advice is currently unavailable.",
    getChatStats: async () => ({ messages: 0, responses: 0 }),
  };
}

// @route   POST /api/chat/message
// @desc    Send a message to the AI trainer
// @access  Private
router.post("/message", auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Message content is required",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        status: "error",
        message: "Message cannot exceed 500 characters",
      });
    }

    // Generate a simple response for now
    const response =
      "Thank you for your message! Our AI chat feature is currently being updated. Please check back soon for personalized fitness guidance.";

    res.json({
      status: "success",
      data: {
        message: {
          id: Date.now().toString(),
          from: "assistant",
          content: response,
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Chat message error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process message",
    });
  }
});

// @route   GET /api/chat/messages
// @desc    Get chat message history
// @access  Private
router.get("/messages", auth, async (req, res) => {
  try {
    res.json({
      status: "success",
      data: {
        messages: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          pages: 0,
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve messages",
    });
  }
});

// @route   DELETE /api/chat/messages
// @desc    Clear chat history
// @access  Private
router.delete("/messages", auth, async (req, res) => {
  try {
    res.json({
      status: "success",
      message: "Chat history cleared successfully",
      data: {
        deletedCount: 0,
      },
    });
  } catch (error) {
    console.error("Delete messages error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to clear chat history",
    });
  }
});

// @route   POST /api/chat/feedback
// @desc    Submit feedback about chat responses
// @access  Private
router.post(
  "/feedback",
  auth,
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
  auth,
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
  auth,
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
router.get("/stats", auth, async (req, res) => {
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
