'use strict';

angular.module('leagues').component('leagueForm', {
  bindings: {
    onAddLeague: '&'
  },
  templateUrl: 'leagues/league-form.template.html',
  controller: function LeagueFormController() {
    this.name = null;
    this.teamCount = null;
    this.rosterSize = null;
    this.isAuction = false;
    this.budget = null;
    this.hasMinors = false;
    this.minorsCount = null;

    this.resetForm = () => {
      this.name = null;
      this.teamCount = null;
      this.rosterSize = null;
      this.isAuction = false;
      this.budget = null;
      this.hasMinors = false;
      this.minorsCount = null;
      // TODO - includeMinorsInCap
    }

    this.createLeague = () => {
      this.onAddLeague({name: this.name,
        teamCount: this.teamCount,
        rosterSize: this.rosterSize,
        isAuction: this.isAuction,
        budget: this.budget,
        hasMinors:
        this.hasMinors,
        minorsCount: this.minorsCount});
      this.resetForm();
    }
  }
});
