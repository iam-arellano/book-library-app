const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Get MongoDB connection details from environment variables
const mongoHost = process.env.MONGO_HOST || 'mongodb';        // Default to Docker service name
const mongoPort = process.env.MONGO_PORT || '27017';          // Default MongoDB port
const mongoDB = process.env.MONGO_DB || 'bookLibrary';        // Database name
const mongoUser = process.env.MONGO_USER;                     // Username (set in docker-compose)
const mongoPass = process.env.MONGO_PASS;                     // Password (set in docker-compose)

// Construct the MongoDB connection URI
const mongoURI = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=admin`;

// Log the config (for debugging only - remove if in production)
console.log('🔧 MongoDB Config:', {
  mongoHost,
  mongoPort,
  mongoDB,
  mongoUser,
  mongoPass
});

// Retry logic to wait for MongoDB to be ready
const connectWithRetry = () => {
  console.log('🔁 Trying to connect to MongoDB...');
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
  });
};

connectWithRetry();

// Define book schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  year: Number
});

// Create model from schema
const Book = mongoose.model('Book', bookSchema);

// Routes

// Get all books
app.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books); // Changed to JSON instead of rendering a view
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Add a new book
app.post('/add', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    const newBook = new Book({ title, author, year });
    await newBook.save();
    res.status(201).json({ message: 'Book added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Edit a book
app.post('/edit/:id', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    await Book.findByIdAndUpdate(req.params.id, { title, author, year });
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete a book
app.get('/delete/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
