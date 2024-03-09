const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

// Databases
const users = {};

const urls = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "admin"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "admin"},
};

const shortenedUrls = Object.keys(urls);
const urlsForUser = function(userID) {
  const userUrls = {};

  // Add url to userUrls if userID is a match, or public ID
  for (let url in urls) {
    if (urls[url].userID === userID || urls[url].userID === "public") {
      userUrls[url] = urls[url];
    }
  }

  return userUrls;
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



  // Repeat string generation if string is already taken by urlID or userID
  if (shortenedUrls.includes(output) || users.hasOwnProperty(output)) {
    generateRandomString();
  }

  return output;
};

// App dependencies
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['defaultKey'/* secret keys */],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

// GET requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  res.render("register");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  res.render("login");
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const userUrls = urlsForUser(req.session.user_id);

  const templateVars = {
    user,
    userUrls,
  };

  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.redirect("/login");
  }

  const templateVars = {
    user,
    urls,
  };

  res.render('urls_new.ejs', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const urlID = req.params.id;
  const url = urls[urlID];

  if (!user) {
    res.redirect("/login");
  }

  if (url.userID !== user) {
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
  const url = urls[urlID].longURL;

  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send("Invalid shortened URL");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urls);
});

// POST requests
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    res.status(400).send("Email and/or password cannot be empty");
    return;
  }

  for (const user in users) {
    if (users[user].email === email) {
      res.status(400).send("Email already in use");
      return;
    }
  }

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
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
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
  const newUrl = {longURL, userID};

  urls[urlID] = newUrl;

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

  delete urls[req.params.id];

  res.redirect("/urls/");
});

// ------------------------------- //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});