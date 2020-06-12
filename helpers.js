const bcrypt = require("bcrypt");

//RETURNS the user object corresponding to the email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};
//CHECKS if the password is correct and returns the user object
const authenticateUser = function(email, password, database) {
  const userObject = getUserByEmail(email, database);
  if (userObject && bcrypt.compareSync(password, userObject.password)) {
    return userObject;
  } else {
    return false;
  }
};

//FINDS the URLS belonging to the user id and returns an object {shortURL:longURL}
const urlsForUser = function(id, database) {
  const urls = {};
  for (const shortURL in database) {
    if (database[shortURL].userId === id) {
      urls[shortURL] = database[shortURL].longURL;
    }
  }
  return urls;
};

//ADDS a new user to a database
const addNewUser = function(email, password, database) {
  const id = generateUniqueId(6);
  const userObject = {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  database[id] = userObject;
  return userObject;
};

//GENERATES a random Id
const generateUniqueId = function(IdLength) {
  const rString =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = IdLength; i > 0; --i) {
    result += rString[Math.floor(Math.random() * rString.length)];
  }
  return result;
};

module.exports = {
  getUserByEmail,
  authenticateUser,
  urlsForUser,
  generateUniqueId,
  addNewUser,
};
