const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const { userAuth } = require("../middleware/userAuth");
const {
  validateSupportTicket,
  validateObjectId,
} = require("../middleware/ReqValidation");
const { apiLimiter } = require("../middleware/rateLimit");
const { uploadWorkoutFiles } = require("../middleware/fileUpload");

/**
 * User Support Routes
 * Handles all support ticket functionality for regular users
 */

// All routes require authentication
router.use(userAuth);

// Create a new support ticket
router.post(
  "/tickets",
  apiLimiter,
  validateSupportTicket.create,
  uploadWorkoutFiles, // Allow file attachments with tickets
  supportController.createTicket
);

// Get all tickets for the current user
router.get("/tickets", supportController.getUserTickets);

// Get a specific ticket by ID
router.get("/tickets/:id", validateObjectId, supportController.getTicketById);

// Add a reply to an existing ticket
router.post(
  "/tickets/:id/reply",
  validateObjectId,
  validateSupportTicket.addMessage,
  uploadWorkoutFiles, // Allow file attachments with replies
  supportController.addMessage
);

// Close a ticket
router.patch(
  "/tickets/:id/close",
  validateObjectId,
  supportController.closeTicket
);

// Reopen a closed ticket
router.patch(
  "/tickets/:id/reopen",
  validateObjectId,
  supportController.reopenTicket
);

// Delete a ticket (soft delete)
router.delete("/tickets/:id", validateObjectId, supportController.deleteTicket);

// Get ticket categories
router.get("/categories", supportController.getTicketCategories);

// Get frequently asked questions
router.get("/faq", supportController.getFaqCategories);
router.get("/faq/:category", supportController.getFaqByCategory);

// Search knowledge base
router.get("/knowledgebase/search", supportController.searchKnowledgeBase);
router.get(
  "/knowledgebase/:articleId",
  supportController.getKnowledgeBaseArticle
);

// Submit feedback about the support experience
router.post(
  "/feedback",
  validateSupportTicket.feedback,
  supportController.submitSupportFeedback
);

// Get user's feedback history
router.get("/feedback", supportController.getUserFeedback);

module.exports = router;
