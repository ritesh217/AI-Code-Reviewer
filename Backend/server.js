

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


// Import Routes
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // <-- NEW: Imported the review routes

// 1. Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware setup
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// 3. Database Connection Function
const connectDB = async () => {
  try {
    // We should use the provided global variables for canvas environment
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
    // Note: Mongoose is used here, so we skip Firebase init for now.
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB Connected Successfully!');
  } catch (error) {
    console.error(' MongoDB Connection Failed:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// 4. Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});

// ----------------------------------------------------
// 5. Define API Routes (Crucial step: connecting the router middleware)
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes); // <-- NEW: Connected the review routes under /api/review
// ----------------------------------------------------


// 6. Basic Test Route (Moved to end)
app.get('/', (req, res) => {
  res.send('API is running...');
});