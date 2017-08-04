const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./service-account.json'),
  databaseURL: 'https://imageit-4fd5b.firebaseio.com',
});

const LeaderboardService = require('../services/leaderboard.service');
const leaderboardService = new LeaderboardService({ admin });
const PostOnCreate = require('./post.onCreate');

describe('PostOnCreate', () => {
  const userId = 'fake-user-id';
  let postOnCreate, func;
  beforeEach(() => {
    postOnCreate = new PostOnCreate({ leaderboardService });
    func = postOnCreate.getFunction();
  });

  it('should call addPost', done => {
    spyOn(leaderboardService, 'addPost').and.returnValue(Promise.resolve());
    const data = new functions.database.DeltaSnapshot(admin.app(), admin.app(), {}, { userId });
    const e = { data };

    func(e).then(() => {
      expect(leaderboardService.addPost).toHaveBeenCalledWith(userId);
      done();
    });
  });
});
