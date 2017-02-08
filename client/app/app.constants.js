'use strict';

import angular from 'angular';

export default angular.module('blogApp.constants', [])
  .constant('appConfig', require('../../server/config/shared'))
  .name;
