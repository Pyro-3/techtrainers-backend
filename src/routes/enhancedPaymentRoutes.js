const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { auth } = require("../middleware/auth");

// Safely import logger with fallback
let logger;
try {
  const advancedLogger = require("../utils/AdvancedLogger");
  logger = {
    logBusinessEvent: advancedLogger.logBusinessEvent || (() => {}),
    logError: advancedLogger.logError || (() => {})
  };
} catch (error) {
  // Create a no-op logger if import fails
  logger = {
    logBusinessEvent: async () => {},
    logError: async () => {}
  };
}

// Enhanced Payment Schema with Canadian focus
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
      enum: [
        "stripe_card",
        "stripe_bank",
        "paypal",
        "apple_pay",
        "google_pay",
        "manual",
      ],
      default: "stripe_card",
    },
    paymentProvider: {
      type: String,
      enum: ["stripe", "paypal", "apple", "google", "manual"],
      default: "stripe",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },
    // Stripe-specific fields
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    // PayPal-specific fields
    paypalOrderId: {
      type: String,
      sparse: true,
    },
    paypalPaymentId: {
      type: String,
      sparse: true,
    },
    // General transaction info
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
    // Canadian-specific fields
    taxInfo: {
      hst: { type: Number, default: 0 }, // Harmonized Sales Tax
      gst: { type: Number, default: 0 }, // Goods and Services Tax
      pst: { type: Number, default: 0 }, // Provincial Sales Tax
      province: { type: String }, // For tax calculation
      totalTax: { type: Number, default: 0 },
    },
    billingAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: "CA" },
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

// Enhanced subscription plans with Canadian pricing
const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    duration: 30, // days
    currency: "CAD",
    stripePriceId: null, // No Stripe needed for free
    features: [
      "Basic workout tracking",
      "Access to beginner workouts",
      "Community support",
      "Basic progress tracking",
    ],
    limits: {
      workouts: 10,
      exercises: 50,
      progress_photos: 5,
    },
  },
  intermediate: {
    name: "Intermediate",
    price: 19.99,
    duration: 30,
    currency: "CAD",
    stripePriceId: process.env.STRIPE_PRICE_ID_INTERMEDIATE, // Set in environment
    features: [
      "Advanced workout tracking",
      "Intermediate & beginner workouts",
      "Nutrition guidance",
      "Progress analytics",
      "Email support",
      "Custom workout plans",
    ],
    limits: {
      workouts: "unlimited",
      exercises: "unlimited",
      progress_photos: 25,
      trainer_consultations: 1,
    },
  },
  advanced: {
    name: "Advanced",
    price: 39.99,
    duration: 30,
    currency: "CAD",
    stripePriceId: process.env.STRIPE_PRICE_ID_ADVANCED, // Set in environment
    features: [
      "All workout levels",
      "Personal trainer consultations",
      "Custom workout plans",
      "Advanced analytics",
      "Priority support",
      "Meal planning",
      "Progress tracking",
      "Video consultations",
    ],
    limits: {
      workouts: "unlimited",
      exercises: "unlimited",
      progress_photos: "unlimited",
      trainer_consultations: 4,
      video_sessions: 2,
    },
  },
};

// Canadian tax rates by province
const CANADIAN_TAX_RATES = {
  AB: { gst: 0.05, pst: 0.0, hst: 0.0 }, // Alberta
  BC: { gst: 0.05, pst: 0.07, hst: 0.0 }, // British Columbia
  MB: { gst: 0.05, pst: 0.07, hst: 0.0 }, // Manitoba
  NB: { gst: 0.0, pst: 0.0, hst: 0.15 }, // New Brunswick
  NL: { gst: 0.0, pst: 0.0, hst: 0.15 }, // Newfoundland and Labrador
  NT: { gst: 0.05, pst: 0.0, hst: 0.0 }, // Northwest Territories
  NS: { gst: 0.0, pst: 0.0, hst: 0.15 }, // Nova Scotia
  NU: { gst: 0.05, pst: 0.0, hst: 0.0 }, // Nunavut
  ON: { gst: 0.0, pst: 0.0, hst: 0.13 }, // Ontario
  PE: { gst: 0.0, pst: 0.0, hst: 0.15 }, // Prince Edward Island
  QC: { gst: 0.05, pst: 0.09975, hst: 0.0 }, // Quebec
  SK: { gst: 0.05, pst: 0.06, hst: 0.0 }, // Saskatchewan
  YT: { gst: 0.05, pst: 0.0, hst: 0.0 }, // Yukon
};

/**
 * Calculate Canadian taxes based on province
 */
