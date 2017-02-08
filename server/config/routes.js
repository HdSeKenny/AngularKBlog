'use strict';

import path from 'path';
import environment from './environment';

export default (app) => {
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${environment.root}/client/index.html`));
    })
}