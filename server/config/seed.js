'use strict';

import User from '../api/user/user.model';
import colors from 'colors';

User.find({}).remove()
  .then(() => {
    User.create({
      username: 'Kenny',
      email: 'cnkuan@qq.com',
      password: 'kenny'
    })
    .then(() => {
      console.log(`   ${'Seed'.cyan}: finished populatiing users data`);
    })
  });