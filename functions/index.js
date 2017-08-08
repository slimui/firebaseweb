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


// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'ShopTrends';

// [START sendWelcomeEmail]
/**
 * Sends a welcome email to new user.
 */
// [START onCreateTrigger]
exports.sendWelcomeEmail = functions.auth.user().onCreate(event => {
// [END onCreateTrigger]
  // [START eventAttributes]
  const user = event.data; // The Firebase user.

  const email = user.email; // The email of the user.
  const displayName = user.displayName; // The display name of the user.
  // [END eventAttributes]

  return sendWelcomeEmail(email, displayName);
});
// [END sendWelcomeEmail]

// [START sendByeEmail]
/**
 * Send an account deleted email confirmation to users who delete their accounts.
 */
// [START onDeleteTrigger]
exports.sendByeEmail = functions.auth.user().onDelete(event => {
// [END onDeleteTrigger]
  const user = event.data;

  const email = user.email;
  const displayName = user.displayName;

  return sendGoodbyEmail(email, displayName);
});
// [END sendByeEmail]

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName) {
  const mailOptions = {
    from: '"ShopTrends" <noreply@firebase.com>',
    to: email
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Welcome to ${APP_NAME}!`;
  mailOptions.text = `Hi!, Welcome to ${APP_NAME}. Thank You for signing up with ShopTrends. We’re really happy to have you. Our goal is to help you discover and purchase celebrity and designer fashion and to make this experience as easy and fun as possible. 
We hope you enjoy using ShopTrends and discover a whole new world of designers and brands. We would also love to hear your feedback. Please email us at support@shoptrends.co with your thoughts.
Have fun shopping !

Thanks,
Team ShopTrends
www.shoptrends.co `;


  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('New welcome email sent to:', email);
  });
}

// Sends a goodbye email to the given user.
function sendGoodbyEmail(email, displayName) {
  const mailOptions = {
    from: '"ShopTrends" <noreply@firebase.com>',
    to: email
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Bye!`;
  mailOptions.text = `Hey ${displayName}!, We confirm that we have deleted your ${APP_NAME} account. We are Sorry to see you leave. If you could spare a moment, we would like to know why you are leaving and any thoughts you had on what it would take for us to bring you back on ShopTrends. 
  Please email us at support@shoptrends.co with your thoughts.

  Thanks,
  Team SHopTrends
  www.shoptrends.co`;

  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('Account deletion confirmation email sent to:', email);
  });
}


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
exports.taggedPostOnCreate = functions.database
  .ref('Posts/{postKey}/taggedPosts/{key}')
  .onCreate(postOnCreate.getFunction());

// OnDelete
const PostOnDelete = require('./onDelete/post.onDelete');
const postOnDelete = new PostOnDelete({ leaderboardService });
exports.postOnDelete = functions.database.ref('Posts/{key}').onDelete(postOnDelete.getFunction());
exports.taggedPostOnDelete = functions.database.ref('Posts/{PostKey}/taggedPosts/{key}').onDelete(postOnDelete.getFunction());

// OnWrite
const LikeOnWrite = require('./onWrite/like.onWrite');
const likeOnWrite = new LikeOnWrite({ leaderboardService });
exports.likeOnWrite = functions.database.ref('Posts/{key}').onWrite(likeOnWrite.getFunction());
exports.taggedPostLikeOnWrite = functions.database
  .ref('Posts/{postKey}/taggedPosts/{key}')
  .onWrite(likeOnWrite.getFunction());

// Auth
const UserOnCreate = require('./onCreate/user.onCreate');
const userOnCreate = new UserOnCreate({ emailService });
functions.auth.user().onCreate(userOnCreate.getFunction());

const UserOnDelete = require('./onDelete/user.onDelete');
const userOnDelete = new UserOnDelete({ emailService });
functions.auth.user().onDelete(userOnDelete.getFunction());
