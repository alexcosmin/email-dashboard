(function() {
    var app = angular.module('tables-directives', []);

    app.directive("tablesBody", function() {
        return {
            restrict: 'E',
            templateUrl: "components/tables/tables-body.html",
            controller: function($scope) {
                $scope.formattedDaysArrayCopy = $scope.formattedDaysArray;
                $scope.formattedWeeksArrayCopy = $scope.formattedWeeksArray;
                $scope.formattedMonthsArrayCopy = $scope.formattedMonthsArray;
                $scope.fromDateOverview = $scope.formattedDaysArrayCopy[0].date;
                $scope.toDateOverview = $scope.formattedDaysArrayCopy[$scope.formattedDaysArrayCopy.length - 1].date;
                $scope.sentPercentageOverviewCopy = $scope.sentPercentageOverview + " %";
                $scope.deliveredPercentageOverviewCopy = $scope.deliveredPercentageOverview + " %";
                $scope.readPercentageOverviewCopy = $scope.readPercentageOverview + " %";
                $scope.complaintsPercentageOverviewCopy = $scope.complaintsPercentageOverview + " %";

                console.log("Rows in days table: " + $scope.formattedDaysArrayCopy.length);
                console.log("Rows in weeks table: " + $scope.formattedWeeksArrayCopy.length);
                console.log("Rows in months table: " + $scope.formattedMonthsArrayCopy.length);
            },
            controllerAs: "tablesCtrl"
        };
    });

    app.directive("tablesPresentationOptions", function() {
        return {
            restrict: 'E',
            templateUrl: "components/tables/tables-presentation-options.html",
            controller: function() {
                this.checkboxDays = true;
                this.checkboxWeeks = true;
                this.checkboxMonths = true;
                this.checkboxOverview = true;
            },
            controllerAs: "optionsCtrlTables"
        }
    });
})();