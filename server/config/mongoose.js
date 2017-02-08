'use strict';

import mongoose from 'mongoose';
import colors from 'colors';
import environment from './environment';

mongoose.Promise = require('bluebird');

mongoose.connect(environment.mongo.uri, environment.mongo.options);

mongoose.connection.on('connected', () => {
  console.log(`   ${'Mongoose'.cyan}: connection open to ${environment.mongo.uri.magenta}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose error:${err}`);
  process.exit(-1);
});

if (environment.seedDB) {
  require('./seed');
}

setTimeout(() => {
  console.log('-'.repeat(65).grey);
}, 500);
