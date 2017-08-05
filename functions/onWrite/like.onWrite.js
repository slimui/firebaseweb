module.exports = class LikeOnWrite {
  constructor({ leaderboardService }) {
    this.leaderboardService = leaderboardService;
  }

  getFunction() {
    return e => {
      const previous = e.data.previous.val() || {};
      const current = e.data.current.val() || {};
      const userId = previous.userId || current.userId;
      const previousFavorites = Object.keys(previous.favorites || {}).length;
      const currentFavorites = Object.keys(current.favorites || {}).length;
      const diff = currentFavorites - previousFavorites;
      const action = diff > 0 ? 'addLike' : 'removeLike';
      const promises = [];
      let i = Math.abs(diff);

      while (i--) {
        promises.push(this.leaderboardService[action](userId));
      }

      return Promise.all(promises);
    };
  }
};