function calculateCanadianTaxes(amount, province) {
  const taxRates = CANADIAN_TAX_RATES[province] || CANADIAN_TAX_RATES["ON"]; // Default to Ontario

  const gst = amount * taxRates.gst;
  const pst = amount * taxRates.pst;
  const hst = amount * taxRates.hst;
  const totalTax = gst + pst + hst;

  return {
    gst: Math.round(gst * 100) / 100,
    pst: Math.round(pst * 100) / 100,
    hst: Math.round(hst * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalAmount: Math.round((amount + totalTax) * 100) / 100,
  };
}

/**
 * @route   GET /api/payments/plans
 * @desc    Get available subscription plans with Canadian pricing
 * @access  Public
 */
router.get("/plans", async (req, res) => {
  try {
    const { province = "ON" } = req.query;

    // Calculate taxes for each plan
    const plansWithTaxes = Object.entries(SUBSCRIPTION_PLANS).reduce(
      (acc, [key, plan]) => {
        if (plan.price > 0) {
          const taxInfo = calculateCanadianTaxes(plan.price, province);
          acc[key] = {
            ...plan,
            taxInfo,
            displayPrice: {
              subtotal: plan.price,
              tax: taxInfo.totalTax,
              total: taxInfo.totalAmount,
            },
          };
        } else {
          acc[key] = plan;
        }
        return acc;
      },
      {}
    );

    res.json({
      status: "success",
      data: {
        plans: plansWithTaxes,
        supportedPaymentMethods: [
          {
            type: "stripe_card",
            name: "Credit/Debit Card",
            description: "Visa, Mastercard, American Express",
            icon: "credit-card",
            primary: true,
            processingFee: "2.9% + 30¢",
            instantProcessing: true,
          },
          {
            type: "stripe_bank",
            name: "Bank Transfer (Interac)",
            description: "Direct bank transfer",
            icon: "bank",
            primary: false,
            processingFee: "1.5%",
            instantProcessing: false,
            processingTime: "2-3 business days",
          },
          {
            type: "paypal",
            name: "PayPal",
            description: "Pay with your PayPal account",
            icon: "paypal",
            primary: false,
            processingFee: "3.2% + 30¢",
            instantProcessing: true,
          },
          {
            type: "apple_pay",
            name: "Apple Pay",
            description: "Pay with Touch ID or Face ID",
            icon: "apple",
            primary: false,
            processingFee: "2.9% + 30¢",
            instantProcessing: true,
            deviceRestriction: "Apple devices only",
          },
          {
            type: "google_pay",
            name: "Google Pay",
            description: "Pay with Google Pay",
            icon: "google",
            primary: false,
            processingFee: "2.9% + 30¢",
            instantProcessing: true,
            deviceRestriction: "Android devices",
          },
        ],
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
 * @route   POST /api/payments/create-stripe-intent
 * @desc    Create Stripe payment intent for subscription
 * @access  Private
 */
router.post("/create-stripe-intent", auth, async (req, res) => {
  try {
    const { plan, paymentMethod = "stripe_card", billingAddress } = req.body;
    const userId = req.user._id || req.user.id; // Fix user ID access

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

    // Calculate taxes
    const province = billingAddress?.province || "ON";
    const taxInfo = calculateCanadianTaxes(planDetails.price, province);

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
      paymentMethod,
      paymentProvider: "stripe",
      status: "pending",
      transactionId: `TT_${Date.now()}_${userId}`,
      billingPeriod: {
        start: startDate,
        end: endDate,
      },
      taxInfo,
      billingAddress,
      metadata: {
        planName: planDetails.name,
        userEmail: user.email,
        features: planDetails.features,
        stripePriceId: planDetails.stripePriceId,
      },
    });

    await payment.save();

    // Here you would integrate with Stripe API
    const paymentIntent = {
      id: payment._id,
      amount: Math.round(taxInfo.totalAmount * 100), // Convert to cents
      currency: "cad",
      status: "requires_payment_method",
      client_secret: `pi_${payment._id}_secret_${Date.now()}`,
      metadata: {
        paymentId: payment._id.toString(),
        userId: userId.toString(),
        plan,
      },
    };

    await logger.logBusinessEvent("Stripe payment intent created", {
      paymentId: payment._id,
      userId,
      plan,
      amount: planDetails.price,
      totalAmount: taxInfo.totalAmount,
      province,
    });

    res.json({
      status: "success",
      data: {
        requiresPayment: true,
        paymentIntent,
        plan: planDetails,
        paymentId: payment._id,
        taxInfo,
        supportedCards: ["visa", "mastercard", "amex", "discover"],
        processingInfo: {
          instantProcessing: true,
          refundPolicy: "30-day money-back guarantee",
          securityInfo: "PCI DSS compliant processing",
        },
      },
    });
  } catch (error) {
    console.error("Create Stripe payment intent error:", error);
    await logger.logError("Failed to create Stripe payment intent", {
      error: error.message,
      userId: req.user?._id || req.user?.id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to create payment intent",
    });
  }
});

module.exports = router;
