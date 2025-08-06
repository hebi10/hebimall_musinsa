const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD9xCrkmFZw0PvS9hXl5kpWv81qX1v4lcw",
  authDomain: "hebimall.firebaseapp.com",
  projectId: "hebimall",
  storageBucket: "hebimall.firebasestorage.app",
  messagingSenderId: "404572243739",
  appId: "1:404572243739:web:8a5b237d8532015cde35be"
};

const app = initializeApp(firebaseConfig);

module.exports = {
  app,
  auth: getAuth(app),
  db: getFirestore(app)
};
