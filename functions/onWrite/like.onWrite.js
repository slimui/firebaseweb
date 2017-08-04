module.exports = class LikeOnWrite {
  constructor({ leaderboardService }) {
    this.leaderboardService = leaderboardService;
  }

  getFunction() {
    return e => {
      const previous = e.data.previous.val() || { Like: 0 };
      const current = e.data.current.val() || { Like: 0 };
      const userId = previous.userId || current.userId;
      const previousLike = previous.Like || 0;
      const currentLike = current.Like || 0;
      const diff = currentLike - previousLike;
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
