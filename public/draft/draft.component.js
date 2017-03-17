angular.module('draft').component('draft', {
  templateUrl: 'draft/draft.template.html',
  controller: ['$http', '$routeParams', function DraftController($http, $routeParams) {
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
