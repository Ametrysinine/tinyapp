const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require('./helpers');
const { urls, users } = require('./data');

const app = express();
const PORT = 8080; // default port 8080

// App dependencies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: ['defaultKey'/* secret keys */],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

// GET requests
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user };

  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const userUrls = urlsForUser(req.session.user_id);
  if (!user) {
    res.status(401).send("Not authorized; please login at /login or register at /register");
    return;
  }

  const templateVars = {
    user,
    userUrls,
  };

  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];

  if (!user) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    user,
    urls,
  };

  res.render('urls_new.ejs', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const urlID = req.params.id;
  const url = urls[urlID];
  const shortenedUrls = Object.keys(urls);

  if (!user) {
    res.status(401).send("Not authorized; please login at /login or register at /register");
    return;
  }

  if (!shortenedUrls.includes(urlID)) {
    res.status(404).send("URL not found");
    return;
  }

  if (url.userID !== user.userID) {
    res.status(401).send("You are not authorized to view this page.");
    return;
  }

  const templateVars = {
    user,
    urlID,
    url,
  };

  res.render('urls_show.ejs', templateVars);
});

// Redirect to shortened URL
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;

  if (!urls[urlID]) {
    res.status(404).send("Invalid shortened URL");
    return;
  }

  const url = urls[urlID].longURL;
  res.redirect(url);
});

app.get("/urls.json", (req, res) => {
  res.json(urls);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

// POST requests
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || req.body.password === "") {
    res.status(400).send("Email and/or password cannot be empty");
    return;
  }

  if (getUserByEmail(email, users) !== undefined) {
    res.status(405).send("Email already in use");
    return;
  }

  // Generate user object
  const userID = generateRandomString();
  users[userID] = {
    userID,
    email,
    password,
  };

  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("No input given for email or password");
    return;
  }

  for (const user in users) {
    if (user === getUserByEmail(email, users) && bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = user;
      res.redirect("/urls");
      return;
    }
  }

  res.status(403).send("Invalid input given for email or password");
});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const url = urls[urlID];
  // Note: submitted longURLs **must** include protocol (http://, https://)
  const longURL = req.body.longURL;

  if (!userID) {
    res.status(401).send("Error: not logged in, login at /login");
    return;
  }

  if (url.userID !== userID) {
    res.status(401).send("You are not authorized to change this.");
    return;
  }

  if (!url) {
    res.status(404).send("Invalid URL");
    return;
  }

  if (!longURL) {
    res.status(400).send("No input given");
    return;
  }

  // Update url database with changed URL
  urls[urlID] = {
    longURL,
    userID,
  };

  res.redirect(`/urls/`);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  // Note: submitted longURLs **must** include protocol (http://, https://)
  const longURL = req.body.longURL;


  if (!userID) {
    res.status(401).send("Error: not logged in, login at /login");
    return;
  }

  if (!longURL) {
    res.status(400).send("No input given");
    return;
  }

  // Add new URL to 'database'
  const urlID = generateRandomString();
  urls[urlID] = { longURL, userID };

  // Redirect to shortened URL
  res.redirect(`/urls/${urlID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const url = urls[urlID];

  if (!userID) {
    res.status(401).send("Error: not logged in, login at /login");
    return;
  }

  if (url.userID !== userID) {
    res.status(401).send("You are not authorized to delete this.");
    return;
  }

  if (!url) {
    res.status(404).send("Invalid URL");
    return;
  }

  delete urls[urlID];

  res.redirect("/urls/");
});

// ------------------------------- //
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
