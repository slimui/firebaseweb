var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert("./service-account.json"),
  databaseURL: "https://imageit-4fd5b.firebaseio.com"
});

var usersRef = admin.database().ref('Users');
var usersDBRef = admin.database().ref('UsersDB');

usersRef.once('value')
  .then(function(snap) {
    var users = snap.val();
    var updates = {};

    for (key in users) {
      let user = users[key];
      updates[user.userId] = user;
    }

    return usersDBRef.update(updates);
  })
  .then(function() {
    console.log('Success!');
    return true;
  })
  .catch(function(err) {
    throw new Error(err);
    return true;
  })
  .then(function() {
    process.exit();
  });
