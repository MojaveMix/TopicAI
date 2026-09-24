import { ValidationError } from '../errors/index.js';

/**
 * Validates request data against a Joi schema
 * @param {object} schema - Joi validation schema containing body, params, and/or query
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validSchema = {};
    const objectToValidate = {};

    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        validSchema[key] = schema[key];
        objectToValidate[key] = req[key];
      }
    });

    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    };

    for (const [key, joiSchema] of Object.entries(validSchema)) {
      const { value, error } = joiSchema.validate(req[key], validationOptions);

      if (error) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]/g, '')
        }));

        return next(new ValidationError('Input validation failed', errorDetails));
      }

      // Reassign sanitized / cast value back to request
      req[key] = value;
    }

    next();
  };
};
