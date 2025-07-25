const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const { auth } = require("../middleware/auth");
const {
  validateSupportTicket,
  validateObjectId,
} = require("../middleware/ReqValidation");
const { apiLimiter } = require("../middleware/rateLimit");

// All routes require authentication
router.use(auth);

// Support tickets
router.post(
  "/tickets",
  apiLimiter,
  validateSupportTicket.create,
  supportController.createTicket
);
router.get("/tickets", supportController.getUserTickets);
router.get("/tickets/:id", validateObjectId, supportController.getTicketById);
router.post(
  "/tickets/:id/reply",
  validateObjectId,
  validateSupportTicket.addMessage,
  supportController.addMessage
);
router.patch(
  "/tickets/:id/close",
  validateObjectId,
  supportController.closeTicket
);

// Help center (placeholder methods)
router.get("/faq", supportController.getTicketCategories);
router.get("/faq/:category", supportController.getTicketCategories);

module.exports = router;
