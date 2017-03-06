angular.module('draftManager')
.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $routeProvider.
        when('/', {
          template: '<leagues></leagues>'
        }).
        when('/leagues/:leagueId/players', {
          template: '<league-payers></league-players>'
        }).
        otherwise({
          redirectTo: '/'
        });

        $locationProvider.html5Mode(true);
    }
  ]);
