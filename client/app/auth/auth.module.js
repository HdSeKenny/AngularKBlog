'use strict';

import angular from 'angular';
import constants from '../app.constants';
import util from '../util/util.module';
import ngCookies from 'angular-cookies';
import uiRouter from 'angular-ui-router';

import { authInterceptor } from './interceptor.service';
import { routerDecorator } from './router.decorator';
import { AuthService } from './auth.service';
import { UserResource } from './user.service';

function addInterceptor($httpProvider) {
  'ngInject';

  $httpProvider.interceptors.push('authInterceptor');
}

export default angular.module('blogApp.auth', [constants, util, ngCookies, uiRouter])
  .factory('authInterceptor', authInterceptor)
  .run(routerDecorator)
  .factory('Auth', AuthService)
  .factory('User', UserResource)
  .config(['$httpProvider', addInterceptor])
  .name;
