require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Export the app for Vercel serverless use
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ScanForge Backend running on http://localhost:${PORT}`);
  });
}
