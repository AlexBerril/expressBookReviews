const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return typeof username === 'string' && username.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ message: "Invalid Login. Check username and password" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review || review.trim().length === 0) {
    return res.status(400).json({ message: "Review text required (?review=...)" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  const isUpdate = Boolean(books[isbn].reviews[username]);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    reviews: books[isbn].reviews});
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
      const username = req.session?.authorization?.username;
      if (!username) {
        return res.status(403).json({ message: "User not logged in" });
      }
    
      const isbn = req.params.isbn;
      if (!isbn || !books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
    
      const userReviews = books[isbn].reviews;
      if (userReviews && userReviews[username]) {
        delete userReviews[username];
        return res.status(200).json({
          message: "Review deleted successfully",
          reviews: userReviews
        });
      }
    
      return res.status(404).json({ message: "No review found for this user" });
    });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
