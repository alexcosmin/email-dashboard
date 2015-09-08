'use strict';

(function() {
  var app = angular.module('emailDashboardApp', ['dashboard-directives']);

  app.controller('DashboardController',['$http', function($http){
    var dashboard = this;
    dashboard.emails = [];

    $http.get('toOrganize/emails.json').success(function(data){
      dashboard.emails = data;
    });

  }]);
})();

/*// Declare app level module which depends on views, and components
angular.module('emailDashboardApp', [
  'ngRoute',
  'emailDashboardApp.view1',
  'emailDashboardApp.view2',
  'emailDashboardApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);*/

