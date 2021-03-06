(function() {
    var app = angular.module('charts-directives', []);

    app.directive("chartsBody", function() {
        return {
            restrict: 'E',
            templateUrl: "components/charts/charts-body.html",
            controller: function($scope) {
                this.emailDatesSorted = $scope.dashCtrl.emails;

                //Sorting array of objects based on 'date'
                var object_date_sort_asc = function (obj1, obj2) {
                    if (obj1.date > obj2.date) return 1;
                    if (obj1.date < obj2.date) return -1;
                    return 0;
                };
                this.emailDatesSorted.sort(object_date_sort_asc);

                //Resetting the hours
                for (var i = 0; i < this.emailDatesSorted.length; i++) {
                    var now = new Date(this.emailDatesSorted[i].date);
                    var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
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

                console.log("Unique days: " + sortedUniqueObjects.length);

                var sortedUniqueDates = [];
                var emailsSent = [];
                var emailsDelivered = [];
                var emailsRead = [];
                var emailsComplaints = [];

                for (i = 0; i < sortedUniqueObjects.length; i++) {
                    sortedUniqueObjects[i].date = formatMyDate(new Date(sortedUniqueObjects[i].date));
                    sortedUniqueDates.push(sortedUniqueObjects[i].date);
                    emailsSent.push(sortedUniqueObjects[i].newsletter.email_sent);
                    emailsDelivered.push(sortedUniqueObjects[i].newsletter.email_delivered);
                    emailsRead.push(sortedUniqueObjects[i].newsletter.email_read);
                    emailsComplaints.push(sortedUniqueObjects[i].newsletter.email_complaints);
                }
                $scope.formattedDaysArray = sortedUniqueObjects;

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
                    $scope.splitSortedUniqueDatesFormControl.push(formControlEntry);
                    splitEmailsSent.push(emailsSent.slice(i,i+chunkSize));
                    splitEmailsDelivered.push(emailsDelivered.slice(i,i+chunkSize));
                    splitEmailsRead.push(emailsRead.slice(i,i+chunkSize));
                    splitEmailsComplaints.push(emailsComplaints.slice(i,i+chunkSize));

                    counter++;
                }

                $scope.selectedRangeChanged = function(){
                    console.log("Days range selected: " + $scope.selectedRange);
                    var indexSelectedRange = $scope.splitSortedUniqueDatesFormControl.indexOf($scope.selectedRange);
                    console.log("Days index of range: " + indexSelectedRange);
                    //Refresh the chart with new data
                    $scope.labels = splitSortedUniqueDates[indexSelectedRange];
                    $scope.data = [
                        splitEmailsSent[indexSelectedRange],
                        splitEmailsDelivered[indexSelectedRange],
                        splitEmailsRead[indexSelectedRange],
                        splitEmailsComplaints[indexSelectedRange]
                    ];
                }

                //Days chart setup
                $scope.labels = splitSortedUniqueDates[0];
                $scope.series = ['Sent', 'Delivered', 'Read', 'Complaints'];
                $scope.data = [
                    splitEmailsSent[0],
                    splitEmailsDelivered[0],
                    splitEmailsRead[0],
                    splitEmailsComplaints[0]
                ];

                //Weeks
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
                    var yy = dateString.substr(6,2);
                    var year  = (yy < 90) ? '20' + yy : '19' + yy;
                    var month = dateString.substr(3,2);
                    var actualMonth = month - 1;
                    var day = dateString.substr(0,2);
                    return new Date(year, actualMonth, day);
                };

                //Build array of objects from 'sortedUniqueObjects' with date as '2015 Week 31'
                //Replace 'date' field with week representation '2015 Week 31'
                var sortedObjectsWeeks = JSON.parse(JSON.stringify(sortedUniqueObjects)); //Deep copy http://stackoverflow.com/a/9886013/2616185
                for (i = 0; i < sortedUniqueObjects.length; i++) {
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

                console.log("Unique weeks: " + sortedUniqueObjectsWeeks.length);

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
                $scope.formattedWeeksArray = sortedUniqueObjectsWeeks;

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
                    $scope.splitSortedUniqueDatesFormControlWeeks.push(formControlEntry);
                    splitEmailsSentWeeks.push(emailsSentWeeks.slice(i,i+chunkSize));
                    splitEmailsDeliveredWeeks.push(emailsDeliveredWeeks.slice(i,i+chunkSize));
                    splitEmailsReadWeeks.push(emailsReadWeeks.slice(i,i+chunkSize));
                    splitEmailsComplaintsWeeks.push(emailsComplaintsWeeks.slice(i,i+chunkSize));
                    counter++;
                }

                $scope.selectedRangeWeeksChanged = function(){
                    console.log("Weeks range selected: " + $scope.selectedWeeksRange);
                    var indexSelectedRange = $scope.splitSortedUniqueDatesFormControlWeeks.indexOf($scope.selectedWeeksRange);
                    console.log("Weeks index of range: " + indexSelectedRange);
                    //Refresh the chart with new data
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

                //Months

                //Format date as 'Jul 2015'
                var formatDateMonthAndYear = function(dateInstance) {
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return monthNames[dateInstance.getMonth()] + " " + dateInstance.getFullYear();
                };

                //Build array of objects from 'sortedUniqueObjects' with date as 'Jul 2015'
                //Replace 'date' field with month representation 'Jul 2015'
                var sortedObjectsMonths = JSON.parse(JSON.stringify(sortedUniqueObjects)); //Deep copy http://stackoverflow.com/a/9886013/2616185
                for (i = 0; i < sortedUniqueObjects.length; i++) {
                    var dateObj = convertStringToDate(sortedObjectsMonths[i].date);
                    sortedObjectsMonths[i].date = formatDateMonthAndYear(dateObj);
                }

                //Removing date duplicates by months and merging email values -> 13 objects - 13 months
                var seenMonths = {};
                for (var i = 0; i < sortedObjectsMonths.length; i++) {
                    var cur = sortedObjectsMonths[i];
                    if (cur.date in seenMonths) {
                        var seen_cur = seenMonths[cur.date];
                        seen_cur.newsletter.email_sent += cur.newsletter.email_sent;
                        seen_cur.newsletter.email_delivered += cur.newsletter.email_delivered;
                        seen_cur.newsletter.email_read += cur.newsletter.email_read;
                        seen_cur.newsletter.email_complaints += cur.newsletter.email_complaints;
                    } else {
                        seenMonths[cur.date] = cur;
                    }
                }
                var sortedUniqueObjectsMonths = [];
                for (var k in seenMonths) {
                    sortedUniqueObjectsMonths.push(seenMonths[k]);
                }

                console.log("Unique months: " + sortedUniqueObjectsMonths.length);

                //Creating arrays with each field
                var sortedUniqueDatesMonths = [];
                var emailsSentMonths = [];
                var emailsDeliveredMonths = [];
                var emailsReadMonths = [];
                var emailsComplaintsMonths = [];

                for (i = 0; i < sortedUniqueObjectsMonths.length; i++) {
                    sortedUniqueDatesMonths.push(sortedUniqueObjectsMonths[i].date);
                    emailsSentMonths.push(sortedUniqueObjectsMonths[i].newsletter.email_sent);
                    emailsDeliveredMonths.push(sortedUniqueObjectsMonths[i].newsletter.email_delivered);
                    emailsReadMonths.push(sortedUniqueObjectsMonths[i].newsletter.email_read);
                    emailsComplaintsMonths.push(sortedUniqueObjectsMonths[i].newsletter.email_complaints);
                }
                $scope.formattedMonthsArray = sortedUniqueObjectsMonths;

                //Splitting into sub-arrays of 13 each to be consistent with days and weeks section
                $scope.splitSortedUniqueDatesFormControlMonths = [];
                var splitSortedUniqueDatesMonths = [];
                var splitEmailsSentMonths = [];
                var splitEmailsDeliveredMonths = [];
                var splitEmailsReadMonths = [];
                var splitEmailsComplaintsMonths = [];

                var i,j,chunkSize = 13;
                var counter = 0;
                for (i=0,j=sortedUniqueObjectsMonths.length; i<j; i+=chunkSize) {
                    splitSortedUniqueDatesMonths.push(sortedUniqueDatesMonths.slice(i,i+chunkSize));
                    var lastEntry = splitSortedUniqueDatesMonths[counter].length;
                    var formControlEntry = splitSortedUniqueDatesMonths[counter][0] + " - " + splitSortedUniqueDatesMonths[counter][lastEntry-1];
                    $scope.splitSortedUniqueDatesFormControlMonths.push(formControlEntry);
                    splitEmailsSentMonths.push(emailsSentMonths.slice(i,i+chunkSize));
                    splitEmailsDeliveredMonths.push(emailsDeliveredMonths.slice(i,i+chunkSize));
                    splitEmailsReadMonths.push(emailsReadMonths.slice(i,i+chunkSize));
                    splitEmailsComplaintsMonths.push(emailsComplaintsMonths.slice(i,i+chunkSize));
                    counter++;
                }

                $scope.selectedRangeMonthsChanged = function(){
                    console.log("Months range selected: " + $scope.selectedMonthsRange);
                    var indexSelectedRange = $scope.splitSortedUniqueDatesFormControlMonths.indexOf($scope.selectedMonthsRange);
                    console.log("Months index of range: " + indexSelectedRange);
                    //Refresh the chart with new data
                    $scope.labelsMonths = splitSortedUniqueDatesMonths[indexSelectedRange];
                    $scope.dataMonths = [
                        splitEmailsSentMonths[indexSelectedRange],
                        splitEmailsDeliveredMonths[indexSelectedRange],
                        splitEmailsReadMonths[indexSelectedRange],
                        splitEmailsComplaintsMonths[indexSelectedRange]
                    ];
                }

                //Setup months chart
                $scope.labelsMonths = splitSortedUniqueDatesMonths[0];
                $scope.seriesMonths = ['Sent', 'Delivered', 'Read', 'Complaints'];
                $scope.dataMonths = [
                    splitEmailsSentMonths[0],
                    splitEmailsDeliveredMonths[0],
                    splitEmailsReadMonths[0],
                    splitEmailsComplaintsMonths[0]
                ];

                //Overall
                //Depends on months implementation
                var totalSent = 0, totalDelivered = 0, totalRead = 0, totalComplaints = 0;
                for (i = 0; i < sortedUniqueObjectsMonths.length; i++) {
                    totalSent += emailsSentMonths[i];
                    totalDelivered += emailsDeliveredMonths[i];
                    totalRead += emailsReadMonths[i];
                    totalComplaints += emailsComplaintsMonths[i];
                }
                var totalOverall = totalSent + totalDelivered + totalRead + totalComplaints;

                console.log("Total sent: " + totalSent);
                console.log("Total delivered: " + totalDelivered);
                console.log("Total read: " + totalRead);
                console.log("Total complaints: " + totalComplaints);

                var sentPercentage = ((totalSent/totalOverall) * 100).toFixed(2);
                var deliveredPercentage = ((totalDelivered/totalOverall) * 100).toFixed(2);
                var readPercentage = ((totalRead/totalOverall) * 100).toFixed(2);
                var complaintsPercentage = ((totalComplaints/totalOverall) * 100).toFixed(2);
                $scope.sentPercentageOverview = sentPercentage;
                $scope.deliveredPercentageOverview = deliveredPercentage;
                $scope.readPercentageOverview = readPercentage;
                $scope.complaintsPercentageOverview = complaintsPercentage;


                //Formatting tooltip to display with %
                $scope.optionsOverall = {
                    tooltipTemplate  : function (label) {
                        return label.label  + ': ' + label.value.toString() + '%';
                    }
                };

                //Setup overall chart
                $scope.labelsOverall = ['Sent', 'Delivered', 'Read', 'Complaints'];
                $scope.dataOverall = [sentPercentage, deliveredPercentage, readPercentage, complaintsPercentage];
            },
            controllerAs: "chartsCtrl"
        };
    });

    app.directive("chartsPresentationOptions", function() {
        return {
            restrict: 'E',
            templateUrl: "components/charts/charts-presentation-options.html",
            controller: function() {
                this.checkboxDays = true;
                this.checkboxWeeks = true;
                this.checkboxMonths = true;
                this.checkboxOverview = true;
            },
            controllerAs: "optionsCtrl"
        }
    });
})();