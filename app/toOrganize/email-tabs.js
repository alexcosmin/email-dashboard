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
            templateUrl: "toOrganize/email-charts.html",
            controller: function($scope) {

                this.emailDatesSorted = $scope.dashCtrl.emails;

                //Sorting array of objects based on 'date'
                var object_date_sort_asc = function (obj1, obj2) {
                    if (obj1.date > obj2.date) return 1;
                    if (obj1.date < obj2.date) return -1;
                    return 0;
                };

                //console.log("Initial array emailDatesSorted: ");
                //for (var i = 0; i < this.emailDatesSorted.length; i++) {
                //    console.log(this.emailDatesSorted[i].date);
                //}
                this.emailDatesSorted.sort(object_date_sort_asc);
                //console.log("Sorted array emailDatesSorted: ");
                //for (var i = 0; i < this.emailDatesSorted.length; i++) {
                //    console.log(this.emailDatesSorted[i].date);
                //}

                //Resetting the hours
                for (var i = 0; i < this.emailDatesSorted.length; i++) {
                    var now = new Date(this.emailDatesSorted[i].date);
                    //var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
                    var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
                    //now_utc.setHours(0,0,0,0);
                    this.emailDatesSorted[i].date = now_utc.toString();
                }

                //Removing date duplicates and merging email values
                var seen = {};
                for (var i = 0; i < this.emailDatesSorted.length; i++) {
                    var cur = this.emailDatesSorted[i];
                    if (cur.date in seen) {
                        var seen_cur = seen[cur.date];
                        seen_cur.newsletter.email_sent += cur.newsletter.email_sent;
                        seen_cur.newsletter.email_delivered += cur.newsletter.email_delivered;
                        seen_cur.newsletter.email_read += cur.newsletter.email_read;
                        seen_cur.newsletter.email_complaints += cur.newsletter.email_complaints;
                    } else {
                        seen[cur.date] = cur;
                    }
                }
                var sortedUniqueObjects = [];
                for (var k in seen) {
                    sortedUniqueObjects.push(seen[k]);
                }

                var formatMyDate = function(d) {
                    var month = d.getMonth();
                    var day = d.getDate();
                    var year = d.getFullYear();
                    year = year.toString().substr(2,2);
                    month = month + 1;//increment month by 1 since it is 0 indexed
                    month = month + "";
                    if (month.length == 1){
                        month = "0" + month;
                    }
                    day = day + "";
                    if (day.length == 1){
                        day = "0" + day;
                    }
                    return day + "/" + month + "/" + year;
                };

                //Testing
                var sortedUniqueDates = [];
                var emailsSent = [];
                var emailsDelivered = [];
                var emailsRead = [];
                var emailsComplaints = [];
                console.log("There are now: " + sortedUniqueObjects.length);
                for (i = 0; i < 25; i++) {
                //for (i = 0; i < sortedUniqueObjects.length; i++) {
                    //console.log(sortedUniqueObjects[i]);
                    sortedUniqueObjects[i].date = formatMyDate(new Date(sortedUniqueObjects[i].date));
                    //console.log(sortedUniqueObjects[i]);
                    sortedUniqueDates.push(sortedUniqueObjects[i].date);
                    emailsSent.push(sortedUniqueObjects[i].newsletter.email_sent);
                    emailsDelivered.push(sortedUniqueObjects[i].newsletter.email_delivered);
                    emailsRead.push(sortedUniqueObjects[i].newsletter.email_read);
                    emailsComplaints.push(sortedUniqueObjects[i].newsletter.email_complaints);
                }



                //Chart setup
                //$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
                $scope.labels = sortedUniqueDates;
                $scope.series = ['Sent', 'Delivered', 'Read', 'Complaints'];
                //$scope.data = [
                //    [65, 59, 80, 250, 56, 55, 40],
                //    [28, 48, 40, 19, 86, 27, 90],
                //    [32, 24, 32, 12, 54, 12, 86],
                //    [28, 48, 40, 19, 12, 63, 63]
                //];
                $scope.data = [
                    emailsSent,
                    emailsDelivered,
                    emailsRead,
                    emailsComplaints
                ];
                //$scope.onClick = function(points, evt) {
                //    //console.log(points, evt);
                //    console.log("Points clicked");
                //};
            },
            controllerAs: "chartsCtrl"
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
