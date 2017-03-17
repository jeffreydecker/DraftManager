angular.module('league').component('league', {
  templateUrl: 'league/league.template.html',
  controller: ['$http', '$routeParams', function LeagueController($http, $routeParams) {
    const that = this;
    this.league = null;

    $http.get(`/api/leagues/${$routeParams.leagueId}`)
      .success(function(data) {
        that.league = data;
      })
      .error(function(data) {
        console.log(`Error: ${data}`);
      });
  }]
});
