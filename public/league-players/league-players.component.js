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


    this.positions = ["All", "Hitter", "Pitcher", "C", "1B", "2B", "3B", "SS", "OF", "RF", "LF", "CF", "DH", "SP", "RP"];
    this.positionFilter = this.positions[0];

    this.filterPosition = (player) => {
      if (this.positionFilter == this.positions[0]) {
        return true;
      } else if (this.positionFilter == this.positions[1]) { // Match all hitters
        var match = false;
        for (var i = 3; i <= 12; i++) {
          match = match || player._player.pos.indexOf(this.positions[i]) >= 0;
        }
        return match;
      } else if (this.positionFilter == this.positions[2]) { // Match all pitchers
        var match = false;
        for (var i = 13; i <= 14; i++) {
          match = match || player._player.pos.indexOf(this.positions[i]) >= 0;
        }
        return match;
      } else if (this.positionFilter == this.positions[3]) { // Make sure catcher is for catcher and not CF
        var catcherIndex = player._player.pos.indexOf(this.positions[3]);
        return catcherIndex >= 0 && player._player.pos.indexOf(this.positions[11]) != catcherIndex;
      } else if (this.positionFilter == this.positions[8]) { // Match OF to any OF position
        var match = false;
        for (var i = 8; i <= 11; i++) {
          match = match || player._player.pos.indexOf(this.positions[i]) >= 0;
        }
        return match;
      } else {
        return player._player.pos.indexOf(this.positionFilter) >= 0;
      }
    };

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
    };

    this.cancelDraftModal = (player) => {
      this.draftPlayer = null;
      this.draftCost = null;
      this.draftTeam = null;
    };

    this.draft = () => {
      // var league = this.league;
      var teams = this.league.teams;
      var index = teams.indexOf(this.draftTeam);

      teams.splice(index, 1);

      this.draftPlayer.salary = this.draftCost;
      this.draftTeam.players.push(this.draftPlayer);

      teams.splice(index, 0, this.draftTeam);
      this.league.teams = teams;
      // this.league = league;

      this.draftPlayer = null;
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
    };
  }]
});
