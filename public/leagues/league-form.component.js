'use strict';

angular.module('leagues').component('leagueForm', {
  bindings: {
    onAddLeague: '&'
  },
  templateUrl: 'leagues/league-form.template.html',
  controller: function LeagueFormController() {
    this.name = null;
    this.teamCount = null;

    this.createLeague = () => {
      this.onAddLeague({name: this.name, teamCount: this.teamCount});
      this.name = null;
      this.teamCount = null;
    }
  }
});
