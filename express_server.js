//DEPENDENCIES
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//FUNCTIONS
const generateRandomString = function () {
  let rString =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 6; i > 0; --i) {
    result += rString[Math.floor(Math.random() * rString.length)];
  }
  return result;
};
const checkExistingUserEmail = function (email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

const authenticateUser = function (email, password) {
  const user = checkExistingUserEmail(email);
  if (user && user.password === password) {
    return user;
  } else {
    return false;
  }
};

//USERS GLOBAL OBJECT DATABASE
const users = {
  "9424e04d": {
    id: "9424e04d",
    email: "abra.cadabra@gmail.com",
    password: "purple-monkey-dinosaur",
  },
  "5b2cdbcb": {
    id: "5b2cdbcb",
    email: "kent.wood@gmail.com",
    password: "dishwasher-funk",
  },
};
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//...HOME PAGE...

//sends Hello when the browser send a request on the home page "localhost:8080/"
app.get("/", (req, res) => {
  res.send("Hello!");
});
//.....................................

//...USER REGISTRATION...

//DISPLAYS the register form
app.get("/register", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: userObject };
  res.render("urls_register", templateVars);
});

//GETS the INFO from the register form
app.post("/register", (req, res) => {
  //extract the infos from the form
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  !email
    ? res.status(400).send("Please enter an email address!")
    : !password
    ? res.status(400).send("Please enter a password!")
    : checkExistingUserEmail(email)
    ? res.status(400).send("You already have an account!")
    : // adds a new object to the global users object
      (users[id] = {
        id,
        email,
        password,
      });
  //sets a cookie containing the newly generated id
  res.cookie("user_id", id);

  res.redirect(`/urls`);
});

//.....................................

//...USER AUTHENTIFICATION...

//DISPLAYS the login form
app.get("/login", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: userObject };
  res.render("urls_login", templateVars);
});

//AUTHENTIFICATE the user
app.post("/login", (req, res) => {
  //extract the infos from the form
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password);
  //checks if the email address exists in the database
  !checkExistingUserEmail(email)
    ? res.status(403).send("You don't have an account!")
    : //checks if the password match the one in the database
    !user
    ? res.status(403).send("Wrong password!")
    : //sets a cookie containing the user_id
      res.cookie("user_id", user.id);
  res.redirect(`/urls`);
});

//.....................................

//...USER LOGGING OUT...

//CLEARS the cookie when a user is logging out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

//.....................................

//...URLS DATABASE DISPLAY...

//DISPLAYS ALL URLS key-value pairs
app.get("/urls", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: userObject };
  res.render("urls_index", templateVars);
});

//.....................................

//...CREATING...

//DISPLAYS the form to create a new URL
app.get("/urls/new", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { user: userObject };
  res.render("urls_new", templateVars);
});

//CREATES a NEW shortURL-longURL key-value pair in the urlDatabase
app.post("/urls", (req, res) => {
  //generate a random shortUrl
  let newShortUrl = generateRandomString();
  //save the shortURL-longURL key-value pair to the urlDatabase
  urlDatabase[newShortUrl] = `http://${req.body.longURL}`;

  res.redirect(`/u/${newShortUrl}`);
});
// REDIRECTS to the website corresponding to the longURL
app.get("/u/:shortURL", (req, res) => {
  //look for the longURL corresponding to the :shortURL
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//.....................................

//...EDITING...

//DISPLAYS the EDIT form
app.get("/urls/:shortURL", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = {
    shortURL: req.params.shortURL,
    //finds the longURL corresponding to the :shortURL
    longURL: urlDatabase[req.params.shortURL],
    user: userObject,
  };
  res.render("urls_show", templateVars);
});

//EDITS the long URL corresponding to the :shortURL
app.post("/urls/:shortURL", (req, res) => {
  //overwrite the longURL for the corresponding shortURL
  urlDatabase[req.params.shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls`);
});

//.....................................

//...DELETING...

//DELETES the shortURL-longURL key-value pair from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//.....................................

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
