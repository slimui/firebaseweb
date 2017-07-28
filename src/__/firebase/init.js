if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
firebase.initializeApp({
  "apiKey": "AIzaSyBGuv7I6699HahEhk34l0wkrc2mUHnbdo0",
  "databaseURL": "https://imageit-4fd5b.firebaseio.com",
  "storageBucket": "imageit-4fd5b.appspot.com",
  "authDomain": "imageit-4fd5b.firebaseapp.com",
  "messagingSenderId": "148700010403",
  "projectId": "imageit-4fd5b"
});