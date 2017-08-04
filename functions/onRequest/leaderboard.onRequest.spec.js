const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./service-account.json'),
  databaseURL: 'https://imageit-4fd5b.firebaseio.com',
});

const LeaderboardService = require('../services/leaderboard.service');
const leaderboardService = new LeaderboardService({ admin });

const LeaderboardOnRequest = require('./leaderboard.onRequest');
const leaderboardOnRequest = new LeaderboardOnRequest({ leaderboardService });
const httpMocks = require('node-mocks-http');

describe('LeaderboardOnRequest', () => {
  let auth = 'unholy-ostrich-elicit-diagnose';
  let func, req, res;
  beforeEach(() => {
    func = leaderboardOnRequest.getFunction();
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('requires auth', () => {
    req.query = { auth: 'fake auth' };
    func(req, res);
    expect(res.statusCode).toEqual(403);
  });

  it('runs calculations', done => {
    spyOn(leaderboardService, 'calculateAll').and.returnValue(Promise.resolve());
    req.query = { auth };
    func(req, res)
      .then(() => {
        expect(res.statusCode).toEqual(200);
        expect(leaderboardService.calculateAll).toHaveBeenCalled();
        done();
      })
      .catch(done.fail);
  });
});
