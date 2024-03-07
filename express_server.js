const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const users = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const shortenedUrls = Object.keys(urlDatabase);

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
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;

  const templateVars = {
    user: users[userID],
    urls: urlDatabase,
  };

  res.render('urls_index.ejs', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;

  const templateVars = {
    user: users[userID],
    urls: urlDatabase,
  };

  res.render('urls_new.ejs', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;

  const templateVars = {

    // ID: shortened URL
    user: users[userID],
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

  console.log(users);
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
  if (req.cookies.user_id) {
    res.clearCookie("user_id");
  }

  res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send("No input given");
    return;
  }

  // Update url database with new URL
  urlDatabase[req.params.id] = req.body.longURL;

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

// ------------------------------- //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});