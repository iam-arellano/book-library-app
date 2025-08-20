const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// 👉 Serve index.html on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB config from environment variables or defaults
const mongoHost = process.env.MONGO_HOST || 'mongodb';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDB = process.env.MONGO_DB || 'bookLibrary';
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;

const mongoURI = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=admin`;

// Debug log (remove in production)
console.log('🔧 MongoDB Config:', {
  mongoHost,
  mongoPort,
  mongoDB,
  mongoUser,
  mongoPass
});

// Retry logic for MongoDB
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
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Book schema & model
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  year: Number
});
const Book = mongoose.model('Book', bookSchema);

// -----------------------------
// ✅ API ROUTES (under /api)
// -----------------------------

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Add a new book
app.post('/api/add', async (req, res) => {
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
app.post('/api/edit/:id', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    await Book.findByIdAndUpdate(req.params.id, { title, author, year });
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete a book
app.get('/api/delete/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// -----------------------------

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

module.exports = app;
