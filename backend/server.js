require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const outlineRoutes = require('./routes/outline');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/outline', outlineRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Error handler for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
}); 