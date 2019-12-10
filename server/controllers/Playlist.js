// bring in UUID for ID generation
const uuidv4 = require('uuid/v4');

// Bringing in the models
const models = require('../models');

// Setting up models so that they can be accessed
const { Replays } = models;
const { Account } = models;
const { Playlist } = models;

// const app = require('../app.js');

// Rendering pages
const playlistPage = (req, res) => { res.render('playlist', { csrfToken: req.csrfToken() }); };

// Used to create a playlist which is saved in the database
const createPlaylist = (req, res) => {
  // Making sure all of the required fields are filled out
  if (!req.body.title) {
    return res.status(400).json({ error: 'Hey! Make sure you fill out all required fields!' });
  }

  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    // If no error, create a temp variable to store changes
    const foundUser = doc;

    // Increasing their amount of clips
    foundUser.numPlaylists++;

    // Creating a var to hold the new playlist data
    let playlistData;

    // If this is being created with a clip already selected, add that to the list
    if (req.body.clipID) {
      // Temporary array
      const tempclips = [req.body.clipID];
      // Creating the necessary information for a new clip
      playlistData = {
        title: req.body.title,
        id: uuidv4(),
        creatorUN: req.session.account.username,
        currUser: '',
        clips: tempclips,
        numEntries: 1,
      };

      // Finding the clip in question to update its array of the playlists its included in
      Replays.ReplayModel.searchById(req.body.clipID, (err3, doc3) => {
        if (err3) return res.status(400).json({ error: err3 });
        // If the clip is found, add this playlists to its array of playlists
        if (doc3) {
          const tempClip = doc3;
          tempClip.inPlaylists.push(playlistData.id);
          tempClip.save();
        }
        return true;
      });

      // If there is no clip being used to create this playlist, do not ad it initially
    } else {
      playlistData = {
        title: req.body.title,
        id: uuidv4(),
        creatorUN: req.session.account.username,
        currUser: '',
      };
    }

    // Creating a new clip with the data
    const newList = new Playlist.PlaylistModel(playlistData);

    // Saving the basic info of playlists created by this account
    foundUser.savedPlaylists.push(newList);

    // Saving the playlist to the database
    const listPromise = newList.save();

    listPromise.then(() => res.json({ message: 'Playlist created!' }));

    listPromise.catch((err3) => res.status(400).json({ error: err3 }));

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    // Catching errors with the user's data
    updatePromise.catch((err2) => res.json({ err2 }));

    // Must return true to comply with ESLint
    return true;
  });
  return true;
};

// Adding a clip to a playlist and updating both the clip and playlsit
const addToPlaylist = (req, res) => {
  // Finding the current Playlist
  Playlist.PlaylistModel.searchById(req.body.playlistID, (err, doc) => {
    // Error checks
    if (err) return res.status(400).json({ error: err });
    if (!doc) return res.status(400).json({ error: 'No playlist with that name found' });

    // If no error, create a temp variable to store changes
    const foundList = doc;

    // Add the clip to the array stored in the playlist
    foundList.clips.push(req.body.clipID);

    // Increase the count of clips
    foundList.numEntries++;

    // Finding the clip in question to update its array of the playlists its included in
    Replays.ReplayModel.searchById(req.body.clipID, (err2, doc2) => {
      if (err2) return res.status(400).json({ error: err2 });
      if (doc2) {
        const tempClip = doc2;
        tempClip.inPlaylists.push(foundList.id);
        tempClip.save();
      }
      return true;
    });

    // Saving the list to the database
    const listPromise = foundList.save();

    listPromise.then(() => res.json({ message: 'Clip added to Playlist!' }));

    listPromise.catch((err3) => res.status(400).json({ error: err3 }));

    // Must return true to comply with
    return true;
  });
  return true;
};

// Used to remove a clip from a playlist and update both the list and clip
const removeFromPlaylist = (req, res) => {
  // Finding the current Playlist
  Playlist.PlaylistModel.searchById(req.body.playlistID, (err, doc) => {
    if (err) return res.status(400).json({ error: err });

    if (!doc) return res.status(400).json({ error: 'No playlist with that name found' });

    // If no error, create a temp variable to store changes
    const foundList = doc;

    // Finding the index of the clip being removed from the playlist
    const index = foundList.clips.indexOf(req.body.clipID);
    if (index !== -1) { // if req.body is found in array
      foundList.clips.splice(index, 1); // cut favorites out of array
    }

    // Decrementing the number of entries in the playlist
    foundList.numEntries--;

    // Finding the clip in question to update its array of the playlists its included in
    Replays.ReplayModel.searchById(req.body.clipID, (err2, doc2) => {
      // Error check
      if (err2) return res.status(400).json({ error: err2 });
      // If the clip is found, update its array
      if (doc2) {
        const tempClip = doc;
        const index2 = tempClip.inPlaylists.indexOf(foundList.id);
        if (index2 !== -1) { // if the playlist is in the array
          tempClip.inPlaylists.splice(index, 1); // cut playlist out of array
        }
        tempClip.save();
      }
      return true;
    });

    // Saving the playlist to the database
    const listPromise = foundList.save();

    listPromise.then(() => res.json({ message: 'Clip removed from Playlist!' }));

    listPromise.catch((err3) => res.status(400).json({ error: err3 }));

    // Must return true to comply with ESLint
    return true;
  });
  return true;
};

// Retrieves all playlists
const getPlaylists = (request, response) => {
  // Set up the response
  const res = response;

  // Sending back playlists
  return Playlist.PlaylistModel.find((err, docs) => {
    if (err) return res.status(400).json({ err });
    return res.json({ playlists: docs });
  });
};

// Exports to be used in the router
module.exports.createPlaylist = createPlaylist;
module.exports.playlistPage = playlistPage;
module.exports.getPlaylists = getPlaylists;
module.exports.addToPlaylist = addToPlaylist;
module.exports.removeFromPlaylist = removeFromPlaylist;
