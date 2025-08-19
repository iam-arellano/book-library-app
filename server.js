const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Get MongoDB connection details from environment variables
const mongoHost = process.env.MONGO_HOST || 'mongodb';  // Default to 'mongodb' service name
const mongoPort = process.env.MONGO_PORT || '27017';    // Default MongoDB port
const mongoDB = process.env.MONGO_DB || 'bookLibrary';       // Default database name
const mongoUser = process.env.MONGO_USER;               // MongoDB username
const mongoPass = process.env.MONGO_PASS;               // MongoDB password

// Construct the MongoDB connection URI
const mongoURI = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=admin`;

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Book Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  year: Number
});

// Book Model
const Book = mongoose.model('Book', bookSchema);

// Routes
app.get('/', async (req, res) => {
  const books = await Book.find();
  res.render('index', { books });
});

// Add Book
app.post('/add', async (req, res) => {
  const { title, author, year } = req.body;
  const newBook = new Book({ title, author, year });
  await newBook.save();
  res.redirect('/');
});

// Edit Book
app.get('/edit/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render('edit', { book });
});

app.post('/edit/:id', async (req, res) => {
  const { title, author, year } = req.body;
  await Book.findByIdAndUpdate(req.params.id, { title, author, year });
  res.redirect('/');
});

// Delete Book
app.get('/delete/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Start Server
app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app;