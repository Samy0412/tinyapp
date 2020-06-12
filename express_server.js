//DEPENDENCIES
const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const _ = require("./helpers");
var cookieSession = require("cookie-session");
//creating a Express app
const app = express();

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: [
      "f080ac7b-b838-4c5f-a1f4-b0a9fee10130",
      "c3fb18be-448b-4f6e-a377-49373e9b7e1a",
    ],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

//CHECKING SERVER STATUS
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

//USERS GLOBAL OBJECT DATABASE
const users = {
  "9424e04d": {
    id: "9424e04d",
    email: "abra.cadabra@gmail.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  "5b2cdbcb": {
    id: "5b2cdbcb",
    email: "kent.wood@gmail.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

//URLS DATABASE
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "9424e04d" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "9424e04d" },
  b5hT38: { longURL: "http://www.lighthouselabs.ca", userId: "5b2cdbcb" },
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
  const userObject = users[req.session["user_id"]];
  let templateVars = { user: userObject };
  res.render("urls_register", templateVars);
});

//GETS the INFO from the register form
app.post("/register", (req, res) => {
  //extract the infos from the form
  const email = req.body.email;
  const password = req.body.password;
  let userObject = null;
  !email
    ? res.status(400).send("Please enter an email address!")
    : !password
    ? res.status(400).send("Please enter a password!")
    : _.getUserByEmail(email, users)
    ? res.status(400).send("You already have an account!")
    : // adds a new object to the global users object
      (userObject = _.addNewUser(email, password, users));

  //sets a cookie containing the newly generated id
  req.session["user_id"] = userObject.id;

  console.log(users);
  res.redirect(`/urls`);
});

//.....................................

//...USER AUTHENTIFICATION...

//DISPLAYS the login form
app.get("/login", (req, res) => {
  const userObject = users[req.session["user_id"]];
  let templateVars = { user: userObject };
  res.render("urls_login", templateVars);
});

//AUTHENTIFICATES the user
app.post("/login", (req, res) => {
  //extract the infos from the form
  const email = req.body.email;
  const password = req.body.password;
  const userObject = _.getUserByEmail(email, users);
  //checks if the email address exists in the database
  !_.getUserByEmail(email, users)
    ? res.status(403).send("You don't have an account!")
    : //checks if the password match the one in the database
    !!_.authenticateUser(email, password, users)
    ? res.status(403).send("Wrong password!")
    : //sets a cookie containing the user_id
      (req.session["user_id"] = userObject.id);

  res.redirect(`/urls`);
});

//.....................................

//...USER LOGGING OUT...

//CLEARS the cookie when a user is logging out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//.....................................

//...DISPLAYING URLS DATABASE...

//DISPLAYS ALL URLS key-value pairs
app.get("/urls", (req, res) => {
  //checks if the user is logged in
  const userObject = users[req.session["user_id"]];
  if (!userObject) {
    //redirects the user to the login page
    res.redirect("/login");
  } else {
    //finds the url database of the user
    const urls = _.urlsForUser(userObject.id, urlDatabase);

    let templateVars = { urls, user: userObject };
    res.render("urls_index", templateVars);
  }
});

//.....................................

//...CREATING NEW URL...

//DISPLAYS the form to create a new URL
app.get("/urls/new", (req, res) => {
  const userObject = users[req.session["user_id"]];
  //checks if the user is logged in
  if (!userObject) {
    res.send("Please register or login first!");
  } else {
    let templateVars = { user: userObject };
    res.render("urls_new", templateVars);
  }
});

//CREATES a NEW shortURL-longURL key-value pair in the urlDatabase
app.post("/urls", (req, res) => {
  let userId = req.session["user_id"];
  //generate a random shortUrl
  let newShortUrl = _.generateUniqueId(6);
  //save the shortURL-longURL key-value pair to the urlDatabase
  urlDatabase[newShortUrl] = {
    longURL: `http://${req.body.longURL}`,
    userId: userId,
  };
  console.log(urlDatabase);
  res.redirect(`/u/${newShortUrl}`);
});
// REDIRECTS to the website corresponding to the longURL
app.get("/u/:shortURL", (req, res) => {
  //looks for the longURL corresponding to the :shortURL
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//.....................................

//...EDITING URL...

//DISPLAYS the EDIT form
app.get("/urls/:shortURL", (req, res) => {
  const userObject = users[req.session["user_id"]];
  //finds the user's url database if the user exists
  const urls = userObject && _.urlsForUser(userObject.id, urlDatabase);
  const shortURL = req.params.shortURL;
  //checks if the user is logged in
  if (!userObject) {
    res.send("Please register or login first!");
    //checks if the shortURL belongs to the user
  } else if (!urls[shortURL]) {
    res.status(403).send("Forbidden");
  } else {
    let templateVars = {
      shortURL,
      //finds the longURL corresponding to the :shortURL
      longURL: urls[shortURL],
      user: userObject,
    };
    res.render("urls_show", templateVars);
  }
});

//EDITS the long URL corresponding to the :shortURL
app.post("/urls/:shortURL", (req, res) => {
  const userObject = users[req.session["user_id"]];
  //finds the user's url database if the user exists
  const urls = userObject && _.urlsForUser(userObject.id, urlDatabase);
  const shortURL = req.params.shortURL;
  //checks if the user is logged in
  if (!userObject) {
    res.send("Please register or login first!");
    //checks if the shortURL belongs to the user
  } else if (!urls[shortURL]) {
    res.status(403).send("Forbidden");
  } else {
    //overwrite the longURL for the corresponding shortURL
    urlDatabase[shortURL].longURL = `http://${req.body.longURL}`;
    res.redirect(`/urls`);
  }
});

//.....................................

//...DELETING URL...

//DELETES the shortURL-longURL key-value pair from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  const userObject = users[req.session["user_id"]];
  //finds the user's url database if the user exists
  const urls = userObject && _.urlsForUser(userObject.id, urlDatabase);
  const shortURL = req.params.shortURL;
  //checks if the user is logged in
  if (!userObject) {
    res.send("Please register or login first!");
    //checks if the shortURL belongs to the user
  } else if (!urls[shortURL]) {
    res.status(403).send("Forbidden");
  } else {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  }
});

//.....................................
