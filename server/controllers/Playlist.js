// bring in UUID for ID generation
const uuidv4 = require('uuid/v4');

// Bringing in the models
const models = require('../models');

// Setting up models so that they can be accessed
const { Replays } = models;
const { Account } = models;
const { Playlist } = models;

const app = require('../app.js');

// Rendering pages
const playlistPage = (req, res) => { res.render('playlist', { csrfToken: req.csrfToken() }); };

// Used to create a 'clip' which is saved in the database
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
    console.log(req.body.clipID);
    let playlistData;
    if (req.body.clipID) {
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

    foundUser.savedPlaylists.push(newList);
    // Saving the clip to the database
    const listPromise = newList.save();

    listPromise.then(() => res.json({ message: 'Playlist created!' }));

    listPromise.catch((err3) => res.status(400).json({ error: err3 }));

    // Handling promise to reassign the user's info
    const updatePromise = foundUser.save();

    // Catching errors with the user's data
    updatePromise.catch((err2) => res.json({ err2 }));

    // Must return true to comply with
    return true;
  });
  return true;
};

const addToPlaylist = (req, res) => {
  // Finding the current account
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // Error check
    if (err) return res.json({ error: err });

    Playlist.PlaylistModel.searchById(req.body.playlistID, (err2, doc2) => {
      if (err2) return res.status(400).json({ error: err2 });

      if (!doc2) return res.status(400).json({ error: 'No playlist with that name found' });

      // If no error, create a temp variable to store changes
      const foundUser = doc;
      const foundList = doc2;
      foundList.clips.push(req.body.clipID);
      foundList.numEntries++;

      
      //console.log(foundUser.savedPlaylists);
      /*let tempArray = foundUser.savedPlaylists;
      console.log(tempArray);
      for (let i = 0; i < tempArray.length; i++) {
        if (tempArray[i].id = foundList.id) 
        {
          tempArray[i] = foundList;
          //foundUser.savedPlaylists.updateOne({id:foundList.id}, foundList);
          //console.log('break');
          //console.log(foundUser.savedPlaylists[i]);
        }
      }
      console.log(tempArray);
      console.log("1");
      foundUser.savedPlaylists.push(tempArray);
      //foundUser.savedPlaylists.splice(0,1);
      console.log(foundUser.savedPlaylists);
      console.log("2");

      
      console.log(foundUser.savedPlaylists);

      console.log("3");

      console.log(foundUser.savedPlaylists);
      */
      // Saving the clip to the database
      const listPromise = foundList.save();

      listPromise.then(() => res.json({ message: 'Clip added to Playlist!' }));

      listPromise.catch((err3) => res.status(400).json({ error: err3 }));

      // Handling promise to reassign the user's info
      const updatePromise = foundUser.save();
      updatePromise.then(() => Account.AccountModel.findByUsername(req.session.account.username, (err, doc3) => {console.log(doc3)}));

      // Catching errors with the user's data
      updatePromise.catch((err4) => res.json({ err4 }));

      // Must return true to comply with
      return true;
    });
  });
  return true;
};

// Retrieves all clips
const getPlaylists = (request, response) => {
  // Set up the response
  const res = response;

  // Sending back users
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
