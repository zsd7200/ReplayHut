const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let ReplayModel = {};

const convertId = mongoose.Types.ObjectId;

const setName = (name) => _.escape(name).trim();
const ReplaySchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true, set: setName,
  },
  game: {
    type: String, required: true, trim: true, set: setName,
  },
  description: {
    type: String, required: true, trim: true, set: setName,
  },
  youtube: {
    type: String, required: true, trim: true,
  },
  character1: {
    type: String, required: false, trim: true, set: setName,
  },
  character2: {
    type: String, required: false, trim: true, set: setName,
  },
  creatorUN: {
    type: String, required: true, trim: true, set: setName,
  },
  creatorID: { type: mongoose.Schema.ObjectId, required: true, ref: 'Account' },
  postDate: { type: Date, default: Date.now },
});

ReplaySchema.statics.searchByOwner = (ownerId, callback) => {
  const searchParams = { owner: convertId(ownerId) };

  return ReplayModel.find(searchParams).select('creator').exec(callback);
};

ReplayModel = mongoose.model('Replay', ReplaySchema);

module.exports = {
  ReplayModel,
  ReplaySchema,
};
