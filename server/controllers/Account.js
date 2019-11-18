//Getting the models
const models = require('../models');

//Setting up the account specific model
const { Account } = models;

//Rendering specific pages
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

//Retrieving one specific account and sending it back
const getMyAccount = (request, response) => {
  const res = response;
  const req = request;

  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    if (err) return res.status(400).json({ err });

    return res.json({ account: docs });
  });
};

//Method which logs into a specific user's account, if they have the correct credentials
const login = (request, response) => {

  //Setting up the requst and response
  const req = request;
  const res = response;

  //Grabbing the username and password from the request
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  //Error check to make sure both the password and username were inputted
  if (!username || !password) {
    return res.status(400).json({ error: 'HEY! All fields are required!' });
  }

  //Authenticating that the user has the correct password for their username
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    //Setting up the account that will be used throughout the session
    req.session.account = Account.AccountModel.toAPI(account);

    //Redirecting to the clip creation page
    return res.json({ redirect: '/create' });
  });
};

//Changing the password for the specified user
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

          //Must return something to satisfy ESlint
        return true;
      });
      return true;
    });

  return true;
};

// Used to sign a user up the first time
const signup = (request, response) => {
  //Setting up the request and response
  const req = request;
  const res = response;

  //Set the calues to strings
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  //Error checks
  //Making sure all the necessary fields have input in them
  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'HEY! All fields are required!' });
  }

  //Making sure that both of the user's new passwords match
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'HEY! Passwords do not match!' });
  }

  //Generating a new account
  //Starting by encrypting the password
  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    //Setting up the data necessary for the account
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    //Creating a new account with the new information
    const newAccount = new Account.AccountModel(accountData);

    //Saving that data to the database
    const savePromise = newAccount.save();

    //Once the saving is complete, set the new account as the active one, and go to clip creation
    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/create' });
    });

    //In case of an error, log it out and send it back to the user
    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred.' });
    });
  });
};

//Adds premium status to the user's account
const activatePremium = (request, response) => {
  //Setting up the request and response
  const req = request;
  const res = response;

  //Finding the specific user so that they can be updated
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // Changing their premium status
    foundUser.premiumStatus = true;

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    //Send a message back to the user once it is finished saving
    updatePromise.then(() => res.json({ message: 'You are now a Prime member!' }));

    //Return an error back if one is found
    updatePromise.catch((err2) => res.json({ err2 }));
    return true;
  });
};

//Disabling the premium membership for a user's account
const cancelPremium = (request, response) => {
  //Setting up the request and response
  const req = request;
  const res = response;

  //Finding the specific user so that they can be updated
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // Changing their premium status
    foundUser.premiumStatus = false;

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    //Send back a message to the user once it is finished saving
    updatePromise.then(() => res.json({ message: 'Your Prime membership has been cancelled.' }));

    //Return an error if one is found
    updatePromise.catch((err2) => res.json({ err2 }));
    return true;
  });
};


//Getting a CSRF token for the user
const getToken = (request, response) => {
  //Setting up the request and response
  const req = request;
  const res = response;

  //Retrieving the token
  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  //Sending back the token to the user
  res.json(csrfJSON);
};

//Exports for use in the router
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
