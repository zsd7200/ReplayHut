const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let PlaylistModel = {};

// const convertId = mongoose.Types.ObjectId;

const setName = (name) => _.escape(name).trim();
const PlaylistSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true,
  },
  id: {
    type: String, required: true,
  },
  creatorUN: {
    type: String, required: true, trim: true, set: setName,
  },
  postDate: { type: Date, default: Date.now },
  clips: { type: Array, required: true, default: [] },
  numEntries: { type: Number, required: true, default: 0 },
});

PlaylistSchema.statics.searchById = (playlistID, callback) => {
  const searchParams = { id: playlistID };

  return PlaylistModel.findOne(searchParams, callback);
};

PlaylistModel = mongoose.model('Playlist', PlaylistSchema);

module.exports = {
  PlaylistModel,
  PlaylistSchema,
};
