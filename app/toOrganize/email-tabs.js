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

                //this.splitSortedUniqueDatesFormControl = [];

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
                console.log("Unique days: " + sortedUniqueObjects.length);

                var sortedUniqueDates = [];
                var emailsSent = [];
                var emailsDelivered = [];
                var emailsRead = [];
                var emailsComplaints = [];

                for (i = 0; i < sortedUniqueObjects.length; i++) {
                    //console.log(sortedUniqueObjects[i]);
                    sortedUniqueObjects[i].date = formatMyDate(new Date(sortedUniqueObjects[i].date));
                    //console.log(sortedUniqueObjects[i]);
                    sortedUniqueDates.push(sortedUniqueObjects[i].date);
                    emailsSent.push(sortedUniqueObjects[i].newsletter.email_sent);
                    emailsDelivered.push(sortedUniqueObjects[i].newsletter.email_delivered);
                    emailsRead.push(sortedUniqueObjects[i].newsletter.email_read);
                    emailsComplaints.push(sortedUniqueObjects[i].newsletter.email_complaints);
                }

                //Splitting into sub-arrays of 25 each
                $scope.splitSortedUniqueDatesFormControl = [];
                var splitSortedUniqueDates = [];
                var splitEmailsSent = [];
                var splitEmailsDelivered = [];
                var splitEmailsRead = [];
                var splitEmailsComplaints = [];

                var i,j,chunkSize = 25;
                var counter = 0;
                for (i=0,j=sortedUniqueObjects.length; i<j; i+=chunkSize) {
                    splitSortedUniqueDates.push(sortedUniqueDates.slice(i,i+chunkSize));
                    var lastEntry = splitSortedUniqueDates[counter].length;
                    var formControlEntry = splitSortedUniqueDates[counter][0] + " - " + splitSortedUniqueDates[counter][lastEntry-1];
                    //console.log(formControlEntry);
                    $scope.splitSortedUniqueDatesFormControl.push(formControlEntry);
                    splitEmailsSent.push(emailsSent.slice(i,i+chunkSize));
                    splitEmailsDelivered.push(emailsDelivered.slice(i,i+chunkSize));
                    splitEmailsRead.push(emailsRead.slice(i,i+chunkSize));
                    splitEmailsComplaints.push(emailsComplaints.slice(i,i+chunkSize));

                    counter++;
                }
                //console.log("Chunks: " + counting);
                //-----------------------------
                $scope.selectedRangeChanged = function(){
                    console.log("Days range selected: " + $scope.selectedRange);
                    var indexSelectedRange = $scope.splitSortedUniqueDatesFormControl.indexOf($scope.selectedRange);
                    console.log("Days index of range: " + indexSelectedRange);
                    //Refresh the chat with new data
                    $scope.labels = splitSortedUniqueDates[indexSelectedRange];
                    $scope.data = [
                        splitEmailsSent[indexSelectedRange],
                        splitEmailsDelivered[indexSelectedRange],
                        splitEmailsRead[indexSelectedRange],
                        splitEmailsComplaints[indexSelectedRange]
                    ];
                }


                //Chart setup
                //$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
                //$scope.labels = sortedUniqueDates;
                $scope.labels = splitSortedUniqueDates[0];
                $scope.series = ['Sent', 'Delivered', 'Read', 'Complaints'];
                //$scope.data = [
                //    [65, 59, 80, 250, 56, 55, 40],
                //    [28, 48, 40, 19, 86, 27, 90],
                //    [32, 24, 32, 12, 54, 12, 86],
                //    [28, 48, 40, 19, 12, 63, 63]
                //];
                //$scope.data = [
                //    emailsSent,
                //    emailsDelivered,
                //    emailsRead,
                //    emailsComplaints
                //];
                $scope.data = [
                    splitEmailsSent[0],
                    splitEmailsDelivered[0],
                    splitEmailsRead[0],
                    splitEmailsComplaints[0]
                ];
                //$scope.onClick = function(points, evt) {
                //    //console.log(points, evt);
                //    console.log("Points clicked");
                //};

                //Weeeks --------------------------------------------------------
                var getWeekNumber = function(d) {
                    // Copy date so don't modify original
                    d = new Date(+d);
                    d.setHours(0,0,0);
                    // Set to nearest Thursday: current date + 4 - current day number
                    // Make Sunday's day number 7
                    d.setDate(d.getDate() + 4 - (d.getDay()||7));
                    // Get first day of year
                    var yearStart = new Date(d.getFullYear(),0,1);
                    // Calculate full weeks to nearest Thursday
                    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
                    // Return array of year and week number
                    return [d.getFullYear(), weekNo];
                };

                //convert date from string dd/mm/yy to Date object
                var convertStringToDate = function(dateString) {
                    //var dateString = splitSortedUniqueDates[0][0];
                    var yy = dateString.substr(6,2);
                    var year  = (yy < 90) ? '20' + yy : '19' + yy;
                    var month = dateString.substr(3,2);
                    var actualMonth = month - 1;
                    var day = dateString.substr(0,2);
                    //var dateFromString = new Date(year, actualMonth, day);
                    return new Date(year, actualMonth, day);
                };

                //Build array of objects from 'sortedUniqueObjects' with date as '2015 W 31'
                //Replace 'date' field with week representation '2015 W 31'
                var sortedObjectsWeeks = [];
                for (i = 0; i < sortedUniqueObjects.length; i++) {
                    sortedObjectsWeeks[i] = sortedUniqueObjects[i];
                    var dateObj = convertStringToDate(sortedObjectsWeeks[i].date);
                    var weekRepresentation = getWeekNumber(dateObj);
                    sortedObjectsWeeks[i].date = weekRepresentation[0] + " Week " + weekRepresentation[1];
                }

                //Removing date duplicates by weeks and merging email values -> 53 objects - 53 weeks
                var seenWeeks = {};
                for (var i = 0; i < sortedObjectsWeeks.length; i++) {
                    var cur = sortedObjectsWeeks[i];
                    if (cur.date in seenWeeks) {
                        var seen_cur = seenWeeks[cur.date];
                        seen_cur.newsletter.email_sent += cur.newsletter.email_sent;
                        seen_cur.newsletter.email_delivered += cur.newsletter.email_delivered;
                        seen_cur.newsletter.email_read += cur.newsletter.email_read;
                        seen_cur.newsletter.email_complaints += cur.newsletter.email_complaints;
                    } else {
                        seenWeeks[cur.date] = cur;
                    }
                }
                var sortedUniqueObjectsWeeks = [];
                for (var k in seenWeeks) {
                    sortedUniqueObjectsWeeks.push(seenWeeks[k]);
                }

                //Test - should be 53
                console.log("Unique weeks: " + sortedUniqueObjectsWeeks.length);

                //Check no. of weeks between 2 dates
                //var firstDate = new Date(2014, 6, 7);
                //var secondDate = new Date(2015, 6, 12);
                //var weeks = Math.round((secondDate-firstDate)/ 604800000);
                //console.log("Weeks in between: " + weeks);

                //Creating arrays with each field
                var sortedUniqueDatesWeeks = [];
                var emailsSentWeeks = [];
                var emailsDeliveredWeeks = [];
                var emailsReadWeeks = [];
                var emailsComplaintsWeeks = [];

                for (i = 0; i < sortedUniqueObjectsWeeks.length; i++) {
                    sortedUniqueDatesWeeks.push(sortedUniqueObjectsWeeks[i].date);
                    emailsSentWeeks.push(sortedUniqueObjectsWeeks[i].newsletter.email_sent);
                    emailsDeliveredWeeks.push(sortedUniqueObjectsWeeks[i].newsletter.email_delivered);
                    emailsReadWeeks.push(sortedUniqueObjectsWeeks[i].newsletter.email_read);
                    emailsComplaintsWeeks.push(sortedUniqueObjectsWeeks[i].newsletter.email_complaints);
                }

                //Splitting into sub-arrays of 27 each (because total 53)
                $scope.splitSortedUniqueDatesFormControlWeeks = [];
                var splitSortedUniqueDatesWeeks = [];
                var splitEmailsSentWeeks = [];
                var splitEmailsDeliveredWeeks = [];
                var splitEmailsReadWeeks = [];
                var splitEmailsComplaintsWeeks = [];

                var i,j,chunkSize = 20;
                var counter = 0;
                for (i=0,j=sortedUniqueObjectsWeeks.length; i<j; i+=chunkSize) {
                    splitSortedUniqueDatesWeeks.push(sortedUniqueDatesWeeks.slice(i,i+chunkSize));
                    var lastEntry = splitSortedUniqueDatesWeeks[counter].length;
                    var formControlEntry = splitSortedUniqueDatesWeeks[counter][0] + " - " + splitSortedUniqueDatesWeeks[counter][lastEntry-1];
                    //console.log(formControlEntry);
                    $scope.splitSortedUniqueDatesFormControlWeeks.push(formControlEntry);
                    splitEmailsSentWeeks.push(emailsSentWeeks.slice(i,i+chunkSize));
                    splitEmailsDeliveredWeeks.push(emailsDeliveredWeeks.slice(i,i+chunkSize));
                    splitEmailsReadWeeks.push(emailsReadWeeks.slice(i,i+chunkSize));
                    splitEmailsComplaintsWeeks.push(emailsComplaintsWeeks.slice(i,i+chunkSize));

                    counter++;
                }

                //console.log("Chunks: " + counting);
                $scope.selectedRangeWeeksChanged = function(){
                    console.log("Weeks range selected: " + $scope.selectedWeeksRange);
                    var indexSelectedRange = $scope.splitSortedUniqueDatesFormControlWeeks.indexOf($scope.selectedWeeksRange);
                    console.log("Weeks index of range: " + indexSelectedRange);
                    //Refresh the chat with new data
                    $scope.labelsWeeks = splitSortedUniqueDatesWeeks[indexSelectedRange];
                    $scope.dataWeeks = [
                        splitEmailsSentWeeks[indexSelectedRange],
                        splitEmailsDeliveredWeeks[indexSelectedRange],
                        splitEmailsReadWeeks[indexSelectedRange],
                        splitEmailsComplaintsWeeks[indexSelectedRange]
                    ];
                }

                //Setup weeks chart
                $scope.labelsWeeks = splitSortedUniqueDatesWeeks[0];
                $scope.seriesWeeks = ['Sent', 'Delivered', 'Read', 'Complaints'];
                $scope.dataWeeks = [
                    splitEmailsSentWeeks[0],
                    splitEmailsDeliveredWeeks[0],
                    splitEmailsReadWeeks[0],
                    splitEmailsComplaintsWeeks[0]
                ];
                //Weeeks --------------------------------------------------------
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
