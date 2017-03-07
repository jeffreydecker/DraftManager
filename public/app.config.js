angular.module('draftManager')
.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $routeProvider.
        when('/', {
          template: '<leagues></leagues>'
        }).
        when('/league/:leagueId/players', {
          template: '<league-players></league-players>'
        }).
        otherwise({
          redirectTo: '/'
        });

        $locationProvider.html5Mode(true);
    }
  ]);
