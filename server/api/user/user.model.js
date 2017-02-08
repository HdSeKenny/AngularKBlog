'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  email: String,
  password: String
});

export default mongoose.model('User', UserSchema);