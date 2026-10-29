const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err);

  // Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    const formattedErrors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return errorResponse(res, 'Validation error', 400, formattedErrors);
  }

  // Sequelize Unique Constraint Errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const formattedErrors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return errorResponse(res, 'Duplicate entry error: record already exists', 409, formattedErrors);
  }

  // JSON Body Parse Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload in request body', 400);
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
