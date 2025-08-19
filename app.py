from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_pymongo import PyMongo

app = Flask(__name__)

# Set up MongoDB URI
app.config["MONGO_URI"] = "mongodb://localhost:27017/bookLibrary"  # For local MongoDB
# app.config["MONGO_URI"] = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookLibrary"  # For MongoDB Atlas

mongo = PyMongo(app)

@app.route('/')
def index():
    # Get all books from the database
    books = mongo.db.books.find()
    books_list = [{"id": str(book["_id"]), "book": book["book"]} for book in books]
    return render_template('index.html', books=books_list)

@app.route('/add', methods=['POST'])
def add_book():
    book_name = request.form['book']
    if book_name:   
        mongo.db.books.insert_one({"book": book_name})
        return redirect(url_for('index'))
    return redirect(url_for('index'))

@app.route('/delete/<id>', methods=['GET'])
def delete_book(id):
    mongo.db.books.delete_one({"_id": mongo.db.ObjectId(id)})
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
