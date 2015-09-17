'use strict';

(function() {
  var app = angular.module('emailDashboardApp', ['chart.js', 'smart-table', 'dashboard-directives']);

  app.controller('DashboardController',['$http', function($http){
    var dashboard = this;
    dashboard.emails = [];

    $http.get('data/emails.json').success(function(data){
      dashboard.emails = data;
    });
  }]);
})();

