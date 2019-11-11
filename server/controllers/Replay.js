const models = require('../models');

const { Replays } = models;

const createPage = (req, res) => res.render('create', { csrfToken: req.csrfToken() });

const createClip = (req, res) => {
  if (!req.body.title || !req.body.description) {
    return res.status(400).json({ error: 'Hey! Make sure you fill out all the fields!' });
  }
  let char1; let
    char2;
  char1 = char2;
  if (!req.body.char1) {
    char1 = '';
  }
  if (!req.body.char2) {
    char2 = '';
  }

  const clipData = {
    title: req.body.title,
    character1: char1,
    character2: char2,
    description: req.body.description,
    creator: req.session.account._id,
  };

  const newClip = new Replays.ReplayModel(clipData);

  const clipPromise = newClip.save();

  clipPromise.then(() => res.json({ redirect: '/create' }));

  clipPromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occured!' });
  });

  return clipPromise;
};

module.exports = {
  createClip,
  createPage,
};
