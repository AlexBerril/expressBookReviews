const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  res.status(200).json({ message: "User successfully registered. You can now log in." });
});

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

public_users.get('/async/books', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/'); 
      return res.status(200).send(response.data);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to fetch books via axios', error: String(err) });
    }
  });

  public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
      const { isbn } = req.params;
      const base = `${req.protocol}://${req.get('host')}`;
      const resp = await axios.get(`${base}/isbn/${isbn}`);
      return res.status(200).send(JSON.stringify(resp.data, null, 4));
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(500).json({ message: "Internal error", error: err.message });
    }
  });  

  public_users.get('/async/author/:author', async (req, res) => {
    try {
      const { author } = req.params;
      const base = `${req.protocol}://${req.get('host')}`;
      const resp = await axios.get(`${base}/author/${encodeURIComponent(author)}`);
      return res.status(200).send(JSON.stringify(resp.data, null, 4));
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(500).json({ message: "Internal error", error: err.message });
    }
  });


  public_users.get('/async/title/:title', async (req, res) => {
    try {
      const { title } = req.params;
      const base = `${req.protocol}://${req.get('host')}`;
      const resp = await axios.get(`${base}/title/${encodeURIComponent(title)}`);
      return res.status(200).send(JSON.stringify(resp.data, null, 4));
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(500).json({ message: "Internal error", error: err.message });
    }
  }); 

module.exports.general = public_users;
