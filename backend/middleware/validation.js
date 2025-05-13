const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Property validation rules
const propertyValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than 0'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  
  body('bedrooms')
    .notEmpty()
    .withMessage('Number of bedrooms is required')
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  
  body('bathrooms')
    .notEmpty()
    .withMessage('Number of bathrooms is required')
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  
  body('area')
    .notEmpty()
    .withMessage('Area is required')
    .isNumeric()
    .withMessage('Area must be a number')
    .isFloat({ min: 0 })
    .withMessage('Area must be greater than 0'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Property type is required')
    .isIn(['apartment', 'house', 'condo', 'studio'])
    .withMessage('Invalid property type'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  validate
];

// Search validation rules
const searchValidation = [
  body('type')
    .optional()
    .isIn(['apartment', 'house', 'condo', 'studio'])
    .withMessage('Invalid property type'),
  
  body('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be greater than 0'),
  
  body('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be greater than 0'),
  
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  
  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  
  validate
];

module.exports = {
  propertyValidation,
  searchValidation
}; 