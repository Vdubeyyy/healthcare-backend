const { verifyToken } = require('../config/jwt');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid format. Use Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, 'User associated with this token no longer exists.', 401);
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication error: ' + error.message, 500);
  }
};

module.exports = authenticateJWT;
