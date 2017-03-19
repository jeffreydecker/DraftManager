angular.module('draftTeams').component('draftTeams', {
  bindings: {
    league: '='
  },
  templateUrl: 'draft-teams/draft-teams.template.html',
  controller: ['$http', '$routeParams', function LeagueController($http, $routeParams) {
    // const that = this;
    this.remainingPicks = (team) => {
      return this.league.rosterSize - team.players.length;
    }

    this.remainingBudget = (team) => {
      var budgetSpent = 0;
      team.players.forEach((player) => {
        budgetSpent += player.salary;
      })
      return this.league.budget - budgetSpent;
    }

    this.maxBid = (team) => {
      if (team.players.length >= (this.league.rosterSize - 1)) {
        return this.remainingBudget(team);
      } else {
        return this.remainingBudget(team) - ((this.league.rosterSize - team.players.length - 1));
      }
    }
  }]
});
