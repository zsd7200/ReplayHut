// bring in UUID for ID generation
const uuidv4 = require('uuid/v4');

// Bringing in the models
const models = require('../models');

// Setting up models so that they can be accessed
const { Replays } = models;
const { Account } = models;

const app = require('../app.js');

// Rendering pages
const createPage = (req, res) => res.render('create', { csrfToken: req.csrfToken() });
const galleryPage = (req, res) => { res.render('gallery', {  }); };

// Used to create a 'clip' which is saved in the database
const createClip = (req, res) => {
  // Making sure all of the required fields are filled out
  if (!req.body.title || !req.body.description || !req.body.youtube || !req.body.game) {
    return res.status(400).json({ error: 'Hey! Make sure you fill out all required fields!' });
  }

  // check for proper youtube link
  if (req.body.youtube.split('=')[0] !== 'https://www.youtube.com/watch?v') {
    return res.status(400).json({ error: 'Not a proper YouTube link!' });
  }

  // change link to an embedded link and remove & parameters from link
  const ytEmbed = `https://www.youtube.com/embed/${req.body.youtube.split('=')[1].split('&')[0]}`;


  // Used to increment the amount of clips created by a person
  // Due to the way these functions interact, the creation of a clip must take place in here
  // It requires the user's Premium Status to be sent
  // This data does not get natively updated, and since the clips need to be incremented
  // This is the most efficient way to perform both actions
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // Increasing their amount of clips
    foundUser.createdClips++;

    // Creating the necessary information for a new clip
    const clipData = {
      title: req.body.title,
      game: req.body.game,
      description: req.body.description,
      id: uuidv4(),
      youtube: ytEmbed,
      character1: req.body.char1,
      character2: req.body.char2,
      creatorUN: req.session.account.username,
      creatorPremStatus: foundUser.premiumStatus,
      faveStatus: false,
      currUser: '',
    };

    // Creating a new clip with the data
    const newClip = new Replays.ReplayModel(clipData);

    // Saving the clip to the database
    const clipPromise = newClip.save();

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    // Catching errors with the user's data
    updatePromise.catch((err2) => res.json({ err2 }));

    // If the clip creation was successful, send back a response
    clipPromise.then(() => { res.json({ message: 'Clip successfully created!' }); });

    // If there was an error with clip creation, send that back
    clipPromise.catch((err2) => res.status(400).json({ error: err2 }));

    // Must return true to comply with
    return true;
  });
  return true;
};

// Retrieves all clips
const getClips = (request, response) => {
  // Set up the response
  const res = response;

  // Sending back users
  return Replays.ReplayModel.find((err, docs) => {
    if (err) return res.status(400).json({ err });

    return res.json({ clips: docs });
  });
};

// Deleting a specific clip
const deleteClips = (request, response) => {
  const res = response;
  const req = request;

  // Finding the specific user so that they can be updated
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // removing from favorites array
    const index = foundUser.favorites.indexOf(req.body.clipID);
    if (index !== -1) { // if req.body is found in array
      foundUser.favorites.splice(index, 1); // cut favorites out of array
    }
    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    // Deleting the clip from the database
    const deletePromise = app.mainDB.collection('replays').deleteOne({ id: req.body.clipID });

    // Show message upon successful deletion
    deletePromise.then(() => { res.json({ message: 'Clip deleted!' }); });

    // Error with deleting the clip
    deletePromise.catch((err2) => res.json({ err2 }));

    // Return an error back if one is found
    updatePromise.catch((err3) => res.json({ error: err3 }));

    // Returning to satisfy ESLint
    return true;
  });
  return false;
};

// Exports to be used in the router
module.exports.createClip = createClip;
module.exports.createPage = createPage;
module.exports.galleryPage = galleryPage;
module.exports.getClips = getClips;
module.exports.deleteClips = deleteClips;
