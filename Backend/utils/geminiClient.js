// server/utils/geminiClient.js

    const { GoogleGenAI } = require('@google/genai');

    // Load environment variables (dotenv is already loaded in server.js, but
    // requiring it here ensures this utility can be used independently if needed)
    require('dotenv').config();

    // Initialize the Gemini client using the API key from the environment variables
    const geminiClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY 
    });

    // Check if the API key is present
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ ERROR: GEMINI_API_KEY not found in environment variables.");
    } else {
      console.log("💎 Gemini API Client Initialized.");
    }

    module.exports = geminiClient;