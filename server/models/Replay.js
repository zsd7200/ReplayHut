const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let ReplayModel = {};

const convertId = mongoose.Types.ObjectId;

const setName = (name) => _.escape(name).trim();
const ReplaySchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true,
  },
  game: {
    type: String, required: true, trim: true,
  },
  description: {
    type: String, required: true, trim: true,
  },
  id: {
    type: String, required: true,
  },
  youtube: {
    type: String, required: true, trim: true,
  },
  character1: {
    type: String, required: false, trim: true,
  },
  character2: {
    type: String, required: false, trim: true,
  },
  creatorUN: {
    type: String, required: true, trim: true, set: setName,
  },
  creatorPremStatus: {
    type: Boolean, required: true, default: false,
  },
  faveStatus: {
    type: Boolean, required: true, default: false,
  },
  postDate: { type: Date, default: Date.now },
  numFavorites: { type: Number, required: true, default: 0 },
});

ReplaySchema.statics.searchById = (replayId, callback) => {
  const searchParams = { _id: convertId(replayId) };

  // return ReplayModel.find(searchParams).select('_id').exec(callback);
  return ReplayModel.findOne(searchParams, callback);
};

ReplayModel = mongoose.model('Replay', ReplaySchema);

module.exports = {
  ReplayModel,
  ReplaySchema,
  convertId,
};
