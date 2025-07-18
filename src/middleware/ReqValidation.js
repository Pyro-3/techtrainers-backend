const Joi = require("joi");
const { ApiError } = require("./errorHandler");

/**
 * Request validation middleware
 * Provides schema-based validation for API requests
 */

// Generic validation middleware
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const data = req[property];
    const options = {
      abortEarly: false, // Include all errors
      allowUnknown: true, // Allow unknown props
      stripUnknown: false, // Don't remove unknown props
    };

    const { error, value } = schema.validate(data, options);

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        message: detail.message.replace(/['"]/g, ""),
        path: detail.path,
        type: detail.type,
      }));

      return next(new ApiError("Validation error", 400, errorDetails));
    }

    // Replace validated data
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User schemas
  user: {
    register: Joi.object({
      name: Joi.string().trim().min(2).max(50).required().messages({
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name cannot exceed 50 characters",
        "string.empty": "Name is required",
        "any.required": "Name is required",
      }),
      email: Joi.string().trim().email().required().messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),
      password: Joi.string()
        .min(8)
        .max(64)
        .required()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
          "string.min": "Password must be at least 8 characters long",
          "string.max": "Password cannot exceed 64 characters",
          "string.pattern.base":
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          "string.empty": "Password is required",
          "any.required": "Password is required",
        }),
      passwordConfirmation: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Passwords do not match",
          "string.empty": "Password confirmation is required",
          "any.required": "Password confirmation is required",
        }),
      fitnessLevel: Joi.string().valid("beginner", "intermediate", "advanced"),
      profile: Joi.object({
        age: Joi.number().integer().min(13).max(120),
        gender: Joi.string().valid(
          "male",
          "female",
          "other",
          "prefer not to say"
        ),
        height: Joi.number().min(0),
        weight: Joi.number().min(0),
        goals: Joi.array().items(Joi.string()),
      }),
    }),

    login: Joi.object({
      email: Joi.string().trim().email().required().messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
      rememberMe: Joi.boolean(),
    }),

    updateProfile: Joi.object({
      name: Joi.string().trim().min(2).max(50),
      email: Joi.string().trim().email(),
      fitnessLevel: Joi.string().valid("beginner", "intermediate", "advanced"),
      profile: Joi.object({
        age: Joi.number().integer().min(13).max(120),
        gender: Joi.string().valid(
          "male",
          "female",
          "other",
          "prefer not to say"
        ),
        height: Joi.number().min(0),
        weight: Joi.number().min(0),
        goals: Joi.array().items(Joi.string()),
        measurements: Joi.object({
          chest: Joi.number().min(0),
          waist: Joi.number().min(0),
          hips: Joi.number().min(0),
          biceps: Joi.number().min(0),
          thighs: Joi.number().min(0),
        }),
      }),
    }),

    changePassword: Joi.object({
      currentPassword: Joi.string().required().messages({
        "string.empty": "Current password is required",
        "any.required": "Current password is required",
      }),
      newPassword: Joi.string()
        .min(8)
        .max(64)
        .required()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
          "string.min": "New password must be at least 8 characters long",
          "string.max": "New password cannot exceed 64 characters",
          "string.pattern.base":
            "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          "string.empty": "New password is required",
          "any.required": "New password is required",
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Passwords do not match",
          "string.empty": "Password confirmation is required",
          "any.required": "Password confirmation is required",
        }),
    }),
  },

  // Workout schemas
  workout: {
    create: Joi.object({
      title: Joi.string().trim().min(3).max(100).required().messages({
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title cannot exceed 100 characters",
        "string.empty": "Title is required",
        "any.required": "Title is required",
      }),
      description: Joi.string().max(1000),
      exercises: Joi.array().items(
        Joi.object({
          exerciseId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
          name: Joi.string().min(2).max(100),
          sets: Joi.number().integer().min(1),
          reps: Joi.number().integer().min(1),
          duration: Joi.number().min(0),
          restTime: Joi.number().min(0),
          notes: Joi.string().max(500),
        }).xor("exerciseId", "name") // Either exerciseId or name is required
      ),
      type: Joi.string().valid(
        "strength",
        "cardio",
        "flexibility",
        "balance",
        "circuit",
        "hiit",
        "general",
        "custom"
      ),
      difficulty: Joi.string().valid("beginner", "intermediate", "advanced"),
      estimatedDuration: Joi.number().integer().min(1),
      scheduledFor: Joi.date().min("now"),
      notes: Joi.string().max(500),
    }),

    complete: Joi.object({
      duration: Joi.number().integer().min(1),
      caloriesBurned: Joi.number().min(0),
      rating: Joi.number().integer().min(1).max(5),
      notes: Joi.string().max(500),
      exerciseResults: Joi.array().items(
        Joi.object({
          exerciseId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
          name: Joi.string(),
          index: Joi.number().integer().min(0),
          sets: Joi.number().integer().min(1),
          reps: Joi.number().integer().min(0),
          weight: Joi.number().min(0),
          duration: Joi.number().min(0),
          feedback: Joi.string().max(500),
        })
      ),
    }),
  },

  // Support ticket schemas
  supportTicket: {
    create: Joi.object({
      subject: Joi.string().trim().min(5).max(100).required().messages({
        "string.min": "Subject must be at least 5 characters long",
        "string.max": "Subject cannot exceed 100 characters",
        "string.empty": "Subject is required",
        "any.required": "Subject is required",
      }),
      category: Joi.string().valid(
        "general",
        "technical",
        "billing",
        "workout",
        "account"
      ),
      message: Joi.string().trim().min(10).max(2000).required().messages({
        "string.min": "Message must be at least 10 characters long",
        "string.max": "Message cannot exceed 2000 characters",
        "string.empty": "Message is required",
        "any.required": "Message is required",
      }),
    }),

    addMessage: Joi.object({
      message: Joi.string().trim().min(1).max(2000).required().messages({
        "string.min": "Message cannot be empty",
        "string.max": "Message cannot exceed 2000 characters",
        "string.empty": "Message is required",
        "any.required": "Message is required",
      }),
    }),

    feedback: Joi.object({
      ticketId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
          "string.pattern.base": "Invalid ticket ID format",
        }),
      rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "number.base": "Rating must be a number",
        "any.required": "Rating is required",
      }),
      feedback: Joi.string().trim().max(1000).optional().messages({
        "string.max": "Feedback cannot exceed 1000 characters",
      }),
      category: Joi.string()
        .valid("general", "response-time", "helpfulness", "resolution", "other")
        .optional(),
      wasResolved: Joi.boolean().optional(),
      wouldRecommend: Joi.boolean().optional(),
      platform: Joi.string().trim().max(100).optional(),
      appVersion: Joi.string().trim().max(50).optional(),
    }),

    updateFeedbackStatus: Joi.object({
      status: Joi.string()
        .valid("new", "reviewed", "addressed", "archived")
        .required()
        .messages({
          "any.required": "Status is required",
          "any.only":
            "Status must be one of: new, reviewed, addressed, archived",
        }),
      adminNotes: Joi.string().trim().max(500).optional().messages({
        "string.max": "Admin notes cannot exceed 500 characters",
      }),
    }),
  },

  // Progress schemas
  progress: {
    create: Joi.object({
      date: Joi.date().max("now").default(Date.now),
      weight: Joi.number().min(0),
      measurements: Joi.object({
        chest: Joi.number().min(0),
        waist: Joi.number().min(0),
        hips: Joi.number().min(0),
        biceps: Joi.number().min(0),
        thighs: Joi.number().min(0),
      }),
      bodyFat: Joi.number().min(0).max(100),
      notes: Joi.string().max(1000),
      workoutId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      photoUrl: Joi.string().uri(),
    }),
  },

  // ID parameter validation
  id: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid ID format",
        "string.empty": "ID is required",
        "any.required": "ID is required",
      }),
  }),
};

