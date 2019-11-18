const models = require('../models');

const { Account } = models;

// render login page
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// logout and redirect user to login page
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// render users page
const userList = (req, res) => {
  res.render('users');
};

// render account page
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

// get account data
const getMyAccount = (request, response) => {
  const res = response;
  const req = request;

  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    if (err) return res.status(400).json({ err });

    return res.json({ account: docs });
  });
};

// log user in if the fields are filled in and correct
const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'HEY! All fields are required!' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/create' });
  });
};

// handle changing password
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
    return res.status(400).json({ error: 'HEY! All fields are required!' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'HEY! Passwords do not match!' });
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

// handle changing premium status to true and displaying a message
const activatePremium = (request, response) => {
  const req = request;
  const res = response;

  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // Changing their premium status
    foundUser.premiumStatus = true;

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    updatePromise.then(() => res.json({ message: 'You are now a Prime member!' }));

    updatePromise.catch((err2) => res.json({ err2 }));
    return true;
  });
};

// handle changing premium status to false and displaying a message
const cancelPremium = (request, response) => {
  const req = request;
  const res = response;

  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // Changing their premium status
    foundUser.premiumStatus = false;

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    updatePromise.then(() => res.json({ message: 'Your Prime membership has been cancelled.' }));

    updatePromise.catch((err2) => res.json({ err2 }));
    return true;
  });
};

// get csrf token
const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

// exports to be used in router
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
module.exports.activatePremium = activatePremium;
module.exports.cancelPremium = cancelPremium;
