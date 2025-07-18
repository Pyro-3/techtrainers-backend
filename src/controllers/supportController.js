const SupportTicket = require("../models/SupportTicket");
const SupportFeedback = require("../models/SupportFeedback");
const User = require("../models/User");
const mongoose = require("mongoose");

// Support ticket operations
const supportController = {
  createTicket: async (req, res) => {
    try {
      const userId = req.user._id;
      const { subject, category, message } = req.body;

      // Validate required fields
      if (!subject || !message) {
        return res.status(400).json({
          status: "error",
          message: "Subject and message are required",
        });
      }

      // Validate category
      const validCategories = [
        "general",
        "technical",
        "billing",
        "workout",
        "account",
      ];
      if (category && !validCategories.includes(category)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid category. Must be one of: general, technical, billing, workout, account",
        });
      }

      // Create new ticket
      const newTicket = new SupportTicket({
        userId,
        subject,
        category: category || "general",
        status: "open",
        messages: [
          {
            sender: "user",
            message,
            timestamp: new Date(),
          },
        ],
      });

      await newTicket.save();

      return res.status(201).json({
        status: "success",
        data: newTicket,
        message: "Support ticket created successfully",
      });
    } catch (error) {
      console.error("Error in createTicket:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to create support ticket",
      });
    }
  },

  getUserTickets: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        status,
        category,
        page = 1,
        limit = 10,
        sortBy = "updatedAt",
        sortOrder = "desc",
      } = req.query;

      // Build filter object
      const filter = { userId };

      // Add status filter if provided
      if (status) {
        // Handle multiple statuses (comma-separated)
        const statuses = status.split(",");
        filter.status = { $in: statuses };
      }

      // Add category filter if provided
      if (category) {
        // Handle multiple categories (comma-separated)
        const categories = category.split(",");
        filter.category = { $in: categories };
      }

      // Determine sort direction
      const sortDirection = sortOrder === "desc" ? -1 : 1;

      // Create sort object
      const sort = {};
      sort[sortBy] = sortDirection;

      // Calculate pagination parameters
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const parsedLimit = parseInt(limit);

      // Execute query with filters, sorting, and pagination
      const tickets = await SupportTicket.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit);

      // Get total count for pagination info
      const total = await SupportTicket.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data: {
          tickets,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parsedLimit),
            limit: parsedLimit,
          },
        },
        message: "Support tickets retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUserTickets:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve support tickets",
      });
    }
  },

  getTicketById: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID format",
        });
      }

      // Find the ticket
      let ticket;

      // If user is admin or support, they can view any ticket
      if (req.user.role === "admin" || req.user.role === "support") {
        ticket = await SupportTicket.findById(id)
          .populate("userId", "name email")
          .populate("assignedTo", "name email");
      } else {
        // Regular users can only view their own tickets
        ticket = await SupportTicket.findOne({ _id: id, userId });
      }

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message:
            "Support ticket not found or you do not have permission to view it",
        });
      }

      return res.status(200).json({
        status: "success",
        data: ticket,
        message: "Support ticket retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getTicketById:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve support ticket",
      });
    }
  },

  addMessage: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { message } = req.body;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID format",
        });
      }

      // Validate message
      if (!message || message.trim() === "") {
        return res.status(400).json({
          status: "error",
          message: "Message cannot be empty",
        });
      }

      // Find the ticket
      let ticket;

      // Admin or support can reply to any ticket
      if (req.user.role === "admin" || req.user.role === "support") {
        ticket = await SupportTicket.findById(id);
      } else {
        // Regular users can only reply to their own tickets
        ticket = await SupportTicket.findOne({ _id: id, userId });
      }

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message:
            "Support ticket not found or you do not have permission to reply",
        });
      }

      // Check if ticket is closed or resolved
      if (ticket.status === "closed") {
        return res.status(400).json({
          status: "error",
          message: "Cannot add message to a closed ticket",
        });
      }

      // Determine sender type
      const senderType =
        req.user.role === "admin" || req.user.role === "support"
          ? "support"
          : "user";

      // Add the new message
      const newMessage = {
        sender: senderType,
        message,
        timestamp: new Date(),
      };

      ticket.messages.push(newMessage);

      // If ticket is resolved and user adds a message, reopen it
      if (ticket.status === "resolved" && senderType === "user") {
        ticket.status = "open";
      }

      // If ticket is open and support adds a message, change status to in-progress
      if (ticket.status === "open" && senderType === "support") {
        ticket.status = "in-progress";
      }

      // Update lastUpdated time
      ticket.updatedAt = new Date();

      // If support/admin replying and ticket isn't assigned, assign it to them
      if (
        senderType === "support" &&
        !ticket.assignedTo &&
        req.user.role !== "admin"
      ) {
        ticket.assignedTo = userId;
      }

      await ticket.save();

      return res.status(200).json({
        status: "success",
        data: ticket,
        message: "Message added successfully",
      });
    } catch (error) {
      console.error("Error in addMessage:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to add message",
      });
    }
  },

  closeTicket: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { resolution } = req.body;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID format",
        });
      }

      // Find the ticket
      let ticket;

      // Admin or support can close any ticket
      if (req.user.role === "admin" || req.user.role === "support") {
        ticket = await SupportTicket.findById(id);
      } else {
        // Regular users can only close their own tickets
        ticket = await SupportTicket.findOne({ _id: id, userId });
      }

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message:
            "Support ticket not found or you do not have permission to close it",
        });
      }

      // Check if ticket is already closed
      if (ticket.status === "closed") {
        return res.status(400).json({
          status: "error",
          message: "Ticket is already closed",
        });
      }

      // Add a system message about the resolution if provided
      if (resolution) {
        const systemMessage = {
          sender: "system",
          message: `Ticket closed with resolution: ${resolution}`,
          timestamp: new Date(),
        };

        ticket.messages.push(systemMessage);
      } else {
        // Add a simple closed message if no resolution provided
        const systemMessage = {
          sender: "system",
          message: `Ticket closed by ${
            req.user.role === "admin" || req.user.role === "support"
              ? "support staff"
              : "user"
          }`,
          timestamp: new Date(),
        };

        ticket.messages.push(systemMessage);
      }

      // Update ticket status to closed
      ticket.status = "closed";
      ticket.closedAt = new Date();
      ticket.closedBy = userId;
      ticket.updatedAt = new Date();

      await ticket.save();

      return res.status(200).json({
        status: "success",
        data: ticket,
        message: "Support ticket closed successfully",
      });
    } catch (error) {
      console.error("Error in closeTicket:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to close support ticket",
      });
    }
  },

  // Additional useful methods for ticket management

  reopenTicket: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { reason } = req.body;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID format",
        });
      }

      // Find the ticket
      let ticket;

      // Admin or support can reopen any ticket
      if (req.user.role === "admin" || req.user.role === "support") {
        ticket = await SupportTicket.findById(id);
      } else {
        // Regular users can only reopen their own tickets
        ticket = await SupportTicket.findOne({ _id: id, userId });
      }

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message:
            "Support ticket not found or you do not have permission to reopen it",
        });
      }

      // Check if ticket is already open
      if (ticket.status === "open" || ticket.status === "in-progress") {
        return res.status(400).json({
          status: "error",
          message: "Ticket is already open",
        });
      }

      // Add a system message about reopening
      const systemMessage = {
        sender: "system",
        message: reason
          ? `Ticket reopened: ${reason}`
          : `Ticket reopened by ${
              req.user.role === "admin" || req.user.role === "support"
                ? "support staff"
                : "user"
            }`,
        timestamp: new Date(),
      };

      ticket.messages.push(systemMessage);

      // Update ticket status
      ticket.status = "open";
      ticket.updatedAt = new Date();
      ticket.closedAt = null;
      ticket.closedBy = null;

      await ticket.save();

      return res.status(200).json({
        status: "success",
        data: ticket,
        message: "Support ticket reopened successfully",
      });
    } catch (error) {
      console.error("Error in reopenTicket:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to reopen support ticket",
      });
    }
  },

  updateTicketStatus: async (req, res) => {
    try {
      // Only admin or support can change status
      if (req.user.role !== "admin" && req.user.role !== "support") {
        return res.status(403).json({
          status: "error",
          message: "Not authorized to update ticket status",
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID format",
        });
      }

      // Validate status
      const validStatuses = ["open", "in-progress", "resolved", "closed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid status. Must be one of: open, in-progress, resolved, closed",
        });
      }

      // Find the ticket
      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Support ticket not found",
        });
      }

      // Add a system message about status change
      const systemMessage = {
        sender: "system",
        message: `Ticket status changed from "${ticket.status}" to "${status}" by ${req.user.name}`,
        timestamp: new Date(),
      };

      ticket.messages.push(systemMessage);

      // Update ticket status
      ticket.status = status;
      ticket.updatedAt = new Date();

      // If status is closed, set closedAt and closedBy
      if (status === "closed") {
        ticket.closedAt = new Date();
        ticket.closedBy = req.user._id;
      } else {
        ticket.closedAt = null;
        ticket.closedBy = null;
      }

      await ticket.save();

      return res.status(200).json({
        status: "success",
        data: ticket,
        message: "Ticket status updated successfully",
      });
    } catch (error) {
      console.error("Error in updateTicketStatus:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to update ticket status",
      });
    }
  },

  assignTicket: async (req, res) => {
    try {
      // Only admin or support can assign tickets
      if (req.user.role !== "admin" && req.user.role !== "support") {
        return res.status(403).json({
          status: "error",
          message: "Not authorized to assign tickets",
        });
      }

      const { id } = req.params;
      const { assignedTo } = req.body;

      // Validate ticket ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID format",
        });
      }

      // Validate assignedTo ID if provided
      if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid assignee ID format",
        });
      }

      // Find the ticket
      const ticket = await SupportTicket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Support ticket not found",
        });
      }

      // If assignedTo is provided, verify it's a support user
      if (assignedTo) {
        const assignee = await User.findOne({
          _id: assignedTo,
          role: { $in: ["admin", "support"] },
        });

        if (!assignee) {
          return res.status(400).json({
            status: "error",
            message: "Invalid assignee. User must be an admin or support agent",
          });
        }

        // Add system message about assignment
        const systemMessage = {
          sender: "system",
          message: `Ticket assigned to ${assignee.name}`,
          timestamp: new Date(),
        };

        ticket.messages.push(systemMessage);
        ticket.assignedTo = assignedTo;
      } else {
        // If no assignedTo, self-assign
        ticket.assignedTo = req.user._id;

        // Add system message about self-assignment
        const systemMessage = {
          sender: "system",
          message: `Ticket assigned to ${req.user.name}`,
          timestamp: new Date(),
        };

        ticket.messages.push(systemMessage);
      }

      // If ticket was open, change to in-progress
      if (ticket.status === "open") {
        ticket.status = "in-progress";
      }

      ticket.updatedAt = new Date();
      await ticket.save();

      // Populate the assignedTo field for response
      const updatedTicket = await SupportTicket.findById(id).populate(
        "assignedTo",
        "name email"
      );

      return res.status(200).json({
        status: "success",
        data: updatedTicket,
        message: "Ticket assigned successfully",
      });
    } catch (error) {
      console.error("Error in assignTicket:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to assign ticket",
      });
    }
  },

  getTicketCategories: async (req, res) => {
    try {
      // Define standard categories with descriptions
      const categories = [
        {
          id: "general",
          name: "General Question",
          description: "General questions about the app or services",
        },
        {
          id: "technical",
          name: "Technical Issue",
          description: "Problems with the app, bugs, or technical difficulties",
        },
        {
          id: "billing",
          name: "Billing/Payment",
          description:
            "Questions about billing, subscriptions, or payment issues",
        },
        {
          id: "workout",
          name: "Workout Programs",
          description:
            "Questions about workout programs, exercises, or training",
        },
        {
          id: "account",
          name: "Account Issues",
          description: "Problems with your account, login, or profile",
        },
      ];

      // Get ticket counts per category if user is admin/support
      if (req.user.role === "admin" || req.user.role === "support") {
        const categoryCounts = await SupportTicket.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);

        // Add counts to categories
        categoryCounts.forEach((item) => {
          const category = categories.find((c) => c.id === item._id);
          if (category) {
            category.ticketCount = item.count;
          }
        });
      }

      return res.json({
        status: "success",
        data: categories,
        message: "Ticket categories retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getTicketCategories:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve ticket categories",
      });
    }
  },

  // Delete ticket (soft delete)
  deleteTicket: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const userId = req.user._id;

      // Find the ticket
      const ticket = await SupportTicket.findOne({
        _id: ticketId,
        userId: userId,
      });

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Support ticket not found",
        });
      }

      // Check if ticket is already deleted
      if (ticket.isDeleted) {
        return res.status(400).json({
          status: "error",
          message: "Ticket is already deleted",
        });
      }

      // Soft delete the ticket
      ticket.isDeleted = true;
      ticket.deletedAt = new Date();
      await ticket.save();

      res.json({
        status: "success",
        message: "Support ticket deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteTicket:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get FAQ categories
  getFaqCategories: async (req, res) => {
    try {
      const faqCategories = [
        {
          id: "getting-started",
          name: "Getting Started",
          description: "Basic setup and onboarding questions",
          articleCount: 12,
        },
        {
          id: "workouts",
          name: "Workouts",
          description: "Exercise routines and fitness plans",
          articleCount: 25,
        },
        {
          id: "nutrition",
          name: "Nutrition",
          description: "Diet and meal planning guidance",
          articleCount: 18,
        },
        {
          id: "subscriptions",
          name: "Subscriptions",
          description: "Billing and subscription management",
          articleCount: 8,
        },
        {
          id: "technical",
          name: "Technical Issues",
          description: "App problems and troubleshooting",
          articleCount: 15,
        },
      ];

      res.json({
        status: "success",
        data: faqCategories,
      });
    } catch (error) {
      console.error("Error in getFaqCategories:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get FAQ by category
  getFaqByCategory: async (req, res) => {
    try {
      const category = req.params.category;

      // Sample FAQ data by category
      const faqData = {
        "getting-started": [
          {
            id: 1,
            question: "How do I create my first workout plan?",
            answer:
              'Navigate to the Workouts section and click "Create New Plan". Follow the guided setup to choose your fitness level and goals.',
            helpful: 45,
            views: 234,
          },
          {
            id: 2,
            question: "How do I track my progress?",
            answer:
              "Use the Progress tab to log your workouts, weight, and measurements. The app will automatically generate progress charts.",
            helpful: 38,
            views: 189,
          },
        ],
        workouts: [
          {
            id: 3,
            question: "Can I modify existing workout plans?",
            answer:
              'Yes! You can customize any workout plan by clicking the "Edit" button. Add or remove exercises as needed.',
            helpful: 52,
            views: 312,
          },
          {
            id: 4,
            question: "What if I don't have all the required equipment?",
            answer:
              'Each exercise includes alternative options. Click "Show Alternatives" to see bodyweight or equipment substitutions.',
            helpful: 41,
            views: 278,
          },
        ],
        nutrition: [
          {
            id: 5,
            question: "How do I set up my nutrition goals?",
            answer:
              "Go to Settings > Nutrition Goals. Enter your target calories, macros, and dietary preferences.",
            helpful: 33,
            views: 156,
          },
        ],
        subscriptions: [
          {
            id: 6,
            question: "How do I upgrade my subscription?",
            answer:
              "Visit Settings > Subscription to view available plans and upgrade options.",
            helpful: 28,
            views: 134,
          },
        ],
        technical: [
          {
            id: 7,
            question: "The app won't sync my data",
            answer:
              "Try logging out and back in. If the issue persists, check your internet connection and restart the app.",
            helpful: 19,
            views: 89,
          },
        ],
      };

      const faqs = faqData[category] || [];

      res.json({
        status: "success",
        data: {
          category: category,
          faqs: faqs,
        },
      });
    } catch (error) {
      console.error("Error in getFaqByCategory:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Search knowledge base
  searchKnowledgeBase: async (req, res) => {
    try {
      const { query, category } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          status: "error",
          message: "Search query must be at least 2 characters long",
        });
      }

      // Sample search results
      const searchResults = [
        {
          id: 1,
          title: "How to create effective workout routines",
          excerpt:
            "Learn the fundamentals of building workout plans that match your fitness goals...",
          category: "workouts",
          relevance: 0.95,
          url: "/knowledgebase/workout-routines",
        },
        {
          id: 2,
          title: "Nutrition basics for beginners",
          excerpt:
            "Understanding macronutrients and how to plan your meals for optimal results...",
          category: "nutrition",
          relevance: 0.87,
          url: "/knowledgebase/nutrition-basics",
        },
        {
          id: 3,
          title: "Troubleshooting sync issues",
          excerpt:
            "Common solutions for data synchronization problems in the TechTrainer app...",
          category: "technical",
          relevance: 0.76,
          url: "/knowledgebase/sync-issues",
        },
      ];

      // Filter by category if specified
      let filteredResults = searchResults;
      if (category) {
        filteredResults = searchResults.filter(
          (result) => result.category === category
        );
      }

      // Filter by query (simple text matching)
      const queryLower = query.toLowerCase();
      filteredResults = filteredResults.filter(
        (result) =>
          result.title.toLowerCase().includes(queryLower) ||
          result.excerpt.toLowerCase().includes(queryLower)
      );

      res.json({
        status: "success",
        data: {
          query: query,
          category: category,
          results: filteredResults,
          totalResults: filteredResults.length,
        },
      });
    } catch (error) {
      console.error("Error in searchKnowledgeBase:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get knowledge base article
  getKnowledgeBaseArticle: async (req, res) => {
    try {
      const articleId = req.params.articleId;

      // Sample article data
      const articles = {
        "workout-routines": {
          id: "workout-routines",
          title: "How to Create Effective Workout Routines",
          category: "workouts",
          content: `
            <h2>Creating Your Perfect Workout Routine</h2>
            <p>Building an effective workout routine is essential for achieving your fitness goals...</p>
            <h3>Step 1: Define Your Goals</h3>
            <p>Before creating any routine, clearly define what you want to achieve...</p>
            <h3>Step 2: Choose Your Exercises</h3>
            <p>Select exercises that align with your goals and fitness level...</p>
          `,
          author: "TechTrainer Team",
          publishDate: "2024-01-15",
          lastUpdated: "2024-07-10",
          views: 1234,
          helpful: 89,
          tags: ["workout", "planning", "fitness", "beginner"],
        },
        "nutrition-basics": {
          id: "nutrition-basics",
          title: "Nutrition Basics for Beginners",
          category: "nutrition",
          content: `
            <h2>Understanding Nutrition Fundamentals</h2>
            <p>Proper nutrition is the foundation of any successful fitness journey...</p>
            <h3>Macronutrients</h3>
            <p>Learn about proteins, carbohydrates, and fats...</p>
          `,
          author: "TechTrainer Nutrition Team",
          publishDate: "2024-02-01",
          lastUpdated: "2024-07-05",
          views: 987,
          helpful: 76,
          tags: ["nutrition", "diet", "macros", "beginner"],
        },
      };

      const article = articles[articleId];

      if (!article) {
        return res.status(404).json({
          status: "error",
          message: "Article not found",
        });
      }

      res.json({
        status: "success",
        data: article,
      });
    } catch (error) {
      console.error("Error in getKnowledgeBaseArticle:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Submit support feedback
  submitSupportFeedback: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        ticketId,
        rating,
        feedback,
        category,
        wasResolved,
        wouldRecommend,
        platform,
        appVersion,
      } = req.body;

      // Validate rating
      if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
          status: "error",
          message: "Rating must be an integer between 1 and 5",
        });
      }

      let ticket = null;
      let supportAgent = null;
      let responseTime = null;
      let resolutionTime = null;
      let ticketStats = null;

      // If ticketId is provided, verify the ticket exists and belongs to user
      if (ticketId) {
        ticket = await SupportTicket.findOne({
          _id: ticketId,
          userId: userId,
        }).populate("assignedTo", "name email");

        if (!ticket) {
          return res.status(404).json({
            status: "error",
            message: "Support ticket not found",
          });
        }

        // Check if feedback already exists for this ticket
        const existingFeedback = await SupportFeedback.findOne({
          userId: userId,
          ticketId: ticketId,
          isDeleted: false,
        });

        if (existingFeedback) {
          return res.status(400).json({
            status: "error",
            message: "Feedback already submitted for this ticket",
          });
        }

        // Calculate response and resolution times
        if (ticket.messages && ticket.messages.length > 1) {
          const firstResponse = ticket.messages.find(
            (msg) => msg.sender === "support"
          );
          if (firstResponse) {
            responseTime = Math.round(
              (firstResponse.timestamp - ticket.createdAt) / (1000 * 60 * 60)
            ); // hours
          }
        }

        if (ticket.status === "closed" || ticket.status === "resolved") {
          resolutionTime = Math.round(
            (ticket.updatedAt - ticket.createdAt) / (1000 * 60 * 60)
          ); // hours
        }

        // Get ticket statistics
        ticketStats = {
          totalMessages: ticket.messages ? ticket.messages.length : 0,
          ticketDuration: Math.round(
            (new Date() - ticket.createdAt) / (1000 * 60 * 60)
          ), // hours
          reopenCount: ticket.reopenCount || 0,
        };

        supportAgent = ticket.assignedTo ? ticket.assignedTo._id : null;

        // Add feedback reference to the ticket
        ticket.feedback = {
          rating: rating,
          comment: feedback || "",
          category: category || "general",
          submittedAt: new Date(),
        };

        await ticket.save();
      }

      // Create comprehensive feedback record
      const feedbackData = {
        userId,
        rating,
        feedback: feedback || "",
        category: category || "general",
        wasResolved,
        wouldRecommend,
        metadata: {
          platform,
          userAgent: req.get("User-Agent"),
          appVersion,
          ipAddress: req.ip,
          ticketStats,
        },
      };

      // Add optional fields if available
      if (ticketId) feedbackData.ticketId = ticketId;
      if (supportAgent) feedbackData.supportAgent = supportAgent;
      if (responseTime !== null) feedbackData.responseTime = responseTime;
      if (resolutionTime !== null) feedbackData.resolutionTime = resolutionTime;

      const supportFeedback = new SupportFeedback(feedbackData);
      await supportFeedback.save();

      // Populate the feedback for response
      await supportFeedback.populate([
        { path: "userId", select: "name email" },
        { path: "ticketId", select: "subject category status" },
        { path: "supportAgent", select: "name email" },
      ]);

      res.json({
        status: "success",
        message: "Feedback submitted successfully",
        data: {
          feedbackId: supportFeedback._id,
          ticketId: ticketId,
          rating: rating,
          category: category || "general",
          submittedAt: supportFeedback.submittedAt,
          responseTime,
          resolutionTime,
          feedback: supportFeedback,
        },
      });
    } catch (error) {
      console.error("Error in submitSupportFeedback:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get feedback statistics (Admin only)
  getFeedbackStats: async (req, res) => {
    try {
      const { timeframe = "30d", groupBy = "day" } = req.query;

      const stats = await SupportFeedback.getStats(timeframe);
      const trends = await SupportFeedback.getTrends(timeframe, groupBy);
      const lowRatedFeedback = await SupportFeedback.getLowRatedFeedback(10);

      res.json({
        status: "success",
        data: {
          stats,
          trends,
          lowRatedFeedback,
          timeframe,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error in getFeedbackStats:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get all feedback (Admin only)
  getAllFeedback: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        rating,
        category,
        status,
        sortBy = "submittedAt",
        sortOrder = "desc",
      } = req.query;

      const filter = { isDeleted: false };
      if (rating) filter.rating = parseInt(rating);
      if (category) filter.category = category;
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const feedback = await SupportFeedback.find(filter)
        .populate("userId", "name email")
        .populate("ticketId", "subject category status")
        .populate("supportAgent", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await SupportFeedback.countDocuments(filter);

      res.json({
        status: "success",
        data: {
          feedback,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getAllFeedback:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get user's feedback history
  getUserFeedback: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;

      const feedback = await SupportFeedback.find({
        userId,
        isDeleted: false,
      })
        .populate("ticketId", "subject category status")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await SupportFeedback.countDocuments({
        userId,
        isDeleted: false,
      });

      res.json({
        status: "success",
        data: {
          feedback,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getUserFeedback:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Update feedback status (Admin only)
  updateFeedbackStatus: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const { status, adminNotes } = req.body;
      const adminId = req.user._id;

      const feedback = await SupportFeedback.findById(feedbackId);
      if (!feedback) {
        return res.status(404).json({
          status: "error",
          message: "Feedback not found",
        });
      }

      if (status) feedback.status = status;
      if (adminNotes) feedback.adminNotes = adminNotes;

      if (status === "reviewed") {
        feedback.followUp.contacted = true;
        feedback.followUp.contactedAt = new Date();
        feedback.followUp.contactedBy = adminId;
      }

      await feedback.save();

      res.json({
        status: "success",
        message: "Feedback status updated successfully",
        data: feedback,
      });
    } catch (error) {
      console.error("Error in updateFeedbackStatus:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Delete feedback (Admin only)
  deleteFeedback: async (req, res) => {
    try {
      const { feedbackId } = req.params;

      const feedback = await SupportFeedback.findById(feedbackId);
      if (!feedback) {
        return res.status(404).json({
          status: "error",
          message: "Feedback not found",
        });
      }

      await feedback.softDelete();

      res.json({
        status: "success",
        message: "Feedback deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteFeedback:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get all tickets for admin (with pagination and filtering)
  getAllTickets: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        category,
        priority,
        assignedTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filter = { isUserDeleted: false };
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const tickets = await SupportTicket.find(filter)
        .populate("userId", "name email")
        .populate("assignedTo", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await SupportTicket.countDocuments(filter);

      res.json({
        status: "success",
        data: {
          tickets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getAllTickets:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get knowledge base articles
  getKnowledgeBase: async (req, res) => {
    try {
      const { category, search, page = 1, limit = 10 } = req.query;

      // Mock knowledge base data - in production, this would come from a database
      const knowledgeBase = [
        {
          id: "1",
          title: "Getting Started with TechTrainers",
          category: "general",
          content: "Learn how to get started with our platform...",
          tags: ["getting-started", "basics"],
          views: 150,
          helpful: 42,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          title: "Creating Your First Workout Plan",
          category: "workout",
          content: "Step-by-step guide to creating workout plans...",
          tags: ["workout", "planning"],
          views: 200,
          helpful: 65,
          createdAt: new Date("2024-01-16"),
          updatedAt: new Date("2024-01-16"),
        },
        {
          id: "3",
          title: "Troubleshooting Login Issues",
          category: "technical",
          content: "Common login problems and solutions...",
          tags: ["login", "troubleshooting"],
          views: 89,
          helpful: 23,
          createdAt: new Date("2024-01-17"),
          updatedAt: new Date("2024-01-17"),
        },
        {
          id: "4",
          title: "Account Settings and Preferences",
          category: "account",
          content: "How to manage your account settings...",
          tags: ["account", "settings"],
          views: 120,
          helpful: 34,
          createdAt: new Date("2024-01-18"),
          updatedAt: new Date("2024-01-18"),
        },
      ];

      let filteredArticles = knowledgeBase;

      // Filter by category
      if (category) {
        filteredArticles = filteredArticles.filter(
          (article) => article.category === category
        );
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredArticles = filteredArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchLower) ||
            article.content.toLowerCase().includes(searchLower) ||
            article.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Pagination
      const skip = (page - 1) * limit;
      const paginatedArticles = filteredArticles.slice(
        skip,
        skip + parseInt(limit)
      );

      res.json({
        status: "success",
        data: {
          articles: paginatedArticles,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredArticles.length,
            pages: Math.ceil(filteredArticles.length / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getKnowledgeBase:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Create knowledge base article
  createKnowledgeBaseArticle: async (req, res) => {
    try {
      const { title, category, content, tags } = req.body;

      // Validate required fields
      if (!title || !category || !content) {
        return res.status(400).json({
          status: "error",
          message: "Title, category, and content are required",
        });
      }

      // Mock creation - in production, save to database
      const newArticle = {
        id: Date.now().toString(),
        title,
        category,
        content,
        tags: tags || [],
        views: 0,
        helpful: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: req.user._id,
      };

      res.status(201).json({
        status: "success",
        message: "Knowledge base article created successfully",
        data: newArticle,
      });
    } catch (error) {
      console.error("Error in createKnowledgeBaseArticle:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Update knowledge base article
  updateKnowledgeBaseArticle: async (req, res) => {
    try {
      const { articleId } = req.params;
      const { title, category, content, tags } = req.body;

      // Mock update - in production, update in database
      const updatedArticle = {
        id: articleId,
        title,
        category,
        content,
        tags: tags || [],
        updatedAt: new Date(),
        updatedBy: req.user._id,
      };

      res.json({
        status: "success",
        message: "Knowledge base article updated successfully",
        data: updatedArticle,
      });
    } catch (error) {
      console.error("Error in updateKnowledgeBaseArticle:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Delete knowledge base article
  deleteKnowledgeBaseArticle: async (req, res) => {
    try {
      const { articleId } = req.params;

      // Mock deletion - in production, delete from database
      res.json({
        status: "success",
        message: "Knowledge base article deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteKnowledgeBaseArticle:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get all FAQ items
  getAllFaq: async (req, res) => {
    try {
      const { category, search } = req.query;

      // Mock FAQ data - in production, this would come from a database
      const faqData = [
        {
          id: "1",
          question: "How do I reset my password?",
          answer:
            'You can reset your password by clicking the "Forgot Password" link on the login page.',
          category: "account",
          order: 1,
          isActive: true,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          question: "How do I cancel my subscription?",
          answer:
            "You can cancel your subscription from your account settings page.",
          category: "billing",
          order: 2,
          isActive: true,
          createdAt: new Date("2024-01-16"),
          updatedAt: new Date("2024-01-16"),
        },
        {
          id: "3",
          question: "What equipment do I need for workouts?",
          answer:
            "Most workouts can be done with basic equipment like dumbbells, resistance bands, and a yoga mat.",
          category: "workout",
          order: 3,
          isActive: true,
          createdAt: new Date("2024-01-17"),
          updatedAt: new Date("2024-01-17"),
        },
        {
          id: "4",
          question: "How do I track my progress?",
          answer:
            "You can track your progress through the Progress tab in your dashboard.",
          category: "general",
          order: 4,
          isActive: true,
          createdAt: new Date("2024-01-18"),
          updatedAt: new Date("2024-01-18"),
        },
      ];

      let filteredFaq = faqData.filter((faq) => faq.isActive);

      // Filter by category
      if (category) {
        filteredFaq = filteredFaq.filter((faq) => faq.category === category);
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredFaq = filteredFaq.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower)
        );
      }

      // Sort by order
      filteredFaq.sort((a, b) => a.order - b.order);

      res.json({
        status: "success",
        data: {
          faqs: filteredFaq,
          total: filteredFaq.length,
        },
      });
    } catch (error) {
      console.error("Error in getAllFaq:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Create FAQ item
  createFaq: async (req, res) => {
    try {
      const { question, answer, category, order } = req.body;

      // Validate required fields
      if (!question || !answer || !category) {
        return res.status(400).json({
          status: "error",
          message: "Question, answer, and category are required",
        });
      }

      // Mock creation - in production, save to database
      const newFaq = {
        id: Date.now().toString(),
        question,
        answer,
        category,
        order: order || 999,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: req.user._id,
      };

      res.status(201).json({
        status: "success",
        message: "FAQ created successfully",
        data: newFaq,
      });
    } catch (error) {
      console.error("Error in createFaq:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Update FAQ item
  updateFaq: async (req, res) => {
    try {
      const { faqId } = req.params;
      const { question, answer, category, order, isActive } = req.body;

      // Mock update - in production, update in database
      const updatedFaq = {
        id: faqId,
        question,
        answer,
        category,
        order,
        isActive,
        updatedAt: new Date(),
        updatedBy: req.user._id,
      };

      res.json({
        status: "success",
        message: "FAQ updated successfully",
        data: updatedFaq,
      });
    } catch (error) {
      console.error("Error in updateFaq:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Delete FAQ item
  deleteFaq: async (req, res) => {
    try {
      const { faqId } = req.params;

      // Mock deletion - in production, delete from database
      res.json({
        status: "success",
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteFaq:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get ticket analytics
  getTicketAnalytics: async (req, res) => {
    try {
      const { timeframe = "30d" } = req.query;

      // Calculate date range
      const timeLimit = new Date();
      if (timeframe === "7d") {
        timeLimit.setDate(timeLimit.getDate() - 7);
      } else if (timeframe === "30d") {
        timeLimit.setDate(timeLimit.getDate() - 30);
      } else if (timeframe === "90d") {
        timeLimit.setDate(timeLimit.getDate() - 90);
      }

      // Get ticket statistics
      const totalTickets = await SupportTicket.countDocuments({
        createdAt: { $gte: timeLimit },
        isUserDeleted: false,
      });

      const ticketsByStatus = await SupportTicket.aggregate([
        { $match: { createdAt: { $gte: timeLimit }, isUserDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const ticketsByCategory = await SupportTicket.aggregate([
        { $match: { createdAt: { $gte: timeLimit }, isUserDeleted: false } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      const ticketsByPriority = await SupportTicket.aggregate([
        { $match: { createdAt: { $gte: timeLimit }, isUserDeleted: false } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]);

      const dailyTickets = await SupportTicket.aggregate([
        { $match: { createdAt: { $gte: timeLimit }, isUserDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        status: "success",
        data: {
          totalTickets,
          ticketsByStatus,
          ticketsByCategory,
          ticketsByPriority,
          dailyTickets,
          timeframe,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error in getTicketAnalytics:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get response time analytics
  getResponseTimeAnalytics: async (req, res) => {
    try {
      const { timeframe = "30d" } = req.query;

      // Calculate date range
      const timeLimit = new Date();
      if (timeframe === "7d") {
        timeLimit.setDate(timeLimit.getDate() - 7);
      } else if (timeframe === "30d") {
        timeLimit.setDate(timeLimit.getDate() - 30);
      } else if (timeframe === "90d") {
        timeLimit.setDate(timeLimit.getDate() - 90);
      }

      // Get tickets with response times
      const tickets = await SupportTicket.find({
        createdAt: { $gte: timeLimit },
        isUserDeleted: false,
        "messages.1": { $exists: true }, // Has at least 2 messages (user + support)
      }).select("createdAt messages category priority");

      const responseTimeData = tickets
        .map((ticket) => {
          const firstUserMessage = ticket.messages[0];
          const firstSupportMessage = ticket.messages.find(
            (msg) => msg.sender === "support"
          );

          if (firstSupportMessage) {
            const responseTime =
              (firstSupportMessage.timestamp - firstUserMessage.timestamp) /
              (1000 * 60 * 60); // hours
            return {
              ticketId: ticket._id,
              category: ticket.category,
              priority: ticket.priority,
              responseTime: Math.round(responseTime * 100) / 100,
            };
          }
          return null;
        })
        .filter(Boolean);

      const averageResponseTime =
        responseTimeData.length > 0
          ? responseTimeData.reduce((sum, item) => sum + item.responseTime, 0) /
            responseTimeData.length
          : 0;

      const responseTimeByCategory = responseTimeData.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item.responseTime);
        return acc;
      }, {});

      // Calculate averages by category
      const avgResponseTimeByCategory = Object.keys(responseTimeByCategory).map(
        (category) => ({
          category,
          averageResponseTime:
            responseTimeByCategory[category].reduce(
              (sum, time) => sum + time,
              0
            ) / responseTimeByCategory[category].length,
          count: responseTimeByCategory[category].length,
        })
      );

      res.json({
        status: "success",
        data: {
          averageResponseTime: Math.round(averageResponseTime * 100) / 100,
          totalTicketsWithResponses: responseTimeData.length,
          responseTimeByCategory: avgResponseTimeByCategory,
          timeframe,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error in getResponseTimeAnalytics:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get agent performance analytics
  getAgentPerformanceAnalytics: async (req, res) => {
    try {
      const { timeframe = "30d" } = req.query;

      // Calculate date range
      const timeLimit = new Date();
      if (timeframe === "7d") {
        timeLimit.setDate(timeLimit.getDate() - 7);
      } else if (timeframe === "30d") {
        timeLimit.setDate(timeLimit.getDate() - 30);
      } else if (timeframe === "90d") {
        timeLimit.setDate(timeLimit.getDate() - 90);
      }

      // Get agent performance data
      const agentPerformance = await SupportTicket.aggregate([
        {
          $match: {
            createdAt: { $gte: timeLimit },
            isUserDeleted: false,
            assignedTo: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$assignedTo",
            totalTickets: { $sum: 1 },
            closedTickets: {
              $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
            },
            resolvedTickets: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "agentInfo",
          },
        },
        {
          $project: {
            agentName: { $arrayElemAt: ["$agentInfo.name", 0] },
            agentEmail: { $arrayElemAt: ["$agentInfo.email", 0] },
            totalTickets: 1,
            closedTickets: 1,
            resolvedTickets: 1,
            completionRate: {
              $multiply: [
                {
                  $divide: [
                    { $add: ["$closedTickets", "$resolvedTickets"] },
                    "$totalTickets",
                  ],
                },
                100,
              ],
            },
          },
        },
        { $sort: { totalTickets: -1 } },
      ]);

      // Get feedback ratings for agents
      const agentFeedback = await SupportFeedback.aggregate([
        {
          $match: {
            submittedAt: { $gte: timeLimit },
            isDeleted: false,
            supportAgent: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$supportAgent",
            averageRating: { $avg: "$rating" },
            totalFeedback: { $sum: 1 },
          },
        },
      ]);

      // Merge performance and feedback data
      const performanceData = agentPerformance.map((agent) => {
        const feedbackData = agentFeedback.find(
          (feedback) => feedback._id.toString() === agent._id.toString()
        );

        return {
          ...agent,
          averageRating: feedbackData
            ? Math.round(feedbackData.averageRating * 100) / 100
            : null,
          totalFeedback: feedbackData ? feedbackData.totalFeedback : 0,
          completionRate: Math.round(agent.completionRate * 100) / 100,
        };
      });

      res.json({
        status: "success",
        data: {
          agentPerformance: performanceData,
          timeframe,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error in getAgentPerformanceAnalytics:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};

module.exports = supportController;
