const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware to protect routes: checks for valid JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  // Expected format: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get token from header (split "Bearer" and the token)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token and decode user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find user by ID and attach user object (without password) to the request
      // We select the user but exclude the password field.
      req.user = await User.findById(decoded.id).select('-password');
      
      // 5. Move to the next middleware/controller
      next();

    } catch (error) {
      console.error(error);
      // If token is invalid or expired
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };