const express = require('express');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

let normalize = string => {
  let splitted = string.split(' ');
  let joined = splitted.join('').toLowerCase();
  return joined;
}

let isRegistered = (username) =>{
  let registeredUser = users.filter(user => {
    return user.username === username;
  })
  
  return registeredUser.length > 0;
}

public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password){
    if (!isRegistered(username)){
      users.push({"username": username, "password": password});
      return res.status(200).json({message: `${username} was successfully registered.`});
    }
    else {
      return res.status(404).json({message:"User is already registered!"});
    }
  }
  else {
    return res.status(404).json({message:"Unable to register user."});
  }
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try {
    const asyncBooks = await new Promise((resolve, reject) =>{
      setTimeout( ()=>{
        resolve(books);
      }, 2000);
    });
    res.send(JSON.stringify(asyncBooks));
    
  } catch (error) {
    console.error('Error fetching books: ', error);
    res.status(500).json({error: 'Error fetching books.'});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  try {
    const isbn = await new Promise((resolve, reject) =>{
      setTimeout( ()=>{
        resolve( req.params.isbn);
      },2000);
    });
    res.send( JSON.stringify(books[isbn]) );
  } catch (error) {
    console.error('Error fetching ISBN data: ', error);
    res.status(500).json({error: 'Error fetching ISBN data'});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;
  let bookByAuthor = Object.values(books).filter(element => normalize(element.author) === author);
  let getAsyncAuthor = ()=> {
    return new Promise( (resolve, reject) => {
      setTimeout( ()=>{
        resolve(bookByAuthor);
      }, 2000);
    });
  };
  try {
    const result = await getAsyncAuthor();
    if ( result && result.length > 0 ){
      res.send(JSON.stringify(result));
    }
    else{
      res.send("There are not any books for the selected author.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title;
  let [ bookByTitle ] = Object.values(books).filter(element => normalize(element.title) === title);
  const getAsyncTitle = ()=>{
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        resolve(bookByTitle);
      }, 2000);
    });
  };
  try {
    const result = await getAsyncTitle();
      if (result){
        res.send( JSON.stringify(result) );
      }
      else{
        res.send("No books were found with given title.");
      }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  if (isbn) {
    res.send(JSON.stringify(books[isbn].reviews));
  }
  else {
    res.send("The book you are trying to acess doesn't exist in our database.");
  }
});

module.exports.general = public_users;
