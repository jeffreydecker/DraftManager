angular.module('leaguePlayers').component('leaguePlayers', {
  bindings: {
    league: '='
  },
  templateUrl: 'league-players/league-players.template.html',
  controller: ['$http', '$routeParams', function LeagueFormController($http, $routeParams) {
    const that = this;
    // this.players = this.league.players; // Displayed players
    // this.allPlayers = this.league.players; // Complete player list
    this.draftPlayer = null;
    this.draftCost = null;
    this.draftTeam = null;

    // $http.get(`/api/leagues/${$routeParams.leagueId}/players`)
    //   .success(function(data) {
    //     that.players = data;
    //     that.allPlayers = data;
    //   })
    //   .error(function(data) {
    //     console.log(`Error: ${data}`);
    //   });

    this.showDraftModal = (player) => {
      this.draftPlayer = player;
      this.draftCost = null;
      this.draftTeam = null;
    }

    this.cancelDraftModal = (player) => {
      this.draftPlayer = null;
      this.draftCost = null;
      this.draftTeam = null;
    }

    this.draftPlayer = (player) => {
      this.modalPlayer = null;
      this.draftCost = null;
      this.draftTeam = null;

      // var index = this.players.indexOf(player);
      // var players = this.players;
      // players.splice(index, 1);
      // this.players = players;
      // TODO - Use the server for this
      // $http.post('/api/leagues/players/draft', {player: player._id})
      //   .success(function(data) {
      //     var index = that.players.find(player);
      //     if (index >= 0) {
      //     }
      //     console.log(data);
      //   })
      //   .error(function(data) {
      //     console.log('Error: ' + data);
      //   });
    }
  }]
});
