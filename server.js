const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongoHost = process.env.MONGO_HOST || 'mongodb';  // Default to 'mongodb' service name
const mongoPort = process.env.MONGO_PORT || '27017';    // Default MongoDB port
const mongoDB = process.env.MONGO_DB || 'bookLibrary';  // Default database name
const mongoUser = process.env.MONGO_USER;               // MongoDB username (if applicable)
const mongoPass = process.env.MONGO_PASS;               // MongoDB password (if applicable)

const mongoURI = `mongodb://${mongoUser ? `${mongoUser}:${mongoPass}@` : ''}${mongoHost}:${mongoPort}/${mongoDB}`;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
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
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
