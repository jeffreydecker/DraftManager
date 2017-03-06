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

    this.addLeague = (name, teamCount) => {
      $http.post('/api/leagues', {name: name, teamCount: teamCount})
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
