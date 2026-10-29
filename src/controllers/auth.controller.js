const { User } = require('../models');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Register a new user
 * POST /api/auth/register/
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return errorResponse(res, 'A user with this email address already exists', 400);
    }

    // Create user record
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    return successResponse(res, {
      user: user.toJSON(),
      token
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Log in a user and return JWT token
 * POST /api/auth/login/
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    return successResponse(res, {
      user: user.toJSON(),
      token
    }, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile (Authenticated)
 * GET /api/auth/me/
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user.toJSON() }, 'Profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
