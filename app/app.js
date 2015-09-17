'use strict';

(function() {
  var app = angular.module('emailDashboardApp', ['chart.js', 'smart-table', 'dashboard-directives']);

  app.controller('DashboardController',['$http', function($http){
    var dashboard = this;
    dashboard.emails = [];
    //test
    dashboard.emailsTest = [];
    dashboard.emailDates = [];

    $http.get('toOrganize/emails.json').success(function(data){
      dashboard.emails = data;
    });

    //test
    $http.get('toOrganize/emails-test.json').success(function(data){
      dashboard.emailsTest = data;

      for (var i = 0; i < dashboard.emailsTest.length; i++) {
        //console.log(dashboard.emailsTest[i].date);
        dashboard.emailDates.push(dashboard.emailsTest[i].date);
        //console.log(dashboard.emailDates[i]);
        //console.log(dashboard.emailsTest[i].newsletter.email_sent);
        //dashboard.emailDates.push(dashboard.emailsTest.)
        //console.log("cool stuff bro");
      }
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

