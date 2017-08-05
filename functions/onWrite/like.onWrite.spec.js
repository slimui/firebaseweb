const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./service-account.json'),
  databaseURL: 'https://imageit-4fd5b.firebaseio.com',
});

const LeaderboardService = require('../services/leaderboard.service');
const leaderboardService = new LeaderboardService({ admin });
const LikeOnWrite = require('./like.onWrite');

describe('LikeOnWrite', () => {
  const userId = 'fake-user-id';
  let likeOnWrite, func;
  beforeEach(() => {
    spyOn(leaderboardService, 'addLike').and.returnValue(Promise.resolve());
    spyOn(leaderboardService, 'removeLike').and.returnValue(Promise.resolve());

    likeOnWrite = new LikeOnWrite({ leaderboardService });
    func = likeOnWrite.getFunction();
  });

  it('should call addLike once', done => {
    const e = {
      data: new functions.database.DeltaSnapshot(null, null, null, {
        favorites: getFavorites(1),
        userId,
      }),
    };

    func(e)
      .then(() => {
        expect(leaderboardService.addLike).toHaveBeenCalledWith(userId);
        expect(leaderboardService.addLike.calls.count()).toEqual(1);
        done();
      })
      .catch(done.fail);
  });

  it('should call addLike twice', done => {
    const e = {
      data: new functions.database.DeltaSnapshot(
        null,
        null,
        { favorites: getFavorites(1) },
        { favorites: getFavorites(3), userId }
      ),
    };

    func(e)
      .then(() => {
        expect(leaderboardService.addLike).toHaveBeenCalledWith(userId);
        expect(leaderboardService.addLike.calls.count()).toEqual(2);
        done();
      })
      .catch(done.fail);
  });

  it('should call removeLike once', done => {
    const e = {
      data: new functions.database.DeltaSnapshot(
        null,
        null,
        { favorites: getFavorites(1), userId },
        null
      ),
    };

    func(e)
      .then(() => {
        expect(leaderboardService.removeLike).toHaveBeenCalledWith(userId);
        expect(leaderboardService.removeLike.calls.count()).toEqual(1);
        done();
      })
      .catch(done.fail);
  });

  it('should call removeLike twice', done => {
    const e = {
      data: new functions.database.DeltaSnapshot(
        null,
        null,
        { favorites: getFavorites(3), userId },
        { favorites: [1] }
      ),
    };

    func(e)
      .then(() => {
        expect(leaderboardService.removeLike).toHaveBeenCalledWith(userId);
        expect(leaderboardService.removeLike.calls.count()).toEqual(2);
        done();
      })
      .catch(done.fail);
  });

  it('should call nothing', done => {
    const e = {
      data: new functions.database.DeltaSnapshot(
        null,
        null,
        { favorites: getFavorites(0), userId },
        { favorites: getFavorites(0) }
      ),
    };

    func(e)
      .then(() => {
        expect(leaderboardService.removeLike.calls.count()).toEqual(0);
        done();
      })
      .catch(done.fail);
  });

  function getFavorites(i) {
    const result = {};
    while (i--) {
      result[`item-${i}`] = true;
    }
    return result;
  }
});
