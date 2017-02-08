'use strict';

import express from 'express';
import http from 'http';
import colors from 'colors';
import environment from './config/environment';

const app = express();
const server = http.createServer(app);
const startServer = () => {
  app.angularKblog = server.listen(environment.port, environment.ip, () => {
    const address = `http://localhost:${environment.port}`;
    console.log('-'.repeat(65).grey);
    console.log(`   ${'Express'.cyan}: server is listening on ${address.magenta}`);
  });
}

setImmediate(startServer);

require('./config/mongoose');
require('./config/express').default(app);
require('./config/routes').default(app);

export default app;