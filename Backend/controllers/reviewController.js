// server/controllers/reviewController.js

const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const geminiClient = require('../utils/geminiClient');

// --- 1. SYSTEM INSTRUCTION (The AI's Role) ---
const AI_SYSTEM_INSTRUCTION = `
You are an expert Senior Software Engineer specializing in security and performance optimization.
Your task is to perform a detailed, professional code review.
You MUST analyze the provided code snippet for the following five categories:
1. Bugs & Errors: Obvious syntax errors, logical flaws, and potential runtime exceptions.
2. Security: Injection risks, data leakage, improper authentication/authorization logic, and insecure defaults.
3. Performance: Inefficient algorithms, unnecessary loops, or database query issues.
4. Best Practices & Readability: Code style, maintainability, naming conventions, and proper use of language features.
5. Suggestions for Improvement: High-level architectural or design recommendations, or better external libraries.

For every review, you MUST return the output as a single JSON object that strictly adheres to the provided JSON Schema. Do not include any text outside of the JSON block.
`;

// --- 2. JSON OUTPUT SCHEMA (Enforced Structure) ---
const REVIEW_JSON_SCHEMA = {
  type: "object",
  properties: {
    overall_summary: {
      type: "string",
      description: "A concise summary (2-3 sentences) of the overall code quality, highlighting the most critical issue and the best part."
    },
    issues_by_category: {
      type: "array",
      description: "Detailed findings grouped by category.",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["Bugs & Errors", "Security", "Performance", "Best Practices & Readability", "Suggestions for Improvement"],
            description: "The type of issue."
          },
          findings: {
            type: "array",
            description: "A list of specific, actionable findings for this category.",
            items: {
              type: "object",
              properties: {
                line: {
                  type: "integer",
                  description: "The approximate line number where the issue occurs. Use 0 if the finding is general or conceptual."
                },
                severity: {
                  type: "string",
                  enum: ["Critical", "High", "Medium", "Low", "Informational"],
                  description: "The severity level of the finding."
                },
                description: {
                  type: "string",
                  description: "A detailed description of the issue and a suggestion for how to fix it."
                }
              },
              required: ["line", "severity", "description"]
            }
          }
        },
        required: ["category", "findings"]
      }
    }
  },
  required: ["overall_summary", "issues_by_category"]
};


// @desc    Submit code for AI review
// @route   POST /api/review/submit
// @access  Private (Requires JWT)
const submitCodeForReview = asyncHandler(async (req, res) => {
  const userId = req.user._id; 
  const { code, language } = req.body;

  // 1. Basic Input Validation
  if (!code || !language) {
    res.status(400);
    throw new Error('Please provide both code and language for review.');
  }

  let reviewReport = {};
  
  // 2. Construct the prompt for the AI
  const userQuery = `Review the following ${language} code for bugs, security, performance, and best practices. Code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  // 3. CORE GEMINI API CALL (Replaces Mock Logic)
  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: [{ role: 'user', parts: [{ text: userQuery }] }],
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: REVIEW_JSON_SCHEMA,
      },
    });

    const jsonString = response.text;
    reviewReport = JSON.parse(jsonString); 

  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    res.status(500);
    throw new Error('Failed to generate AI review. API or parsing error.');
  }
  
  // 4. Save the submission to the database
  try {
    const review = await Review.create({
      userId: userId,
      code: code,
      language: language,
      reviewReport: reviewReport, 
    });

    if (review) {
      // 5. Send the report back to the client
      res.status(201).json({
        message: 'Code submitted successfully. AI review generated.',
        reviewId: review._id,
        reviewReport: reviewReport // Send the final, structured report
      });
    } else {
      res.status(500).json({ message: 'Failed to save review record.' });
    }
  } catch (error) {
    console.error("Database error during saving:", error);
    res.status(500).json({ message: 'Internal Server Error during review submission.' });
  }

});


// @desc    Get all review records for the logged-in user  <-- NEW HISTORY FUNCTION (Step 2.6)
// @route   GET /api/review/history
// @access  Private (Requires JWT)
const getReviewHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Get user ID from the 'protect' middleware

  try {
    // Find all reviews matching the logged-in user's ID
    // Select specific fields and sort by newest first
    const history = await Review.find({ userId: userId })
      .select('language submissionDate reviewReport.overall_summary')
      .sort({ submissionDate: -1 }); 

    res.json(history);
  } catch (error) {
    console.error("Database error fetching history:", error);
    res.status(500).json({ message: 'Internal Server Error while fetching history.' });
  }
});

module.exports = { submitCodeForReview, getReviewHistory }; // <-- Export both functions