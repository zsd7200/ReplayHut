const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const userList = (req, res) => {
  res.render('users');
};

const myAccount = (req, res) => {
  res.render('account');
};

// Retrieves all accounts
const getAccounts = (request, response) => {
  const res = response;

  // Sending back users
  return Account.AccountModel.find((err, docs) => {
    if (err) return res.status(400).json({ err });

    return res.json({ users: docs });
  });
};

const getMyAccount = (request, response) => {
  const res = response;
  const req = request;

  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    if (err) return res.status(400).json({ err });

    return res.json({ account: docs });
  });
};

const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'RAWR! All fields are required!' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/create' });
  });
};

const changePassword = (request, response) => {
  // Set up the request and response
  const req = request;
  const res = response;

  // Set the values to strings
  req.body.currentPass = `${req.body.currentPass}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  // Error check to make sure all fields are filled in
  if (!req.body.pass || !req.body.pass2 || !req.body.currentPass) {
    return res.status(400).json({ message: 'Hey, make sure you fill out all fields!' });
  }

  // Checking if the new passwords match eachother
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ message: "Woah, those new passwords don't match!" });
  }

  // Checking if the user's current passsword is correct
  Account.AccountModel.authenticate(req.session.account.username, req.body.currentPass,
    (err, doc) => {
      // Error checks
      if (err) {
        return res.status(401).json({ messsage: 'An error occured' });
      }
      if (!doc) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Creating the new password by encrypting it
      Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
        // Updating the details on the account
        Account.AccountModel.updateOne({ username: req.session.account.username },
          { salt, password: hash }, (err2) => {
            // Another error check
            if (err2) {
              return res.status(400).json({ err2 });
            }
            // Returning a success
            return res.json({ message: 'Password successfully changed' });
          });
        return true;
      });
      return true;
    });

  return true;
};

// Used to sign a user up the first time
const signup = (request, response) => {
  const req = request;
  const res = response;

  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'RAWR! All fields are required!' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'RAWR! Passwords do not match!' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/create' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred.' });
    });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.getAccounts = getAccounts;
module.exports.userList = userList;
module.exports.getMyAccount = getMyAccount;
module.exports.myAccount = myAccount;
module.exports.changePassword = changePassword;
