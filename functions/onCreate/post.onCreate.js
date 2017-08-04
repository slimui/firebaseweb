module.exports = class PostOnCreate {
  constructor({ leaderboardService }) {
    this.leaderboardService = leaderboardService;
  }

  getFunction() {
    return e => {
      const post = e.data.val();
      return this.leaderboardService.addPost(post.userId);
    };
  }
};
