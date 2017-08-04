module.exports = class LeaderboardOnRequest {
  constructor({ leaderboardService }) {
    this.leaderboardService = leaderboardService;
  }

  getFunction() {
    return (req, res) => {
      if (req.query.auth != 'unholy-ostrich-elicit-diagnose') {
        res.status(403).send('Forbidden');
      } else {
        return this.leaderboardService.calculateAll();
      }
    };
  }
};
