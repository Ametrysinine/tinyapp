const { urls, users } = require('./data');

// Helper functions
const getUserByEmail = function(email, database) {
  for (const entry in database) {
    if (database[entry].email === email) {
      return database[entry].userID;
    }
  }
};

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
  const shortenedUrls = Object.keys(urls);

  if (shortenedUrls.includes(output) || users.hasOwnProperty(output)) {
    generateRandomString();
  }

  return output;
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
};