// Function to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ApiError("Invalid ID format", 400));
  }

  next();
};

// Create specific validation middleware instances
const validateUser = {
  register: validate(schemas.user.register),
  login: validate(schemas.user.login),
  updateProfile: validate(schemas.user.updateProfile),
  changePassword: validate(schemas.user.changePassword),
};

const validateWorkout = {
  create: validate(schemas.workout.create),
  complete: validate(schemas.workout.complete),
  id: validate(schemas.id, "params"),
};

const validateSupportTicket = {
  create: validate(schemas.supportTicket.create),
  addMessage: validate(schemas.supportTicket.addMessage),
  feedback: validate(schemas.supportTicket.feedback),
  updateFeedbackStatus: validate(schemas.supportTicket.updateFeedbackStatus),
  id: validate(schemas.id, "params"),
};

const validateProgress = {
  create: validate(schemas.progress.create),
  id: validate(schemas.id, "params"),
};

// Query validation - useful for list endpoints with filters, pagination, etc.
const validateQuery = (schema) => validate(schema, "query");

// Custom validation for specific use cases
const customValidation = {
  pagination: validateQuery(
    Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string(),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    })
  ),

  dateRange: validateQuery(
    Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref("startDate")),
    })
  ),
};

module.exports = {
  validate,
  validateObjectId,
  validateUser,
  validateWorkout,
  validateSupportTicket,
  validateProgress,
  validateQuery,
  customValidation,
  schemas,
};
