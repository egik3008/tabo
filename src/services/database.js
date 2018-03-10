import firebase from 'firebase';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_WEB_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_WEB_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_WEB_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_WEB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_WEB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_WEB_MESSAGING_SENDER_ID,
};

export const database = firebase.initializeApp(config);
export const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
