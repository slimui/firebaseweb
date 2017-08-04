module.exports = class PostOnDelete {
  constructor({ leaderboardService }) {
    this.leaderboardService = leaderboardService;
  }

  getFunction() {
    return e => {
      const post = e.data.val();
      return this.leaderboardService.removePost(post.userId);
    };
  }
};
