const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./service-account.json'),
  databaseURL: 'https://imageit-4fd5b.firebaseio.com',
});

const LeaderboardService = require('./leaderboard.service.js');
const postsPath = 'test/posts';
const leaderboardPath = 'test/leaderboard';
const usersPath = 'test/users';
const postsRef = admin.database().ref(postsPath);
const leaderboardRef = admin.database().ref(leaderboardPath);
const usersRef = admin.database().ref(usersPath);

describe('LeaderboardService', () => {
  let leaderboardService;
  beforeEach(() => {
    leaderboardService = new LeaderboardService({ admin, postsPath, leaderboardPath, usersPath });
  });

  beforeAll(done => cleanUp(done));

  function cleanUp(done) {
    Promise.resolve()
      .then(() => usersRef.remove())
      .then(() => postsRef.remove())
      .then(() => leaderboardRef.remove())
      .then(done, done.fail);
  }

  const userOneId = 'fake-user-one';
  const userTwoId = 'fake-user-two';
  const userOneName = 'fake-user-name-one';
  const userTwoName = 'fake-user-name-two';
  beforeAll(done => {
    const promises = [];
    const favorites = {
      one: true,
      two: true,
      three: true,
    };

    let i = 10;
    while (i--) {
      promises.push(
        postsRef.push({
          userId: userOneId,
          favorites,
          userName: userOneName,
          taggedPosts: {
            one: { userId: userOneId, favorites, userName: userOneName },
            two: { userId: userOneId, favorites, userName: userOneName },
          },
        })
      );
      promises.push(postsRef.push({ userId: userTwoId, favorites, userName: userTwoName }));
      promises.push(
        postsRef.push({ userId: 'non-existant', favorites, userName: 'not-a-real-user-name' })
      );
    }

    const usersUpdates = {};
    usersUpdates[`${userOneId}/verified`] = true;
    usersUpdates[`${userTwoId}/verified`] = false;
    usersUpdates[`${userOneId}/userName`] = userOneName;
    usersUpdates[`${userTwoId}/userName`] = userTwoName;

    promises.push(usersRef.update(usersUpdates));

    Promise.all(promises).then(done, done.fail);
  });

  describe('test setup', () => {
    it('should start with 30', done => {
      postsRef
        .once('value')
        .then(snap => {
          expect(snap.numChildren()).toEqual(30);
          done();
        })
        .catch(done.fail);
    });

    it('should start with one verified and one unverified user', done => {
      usersRef
        .once('value')
        .then(snap => {
          const users = snap.val();
          expect(users[userOneId].verified).toEqual(true);
          expect(users[userTwoId].verified).toEqual(false);
          expect(users[userOneId].userName).toEqual(userOneName);
          expect(users[userTwoId].userName).toEqual(userTwoName);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('calculateAll', () => {
    it('should pull down all posts, one by one', done => {
      leaderboardService
        .calculateAll()
        .then(updates => {
          expect(updates[`verified/${userOneId}/postsCount`]).toEqual(30);
          expect(updates[`verified/${userOneId}/likesCount`]).toEqual(90);
          expect(updates[`verified/${userOneId}/score`]).toEqual(120);
          expect(updates[`verified/${userOneId}/userName`]).toEqual(userOneName);
          expect(updates[`unverified/${userTwoId}/postsCount`]).toEqual(10);
          expect(updates[`unverified/${userTwoId}/likesCount`]).toEqual(30);
          expect(updates[`unverified/${userTwoId}/score`]).toEqual(40);
          expect(updates[`unverified/${userTwoId}/userName`]).toEqual(userTwoName);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('Incrementations', () => {
    beforeEach(done => {
      leaderboardRef.remove().then(done, done.fail);
    });

    it('addPost/removePost', done => {
      Promise.all([
        leaderboardService.addPost(userOneId),
        leaderboardService.addPost(userOneId),
        leaderboardService.addPost(userOneId),
        leaderboardService.addPost(userOneId),
        leaderboardService.addPost(userOneId),
        leaderboardService.removePost(userOneId),
        leaderboardService.removePost(userOneId),
        leaderboardService.addPost(userTwoId),
        leaderboardService.addPost(userTwoId),
        leaderboardService.addPost(userTwoId),
        leaderboardService.addPost(userTwoId),
        leaderboardService.addPost(userTwoId),
        leaderboardService.removePost(userTwoId),
        leaderboardService.removePost(userTwoId),
      ])
        .then(() => leaderboardRef.once('value'))
        .then(snap => {
          const leaderboard = snap.val();
          expect(leaderboard).toEqual({
            unverified: {
              'fake-user-two': {
                postsCount: 5,
                score: 5,
                userName: userTwoName,
              },
            },
            verified: {
              'fake-user-one': {
                postsCount: 5,
                score: 5,
                userName: userOneName,
              },
            },
          });
          done();
        })
        .catch(done.fail);
    });

    it('addLike/removeLike', done => {
      Promise.all([
        leaderboardService.addLike(userOneId),
        leaderboardService.addLike(userOneId),
        leaderboardService.addLike(userOneId),
        leaderboardService.addLike(userOneId),
        leaderboardService.addLike(userOneId),
        leaderboardService.removeLike(userOneId),
        leaderboardService.removeLike(userOneId),
        leaderboardService.addLike(userTwoId),
        leaderboardService.addLike(userTwoId),
        leaderboardService.addLike(userTwoId),
        leaderboardService.addLike(userTwoId),
        leaderboardService.addLike(userTwoId),
        leaderboardService.removeLike(userTwoId),
        leaderboardService.removeLike(userTwoId),
      ])
        .then(() => leaderboardRef.once('value'))
        .then(snap => {
          const leaderboard = snap.val();
          expect(leaderboard).toEqual({
            unverified: {
              'fake-user-two': {
                likesCount: 5,
                score: 5,
                userName: userTwoName,
              },
            },
            verified: {
              'fake-user-one': {
                likesCount: 5,
                score: 5,
                userName: userOneName,
              },
            },
          });
          done();
        })
        .catch(done.fail);
    });
  });
});
