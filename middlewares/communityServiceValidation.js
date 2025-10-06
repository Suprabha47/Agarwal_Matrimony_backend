const { body, validationResult } = require("express-validator");

exports.validateCommunityService = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Service name is required.")
    .isLength({ max: 100 })
    .withMessage("Service name cannot exceed 100 characters."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("icon_url")
    .optional()
    .isString()
    .withMessage("Icon URL must be a string."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, errors: errors.array().map((err) => err.msg) });
    }
    next();
  },
];

exports.validateCommunityServiceUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Service name cannot exceed 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("icon_url")
    .optional()
    .isString()
    .withMessage("Icon URL must be a string."),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be true or false."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, errors: errors.array().map((err) => err.msg) });
    }
    next();
  },
];
