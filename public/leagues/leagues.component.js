angular.module('leagues').component('leagues', {
  templateUrl: 'leagues/leagues.template.html',
  controller: ['$http', function LeaguesController($http) {
    const that = this;
    this.leagues = [];

    $http.get('/api/leagues')
      .success(function(data) {
        that.leagues = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });

    this.addLeague = (name, teamCount, rosterSize, isAuction, budget, hasMinors, minorsCount) => {
      $http.post('/api/leagues', {name: name,
        teamCount: teamCount,
        rosterSize: rosterSize,
        isAuction: isAuction,
        budget: budget,
        hasMinors: hasMinors,
        minorsCount: minorsCount})
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
