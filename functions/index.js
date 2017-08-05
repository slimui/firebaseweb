const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const config = functions.config();
const postsPath = 'Posts';
const leaderboardPath = 'Leaderboard';
const usersPath = 'Users';

const gmail = {
  email: encodeURIComponent(config.gmail.email),
  password: encodeURIComponent(config.gmail.password),
};
const mailTransport = nodemailer.createTransport(
  `smtps://${gmail.email}:${gmail.password}@smtp.gmail.com`
);
const EmailService = require('./services/email.service');
const emailService = new EmailService({ mailTransport });

admin.initializeApp(config.firebase);

const LeaderboardService = require('./services/leaderboard.service');
const leaderboardService = new LeaderboardService({
  admin,
  postsPath,
  leaderboardPath,
  usersPath,
});

// OnRequest
const LeaderboardOnRequest = require('./onRequest/leaderboard.onRequest');
const leaderboardOnRequest = new LeaderboardOnRequest({ leaderboardService });
exports.calculateAll = functions.https.onRequest(leaderboardOnRequest.getFunction());

// OnCreate
const PostOnCreate = require('./onCreate/post.onCreate');
const postOnCreate = new PostOnCreate({ leaderboardService });
exports.postOnCreate = functions.database.ref('Posts/{key}').onCreate(postOnCreate.getFunction());

// OnDelete
const PostOnDelete = require('./onDelete/post.onDelete');
const postOnDelete = new PostOnDelete({ leaderboardService });
exports.postOnDelete = functions.database.ref('Posts/{key}').onDelete(postOnDelete.getFunction());

// OnWrite
const LikeOnWrite = require('./onWrite/like.onWrite');
const likeOnWrite = new LikeOnWrite({ leaderboardService });
exports.likeOnWrite = functions.database
  .ref('Posts/{postKey}')
  .onWrite(likeOnWrite.getFunction());

// Auth
const UserOnCreate = require('./onCreate/user.onCreate');
const userOnCreate = new UserOnCreate({ emailService });
functions.auth.user().onCreate(userOnCreate.getFunction());

const UserOnDelete = require('./onDelete/user.onDelete');
const userOnDelete = new UserOnDelete({ emailService });
functions.auth.user().onDelete(userOnDelete.getFunction());
