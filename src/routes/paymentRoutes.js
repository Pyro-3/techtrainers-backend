const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { logger } = require("../utils/AdvancedLogger");

// Payment Schema
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["free", "intermediate", "advanced"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "CAD",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "stripe", "manual"],
      default: "credit_card",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String, // For Stripe integration
      unique: true,
      sparse: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    billingPeriod: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    duration: 30, // days
    features: [
      "Basic workout tracking",
      "Access to beginner workouts",
      "Community support",
      "Basic progress tracking",
    ],
  },
  intermediate: {
    name: "Intermediate",
    price: 19.99,
    duration: 30,
    features: [
      "Advanced workout tracking",
      "Intermediate & beginner workouts",
      "Nutrition guidance",
      "Progress analytics",
      "Email support",
    ],
  },
  advanced: {
    name: "Advanced",
    price: 39.99,
    duration: 30,
    features: [
      "All workout levels",
      "Personal trainer consultations",
      "Custom workout plans",
      "Advanced analytics",
      "Priority support",
      "Meal planning",
    ],
  },
};

/**
 * @route   GET /api/payments/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get("/plans", async (req, res) => {
  try {
    res.json({
      status: "success",
      data: {
        plans: SUBSCRIPTION_PLANS,
      },
    });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve subscription plans",
    });
  }
});

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for subscription
 * @access  Private
 */
router.post("/create-intent", auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    // Validate plan
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        status: "error",
        message: "Invalid subscription plan",
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];

    // For free plan, no payment needed
    if (plan === "free") {
      return res.json({
        status: "success",
        data: {
          requiresPayment: false,
          plan: planDetails,
        },
      });
    }

    // Get user details
    const User = mongoose.model("User");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Create payment record
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + planDetails.duration);

    const payment = new Payment({
      userId,
      subscriptionPlan: plan,
      amount: planDetails.price,
      currency: "CAD",
      paymentMethod: "credit_card",
      status: "pending",
      transactionId: `TT_${Date.now()}_${userId}`,
      billingPeriod: {
        start: startDate,
        end: endDate,
      },
      metadata: {
        planName: planDetails.name,
        userEmail: user.email,
        features: planDetails.features,
      },
    });

    await payment.save();

    // In a real implementation, you would integrate with Stripe, PayPal, etc.
    // For now, we'll simulate a payment intent
    const paymentIntent = {
      id: payment._id,
      amount: planDetails.price * 100, // Convert to cents
      currency: "cad",
      status: "requires_payment_method",
      client_secret: `pi_${payment._id}_secret_${Date.now()}`,
    };

    await logger.logBusinessEvent("info", "Payment intent created", {
      paymentId: payment._id,
      userId,
      plan,
      amount: planDetails.price,
    });

    res.json({
      status: "success",
      data: {
        requiresPayment: true,
        paymentIntent,
        plan: planDetails,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    await logger.logError("Failed to create payment intent", {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to create payment intent",
    });
  }
});

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment and activate subscription
 * @access  Private
 */
router.post("/confirm", auth, async (req, res) => {
  try {
    const { paymentId, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Find payment record
    const payment = await Payment.findOne({ _id: paymentId, userId });

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Payment already processed",
      });
    }

    // In a real implementation, you would process the payment with Stripe/PayPal
    // For demo purposes, we'll simulate successful payment
    const paymentSuccessful = true; // This would come from payment processor

    if (paymentSuccessful) {
      // Update payment status
      payment.status = "completed";
      payment.paymentIntentId = paymentMethodId;
      payment.metadata.processedAt = new Date();
      await payment.save();

      // Update user subscription
      const User = mongoose.model("User");
      const user = await User.findById(userId);

      user.subscription.plan = payment.subscriptionPlan;
      user.subscription.status = "active";
      user.subscription.startDate = payment.billingPeriod.start;
      user.subscription.endDate = payment.billingPeriod.end;

      await user.save();

      await logger.logBusinessEvent(
        "info",
        "Payment confirmed and subscription activated",
        {
          paymentId: payment._id,
          userId,
          plan: payment.subscriptionPlan,
          amount: payment.amount,
        }
      );

      res.json({
        status: "success",
        message: "Payment confirmed and subscription activated",
        data: {
          payment: {
            id: payment._id,
            amount: payment.amount,
            plan: payment.subscriptionPlan,
            status: payment.status,
          },
          subscription: {
            plan: user.subscription.plan,
            status: user.subscription.status,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
          },
        },
      });
    } else {
      // Handle failed payment
      payment.status = "failed";
      payment.metadata.failureReason = "Payment processing failed";
      await payment.save();

      await logger.logError("Payment processing failed", {
        paymentId: payment._id,
        userId,
        plan: payment.subscriptionPlan,
      });

      res.status(400).json({
        status: "error",
        message: "Payment processing failed",
      });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    await logger.logError("Failed to confirm payment", {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to confirm payment",
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPayments = await Payment.countDocuments({ userId });

    res.json({
      status: "success",
      data: {
        payments,
        pagination: {
          total: totalPayments,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalPayments / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve payment history",
    });
  }
});

/**
 * @route   POST /api/payments/cancel-subscription
 * @desc    Cancel user's subscription
 * @access  Private
 */
router.post("/cancel-subscription", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user
    const User = mongoose.model("User");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.subscription.plan === "free") {
      return res.status(400).json({
        status: "error",
        message: "Cannot cancel free subscription",
      });
    }

    // Update subscription status
    user.subscription.status = "cancelled";
    await user.save();

    await logger.logBusinessEvent("info", "Subscription cancelled", {
      userId,
      plan: user.subscription.plan,
      cancelledAt: new Date(),
    });

    res.json({
      status: "success",
      message: "Subscription cancelled successfully",
      data: {
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          endDate: user.subscription.endDate,
        },
      },
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to cancel subscription",
    });
  }
});

/**
 * @route   GET /api/payments/subscription-status
 * @desc    Get user's current subscription status
 * @access  Private
 */
router.get("/subscription-status", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const User = mongoose.model("User");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const isExpired =
      user.subscription.endDate && user.subscription.endDate < now;

    if (isExpired && user.subscription.status === "active") {
      user.subscription.status = "inactive";
      user.subscription.plan = "free";
      await user.save();
    }

    const planDetails = SUBSCRIPTION_PLANS[user.subscription.plan];

    res.json({
      status: "success",
      data: {
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          startDate: user.subscription.startDate,
          endDate: user.subscription.endDate,
          isExpired,
          planDetails,
        },
      },
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve subscription status",
    });
  }
});

module.exports = router;
