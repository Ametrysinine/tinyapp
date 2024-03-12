// Databases ** Note: generate userID with generateRandomString();
const urls = {
  // Note: submitted longURLs **must** include protocol (http://, https://)
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "admin" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "admin" },
};

const users = {
  "exampl": {
    userID: "exampl",
    email: "johndoe@example.com",
    password: "$2a$10$Lq2S.ot5xfRk3VdoZAJvCO36lODXX.4dlSASpeo1gQ7HXfBya1.LW"
  },

  "admin": {
    userID: "admin",
    email: "janedoe@example.com",
    password: "$2a$10$tb82Dqi3lem3zBK5JzFdAuqY3gzXwFmdeoSc.LqJcnQtZ.WxJemRK"
  },
};

module.exports = {
  urls,
  users
};