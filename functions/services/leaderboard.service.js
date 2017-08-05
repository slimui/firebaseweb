module.exports = class LeaderboardService {
  constructor({ admin, postsPath, leaderboardPath, usersPath }) {
    const badPath = 'badPath';
    this.admin = admin;
    this.postsRef = admin.database().ref(postsPath || badPath);
    this.leaderboardRef = admin.database().ref(leaderboardPath || badPath);
    this.usersRef = admin.database().ref(usersPath || badPath);
  }

  calculateAll() {
    return Promise.all([
      this.postsRef.once('value'),
      this.usersRef.once('value'),
    ]).then(([postsSnap, usersSnap]) => {
      const posts = postsSnap.val();
      const users = usersSnap.val();
      const startingUpdates = this.toArray(users).reduce((updates, user) => {
        const userPath = this.getUserPath(user);
        updates[`${userPath}/postsCount`] = 0;
        updates[`${userPath}/likesCount`] = 0;
        updates[`${userPath}/userName`] = user.userName;
        return updates;
      }, {});
      const postsArray = this.toArray(posts);
      const taggedPostsArray = postsArray.reduce((taggedPosts, post) => {
        if (post.taggedPosts) {
          taggedPosts = taggedPosts.concat(this.toArray(post.taggedPosts));
        }
        return taggedPosts;
      }, []);
      const updates = postsArray.concat(taggedPostsArray).reduce((updates, post) => {
        const user = users[post.userId];

        if (user) {
          const userPath = this.getUserPath(user, post.userId);
          const postsCountPath = `${userPath}/postsCount`;
          const likesCountPath = `${userPath}/likesCount`;
          const scorePath = `${userPath}/score`;
          const likesCount = 0;

          updates[postsCountPath]++;

          if (post.favorites) {
            const favoritesCount = this.toArray(post.favorites).length;
            updates[likesCountPath] += favoritesCount;
          }

          updates[scorePath] = updates[postsCountPath] + updates[likesCountPath];
        }

        return updates;
      }, startingUpdates);

      return this.leaderboardRef.update(updates).then(() => updates);
    });
  }

  addPost(userId) {
    this.transact(userId, 'postsCount', this.increment);
  }

  removePost(userId) {
    this.transact(userId, 'postsCount', this.decrement);
  }

  addLike(userId) {
    this.transact(userId, 'likesCount', this.increment);
  }

  removeLike(userId) {
    this.transact(userId, 'likesCount', this.decrement);
  }

  transact(userId, type, func) {
    return this.getLeaderboardUserRef(userId).then(({ user, leaderboardUserRef }) => {
      const countRef = leaderboardUserRef.child(type);
      const scoreRef = leaderboardUserRef.child('score');
      const userNameRef = leaderboardUserRef.child('userName');
      return Promise.all([
        countRef.transaction(func),
        scoreRef.transaction(func),
        userNameRef.set(user.userName),
      ]);
    });
  }

  getLeaderboardUserRef(userId) {
    return this.usersRef.child(userId).once('value').then(snap => {
      const user = snap.val();
      const verified = this.getVerified(user);
      const leaderboardUserRef = this.leaderboardRef.child(verified).child(userId);
      return { user, leaderboardUserRef };
    });
  }

  increment(value) {
    return (value || 0) + 1;
  }

  decrement(value) {
    return Math.max(0, (value || 0) - 1);
  }

  getUserPath(user, userId) {
    const key = user.$key || userId;
    const verified = this.getVerified(user);
    return `${verified}/${key}`;
  }

  getVerified(user) {
    return user.verified ? 'verified' : 'unverified';
  }

  toArray(obj) {
    const result = [];
    for (let $key in obj) {
      const newObj = Object.assign({}, obj[$key]);
      result.push(Object.assign(newObj, { $key }));
    }
    return result;
  }
};
