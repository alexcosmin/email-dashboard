'use strict';

// Declare app level module which depends on views, and components
angular.module('emailDashboardApp', [
  'ngRoute',
  'emailDashboardApp.view1',
  'emailDashboardApp.view2',
  'emailDashboardApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
