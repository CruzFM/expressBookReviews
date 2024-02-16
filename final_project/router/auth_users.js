const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let validUser = users.filter(user => user.username === username);
  return validUser.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let correctPassword = users.filter(user => user.password === password);
  return (isValid(username) && correctPassword.length > 0 );
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if( !username && !password ){
    return res.status(404).json({message:"Error logging in."});
  }
  if (authenticatedUser(username, password)){
    let accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60 * 60});
    
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in.");
  }
  else {
    return res.status(208).json({message: "Invalid login. Check username and password."});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.query.review;

  if( review ){
    books[isbn].reviews[username] = review;
    return res.status(200).json({message: `Review added: ${review}`});
  }
  else{
    return res.status(404).json({message: "You didn't put any review."});
  }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res)=>{
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  if( isbn ){
    if( books[isbn].reviews[username] ){
      delete books[isbn].reviews[username];
      return res.status(200).json({message:`Review made by ${username} deleted.`});
    }
    return res.status(404).json({message:`No reviews made by ${username} were found.`});
  }
  else{
    return res.status(404).json({message:"No ISBN code provided. Can't delete."})
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
