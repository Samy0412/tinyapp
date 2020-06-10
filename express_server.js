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
      return true;
    }
  }
  return false;
};
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

//sends Hello when the browser send a request on the home page "localhost:8080/"
app.get("/", (req, res) => {
  res.send("Hello!");
});
//RENDERS "My URLS" page and shows all the URLS from the Database when a GET request is sent to "localhost:8080/urls"
app.get("/urls", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: userObject };
  res.render("urls_index", templateVars);
});
//RENDERS "Create an account" when a GET request is sent to "localhost:8080/register"
app.get("/register", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: userObject };
  res.render("urls_register", templateVars);
});
//RENDERS the "Create new URL" page when a GET request is sent to "localhost:8080/urls/new"
app.get("/urls/new", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = { user: userObject };
  res.render("urls_new", templateVars);
});
//FINDS the corresponding longUrl to the shortUrl from the route and renders the "Edit" page when a GET request is sent to "/urls/:shortURL"
app.get("/urls/:shortURL", (req, res) => {
  let userObject = users[req.cookies["user_id"]];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userObject,
  };
  res.render("urls_show", templateVars);
});

// REDIRECTS to the longURL corresponding to the shortURL when a GET request is sent to "/u/:shortURL"
app.get("/u/:shortURL", (req, res) => {
  //look for the corresponding longURL
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//CREATES a new shortURL-longURL key-value pair in the urlDatabase and redirects to "u/shortURL" when a POST request is sent to "/urls"
app.post("/urls", (req, res) => {
  //generate a random shortUrl
  let newShortUrl = generateRandomString();
  //save the shortURL-longURL key-value pair to the urlDatabase
  urlDatabase[newShortUrl] = `http://${req.body.longURL}`;

  res.redirect(`/u/${newShortUrl}`);
});
//SETS the cookie when a new user is logging in (when a POST request is sent to "/login")
app.post("/login", (req, res) => {
  //sets a cookie containing the username
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});
//CLEARS the cookie when a user is logging out (when a POST request is sent to "/logout")
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});
//EDITS the long URL corresponding to the :shortURL when a POST request is sent to "/urls/:shortURL"
app.post("/urls/:shortURL", (req, res) => {
  //overwrite the longURL for the corresponding shortURL
  urlDatabase[req.params.shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls`);
});
//DELETES the shortURL-longURL key-value pair from the urlDatabase and redirects to /urls when a POST request is sent to "/urls/:shortURL/delete"
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//ADDS a new user to the global users database when a POST request is sent to "/register"
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
