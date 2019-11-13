// Questions: Best way to save images into the database
// Best way to update an element of the user's account
// each time they post
const models = require('../models');

const { Replays } = models;

const { Account } = models;

const createPage = (req, res) => res.render('create', { csrfToken: req.csrfToken() });
const galleryPage = (req, res) => {
  console.log('loading gallery');
  res.render('gallery', { csrfToken: req.csrfToken() });
};

const createClip = (req, res) => {
  if (!req.body.title || !req.body.description) {
    return res.status(400).json({ error: 'Hey! Make sure you fill out all the fields!' });
  }

  console.log(req.body);
  const clipData = {
    title: req.body.title,
    character1: req.body.char1,
    character2: req.body.char2,
    description: req.body.description,
    creatorUN: req.session.account.username,
    creatorID: req.session.account._id,
  };

  const newClip = new Replays.ReplayModel(clipData);

  const clipPromise = newClip.save();

  clipPromise.then(() => {
    res.json({ redirect: '/create' });
    // Used to increment the amount of domos created by one person
    Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
      // Error check
      if (err) return res.json({ err });

      // If no error, create a temp variable to store changes
      const foundUser = doc;

      // Increasing their amount of domos
      foundUser.createdClips++;

      // Handling promise to reassign the user's info
      const updatePromise = foundUser.save();

      updatePromise.then(() => console.log('Updated'));

      updatePromise.catch((err2) => res.json({ err2 }));
      return true;
    });
  });

  clipPromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occured!' });
  });

  return clipPromise;
};

// Retrieves all clips
const getClips = (request, response) => {
  const res = response;

  // Sending back users
  return Replays.ReplayModel.find((err, docs) => {
    if (err) return res.status(400).json({ err });

    return res.json({ clips: docs });
  });
};

module.exports.createClip = createClip;
module.exports.createPage = createPage;
module.exports.galleryPage = galleryPage;
module.exports.getClips = getClips;
