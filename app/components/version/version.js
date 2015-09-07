'use strict';

angular.module('emailDashboardApp.version', [
  'emailDashboardApp.version.interpolate-filter',
  'emailDashboardApp.version.version-directive'
])

.value('version', '0.1');
