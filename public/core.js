var draftManager = angular.module('draftManager', []);

function mainController($scope, $http) {
  $scope.formData = {};
  $http.get('/api/leagues')
    .success(function(data) {
      $scope.leagues = data;
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });

    $scope.createLeague = function() {
      $http.post('/api/league', $scope.formData)
        .success(function(data) {
          $scope.formData = {};
          $scope.leagues = data;
          console.log(data);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    }

    $scope.deleteLeague = function(leagueId) {
      $http.delete('/api/league/' + leagueId)
        .success(function(data) {
          $scope.leagues = data;
          console.log(data);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    }
}
