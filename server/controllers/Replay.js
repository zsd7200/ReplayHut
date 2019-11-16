const models = require('../models');

const { Replays } = models;

const { Account } = models;

const createPage = (req, res) => res.render('create', { csrfToken: req.csrfToken() });
const galleryPage = (req, res) => {
  res.render('gallery', { csrfToken: req.csrfToken() });
};

// Used to create a 'clip' which is saved in the database
const createClip = (req, res) => {
  if (!req.body.title || !req.body.description || !req.body.youtube || !req.body.game) {
    return res.status(400).json({ error: 'Hey! Make sure you fill out all required fields!' });
  }

  // check for proper youtube link
  if (req.body.youtube.split('=')[0] !== 'https://www.youtube.com/watch?v') {
    return res.status(400).json({ error: 'Not a proper YouTube link!' });
  }

  // change link to an embedded link and remove & parameters from link
  const ytEmbed = `https://www.youtube.com/embed/${req.body.youtube.split('=')[1].split('&')[0]}`;


  const clipData = {
    title: req.body.title,
    game: req.body.game,
    description: req.body.description,
    youtube: ytEmbed,
    character1: req.body.char1,
    character2: req.body.char2,
    creatorUN: req.session.account.username,
    creatorID: req.session.account._id,
  };

  const newClip = new Replays.ReplayModel(clipData);

  const clipPromise = newClip.save();

  clipPromise.then(() => {
    // res.json({ redirect: '/create' });

    /*
    Account.AccountModel.updateOne({ username: req.session.account.username },
      {$set:{ createdClips: numClips} },
      (err) => {
        if (err) return res.status(400).json({ message: err });
        console.log(req.session.account.createdClips);
        return res.json({ message: 'Clip successfully created!' });
      });
      */

    // Used to increment the amount of domos created by one person
    Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
      // Error check
      if (err) return res.json({ error: err });

      // If no error, create a temp variable to store changes
      const foundUser = doc;

      // Increasing their amount of domos
      foundUser.createdClips++;

      // Handling promise to reassign the user's info
      const updatePromise = foundUser.save();

      updatePromise.then(() => res.json({ message: 'Clip successfuly created!' }));

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
