const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const usernames = [];
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Create 6-length random string
const generateRandomString = () => {

  // a-z, A-Z, 0-9
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let output = '';
  let length = 0;

  // Generate random string
  while (length < 6) {
    let randomChar = characters[Math.floor(Math.random() * characters.length)];
    output += randomChar;
    length += 1;
  }

  const shortenedUrls = Object.keys(urlDatabase);

  // Repeat string generation if string is already taken
  if (shortenedUrls.includes(output)) {
    generateRandomString();
  }

  return output;
};

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// GET requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index.ejs', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {

  const templateVars = {

    // ID: shortened URL
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };

  res.render('urls_show.ejs', templateVars);
});

// Redirect to shortened URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Invalid shortened URL");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST requests

app.post("/login", (req, res) => {
  console.log(req.body);
  if (!req.body.username) {
    res.status(400).send("No input given");
    return;
  }

  if (usernames.includes(req.body.username)) {
    res.status(409).send("Username is taken");
    return;
  }

  usernames.push(req.body.username);
  res.cookie("Username", req.body.username);

  res.redirect(`/urls/`);
});

app.post("/urls/:id", (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send("No input given");
    return;
  }

  // Update url database with new URL
  urlDatabase[req.params.id] = req.body.longURL;
  // Redirect to URL 'database'
  res.redirect(`/urls/`);
});

app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send("No input given");
    return;
  }
  // Add new URL to 'database'
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  // Redirect to shortened URL
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  // Redirect to shortened URL
  res.redirect("/urls/");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});