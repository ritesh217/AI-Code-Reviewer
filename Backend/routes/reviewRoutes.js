// server/routes/reviewRoutes.js

const express = require('express');
const { submitCodeForReview, getReviewHistory } = require('../controllers/reviewController'); // <-- 1. Import getReviewHistory
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/review/submit - Protected (Step 2.3)
router.post('/submit', protect, submitCodeForReview);

// GET /api/review/history - Protected (Step 2.6) <-- 2. New History Route
router.get('/history', protect, getReviewHistory); 

module.exports = router;