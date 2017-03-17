angular.module('draftManager')
.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $routeProvider.
        when('/', {
          template: '<leagues></leagues>'
        }).
        when('/league/:leagueId', {
          template: '<league></league>'
        }).
        otherwise({
          redirectTo: '/'
        });

        $locationProvider.html5Mode(true);
    }
  ]);
