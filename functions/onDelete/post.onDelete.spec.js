const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./service-account.json'),
  databaseURL: 'https://imageit-4fd5b.firebaseio.com',
});

const LeaderboardService = require('../services/leaderboard.service');
const leaderboardService = new LeaderboardService({ admin });
const PostOnDelete = require('./post.onDelete');

describe('PostOnDelete', () => {
  const userId = 'fake-user-id';
  let postOnDelete, func;
  beforeEach(() => {
    postOnDelete = new PostOnDelete({ leaderboardService });
    func = postOnDelete.getFunction();
  });

  it('should call removePost', done => {
    spyOn(leaderboardService, 'removePost').and.returnValue(Promise.resolve());
    const data = new functions.database.DeltaSnapshot(admin.app(), admin.app(), {}, { userId });
    const e = { data };

    func(e).then(() => {
      expect(leaderboardService.removePost).toHaveBeenCalledWith(userId);
      done();
    });
  });
});
