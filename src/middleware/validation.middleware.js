const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return errorResponse(res, 'Validation error', 400, formattedErrors);
  };
};

module.exports = validate;
