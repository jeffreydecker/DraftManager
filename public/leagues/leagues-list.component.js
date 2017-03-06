'use strict';

angular.module('leagues').component('leaguesList', {
  bindings: {
    leagues: '<'
  },
  templateUrl: 'leagues/leagues-list.template.html',
  controller: ['$http', function LeagueListController($http) {
    const that = this;

    this.deleteLeague = (leagueId) => {
      $http.delete('/api/leagues/' + leagueId)
        .success(function(data) {
          that.leagues = data;
          console.log(data);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    }
  }]
});
