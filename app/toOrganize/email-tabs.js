(function() {
    var app = angular.module('dashboard-directives', []);

    app.directive("emailTabs", function() {
        return {
            restrict: "E",
            templateUrl: "toOrganize/email-tabs.html",
            controller: function() {
                this.tab = 1;

                this.isSet = function(checkTab) {
                    return this.tab === checkTab;
                };
                this.setTab = function(activeTab) {
                    this.tab = activeTab;
                };
            },
            controllerAs: "tab"
        };
    });

    app.directive("emailCharts", function() {
        return {
            restrict: 'E',
            templateUrl: "toOrganize/email-charts.html"
        };
    });

    app.directive("emailTables", function() {
        return {
            restrict: 'E',
            templateUrl: "toOrganize/email-tables.html"
        };
    });

    app.directive("chartsPresentationOptions", function() {
       return {
           restrict: 'E',
           templateUrl: "toOrganize/charts-presentation-options.html",
           controller: function() {
               this.checkboxDays = true;
               this.checkboxWeeks = true;
               this.checkboxMonths = false;
               this.checkboxOverview = false;
           },
           controllerAs: "optionsCtrl"
       }
    });
})();
