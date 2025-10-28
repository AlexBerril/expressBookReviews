const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // проверяем, что оба поля есть
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // проверяем, что такого пользователя ещё нет
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // добавляем нового пользователя
  users.push({ username, password });
  res.status(200).json({ message: "User successfully registered. You can now log in." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;       
  const book = books[isbn];            
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify({ [isbn]: book }, null, 4));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase(); 
  const keys = Object.keys(books);                 
  const result = {};

  keys.forEach((key) => {
    const bookAuthor = books[key].author.toLowerCase();
    if (bookAuthor === author) {
      result[key] = books[key];
    }
  });

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }

  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
let title = req.params.title;
  let result = {};

  for (let key in books) {
    if (books[key].title === title) {
      result[key] = books[key];
    }
  }

  res.send(result);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
