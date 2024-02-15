const bcrypt = require("bcryptjs");

async function hashPassword(pwd) {
  const password = pwd;
  const saltRounds = 10;

  const hashedPassword = new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hashedPassword;
}

async function validatePassword(password, hashed) {
  return bcrypt.compareSync(password, hashed);
  // return false;
}

module.exports = { hashPassword, validatePassword };
