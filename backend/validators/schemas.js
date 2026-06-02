import Joi from 'joi';

// Auth validation schemas
export const authSchemas = {
  authenticate: Joi.object({
    token: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    token: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    displayName: Joi.string().max(100),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'),
    profileImage: Joi.string().uri(),
  }),

  updateSettings: Joi.object({
    emailNotifications: Joi.boolean(),
    monthlyReminder: Joi.boolean(),
  }),
};

// Expense validation schemas
export const expenseSchemas = {
  create: Joi.object({
    title: Joi.string().required().trim().max(200),
    amount: Joi.number().required().positive(),
    category: Joi.string()
      .required()
      .valid(
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Utilities',
        'Healthcare',
        'Education',
        'Housing',
        'Travel',
        'Personal Care',
        'Groceries',
        'Subscriptions',
        'Other'
      ),
    paymentMethod: Joi.string()
      .required()
      .valid('Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer'),
    date: Joi.date().required(),
    description: Joi.string().max(500),
    tags: Joi.array().items(Joi.string().trim()),
    notes: Joi.string().max(1000),
    isRecurring: Joi.boolean(),
    recurringFrequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
  }).required(),

  update: Joi.object({
    title: Joi.string().trim().max(200),
    amount: Joi.number().positive(),
    category: Joi.string().valid(
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Utilities',
      'Healthcare',
      'Education',
      'Housing',
      'Travel',
      'Personal Care',
      'Groceries',
      'Subscriptions',
      'Other'
    ),
    paymentMethod: Joi.string().valid('Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer'),
    date: Joi.date(),
    description: Joi.string().max(500),
    tags: Joi.array().items(Joi.string().trim()),
    notes: Joi.string().max(1000),
    isRecurring: Joi.boolean(),
    recurringFrequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
  }),

  getExpenses: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
    category: Joi.string(),
    paymentMethod: Joi.string(),
    search: Joi.string().max(100),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),

  getStats: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
    groupBy: Joi.string().valid('category', 'paymentMethod', 'date'),
  }),
};

// Create validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors: messages,
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors: messages,
      });
    }

    req.query = value;
    next();
  };
};
