const getUserByEmail = function(email, database) {
  for (const entry in database) {
    if (database[entry].email === email) {
      return database[entry].userID;
    }
  }

  return undefined;
};

module.exports = {getUserByEmail,};