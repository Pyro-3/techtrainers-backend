const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const { adminAuth } = require("../middleware/adminAuth");
const {
  validateSupportTicket,
  validateObjectId,
  customValidation,
} = require("../middleware/ReqValidation");
const { apiLimiter } = require("../middleware/rateLimit");

/**
 * Admin Support Routes
 * Handles all support ticket and feedback management for administrators
 */

// All routes require admin authentication
router.use(adminAuth);

// Support Ticket Management
router.get(
  "/tickets",
  customValidation.pagination,
  supportController.getAllTickets
);
router.get("/tickets/:id", validateObjectId, supportController.getTicketById);
router.patch(
  "/tickets/:id/assign",
  validateObjectId,
  supportController.assignTicket
);
router.patch(
  "/tickets/:id/status",
  validateObjectId,
  supportController.updateTicketStatus
);
router.delete("/tickets/:id", validateObjectId, supportController.deleteTicket);

// Feedback Management
router.get(
  "/feedback",
  customValidation.pagination,
  supportController.getAllFeedback
);
router.get("/feedback/stats", supportController.getFeedbackStats);
router.patch(
  "/feedback/:feedbackId/status",
  validateObjectId,
  validateSupportTicket.updateFeedbackStatus,
  supportController.updateFeedbackStatus
);
router.delete(
  "/feedback/:feedbackId",
  validateObjectId,
  supportController.deleteFeedback
);

// Knowledge Base Management
router.get("/knowledgebase", supportController.getKnowledgeBase);
router.post("/knowledgebase", supportController.createKnowledgeBaseArticle);
router.get(
  "/knowledgebase/:articleId",
  supportController.getKnowledgeBaseArticle
);
router.put(
  "/knowledgebase/:articleId",
  supportController.updateKnowledgeBaseArticle
);
router.delete(
  "/knowledgebase/:articleId",
  supportController.deleteKnowledgeBaseArticle
);

// FAQ Management
router.get("/faq", supportController.getAllFaq);
router.post("/faq", supportController.createFaq);
router.get("/faq/:category", supportController.getFaqByCategory);
router.put("/faq/:faqId", supportController.updateFaq);
router.delete("/faq/:faqId", supportController.deleteFaq);

// Analytics and Reporting
router.get("/analytics/tickets", supportController.getTicketAnalytics);
router.get(
  "/analytics/response-times",
  supportController.getResponseTimeAnalytics
);
router.get(
  "/analytics/agent-performance",
  supportController.getAgentPerformanceAnalytics
);
router.get("/analytics/categories", supportController.getTicketCategories);

module.exports = router;
