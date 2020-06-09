const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  let rString =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 6; i > 0; --i) {
    result += rString[Math.floor(Math.random() * rString.length)];
  }
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//sends Hello when the browser send a request on the home page "localhost:8080/"
app.get("/", (req, res) => {
  res.send("Hello!");
});
//loads the html content of the file urls_index (with a table of the short and long urls) when a request is sent from "localhost:8080/urls"
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//loads the html  content of the file urls_new (with the form) when a request is sent form "localhost:8080/urls/new"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//loads the html content of the file urls_show and finds the corresponding longUrl to the shortUrl entered in the route (from the urlDatabase object)
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  let templateVars = {
    shortURL: newShortUrl,
    longURL: urlDatabase[newShortUrl],
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
