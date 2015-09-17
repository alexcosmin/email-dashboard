(function() {
    var app = angular.module('nav-options-directive', []);

    app.directive("navOptions", function () {
        return {
            restrict: "E",
            templateUrl: "components/nav/nav-options.html",
            controller: function () {
                this.tab = 1;

                this.isSet = function (checkTab) {
                    return this.tab === checkTab;
                };
                this.setTab = function (activeTab) {
                    this.tab = activeTab;
                };
            },
            controllerAs: "tab"
        };
    });
})();