const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = functions.config();
const postsPath = 'Posts';
const leaderboardPath = 'Leaderboard';
const usersPath = 'Users';
const LeadersboardService = require('./services/leaderboard.service');
const leaderboardService = new leaderboardService({
  admin,
  postsPath,
  leaderboardPath,
  usersPath,
});

admin.initializeApp(config.firebase);

const LeaderboardOnRequest = require('./onRequest/leaderboard.onRequest');
const leaderboardOnRequest = new LeaderboardOnRequest({ leaderboardService });
exports.calculateAll = functions.https.onRequest(leaderboardOnRequest.getFunction());

const PostOnCreate = require('./onCreate/post.onCreate');
const postOnCreate = new PostOnCreate({ leaderboardService });
exports.postOnCreate = functions.database.ref('Posts/{key}').onCreate(postOnCreate.getFunction());

const PostOnDelete = require('./onDelete/post.onDelete');
const postOnDelete = new PostOnDelete({ leaderboardService });
exports.postOnDelete = functions.database.ref('Posts/{key}').onDelete(postOnDelete.getFunction());

const LikeOnWrite = require('./onWrite/like.onWrite');
const likeOnWrite = new LikeOnWrite({ leaderboardService });
exports.likeOnWrite = functions.database
  .ref('Posts/{postKey}/comments/{commentKey}')
  .onWrite(likeOnWrite.getFunction());
