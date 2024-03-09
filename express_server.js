const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const users = {};

const urls = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL: "http://www.google.com"},
};

const shortenedUrls = Object.keys(urls);

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



  // Repeat string generation if string is already taken TODO: If userIDs is taken
  if (shortenedUrls.includes(output) || users.hasOwnProperty(output)) {
    generateRandomString();
  }

  return output;
};

// App dependencies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// GET requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  }

  res.render("register");
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  }

  res.render("login");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
    urls,
  };

  console.log(urls);

  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }

  const user = users[req.cookies.user_id];

  const templateVars = {
    user,
    urls,
  };

  res.render('urls_new.ejs', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const urlID = req.params.id;
  const url = urls[urlID];

  const templateVars = {
    user,
    urlID,
    url,
  };

  res.render('urls_show.ejs', templateVars);
});

// Redirect to shortened URL
app.get("/u/:id", (req, res) => {
  const longURL = urls[req.params.id];

  if (longURL) {
    res.redirect(longURL);
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
  const password = req.body.password;

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

  console.log(`Account created: ${users}`);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// POST requests
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("No input given for email or password");
    return;
  }

  for (const user in users) {
    if (users[user].email === email && users[user].password === password) {
      res.cookie("user_id", user);
      res.redirect("/urls");
      return;
    }
  }

  res.status(403).send("Invalid input given for email or password");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const urlID = req.params.id;
  const longURL = req.body.longURL;

  if (!userID) {
    res.status(401).send("Error: not logged in, login at /login");
    return;
  }

  if (!longURL) {
    res.status(400).send("No input given");
    return;
  }

  // Update url database with new URL
  urls[urlID] = {
    longURL,
    userID,
  };

  res.redirect(`/urls/`);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
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
  urls[urlID] = {longURL,
    userID,
  };

  // Redirect to shortened URL
  res.redirect(`/urls/${urlID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies.user_id;

  if (!userID) {
    res.status(401).send("Error: not logged in, login at /login");
    return;
  }
  delete urls[req.params.id];

  res.redirect("/urls/");
});

// ------------------------------- //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});