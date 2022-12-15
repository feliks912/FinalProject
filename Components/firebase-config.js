/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
 const config = {
    apiKey: "AIzaSyBo1QBvyR-iAMKqO_62hTBhyaCDAefiI_k",
    authDomain: "cat-d-16085.firebaseapp.com",
    projectId: "cat-d-16085",
    storageBucket: "cat-d-16085.appspot.com",
    messagingSenderId: "783455449055",
    appId: "1:783455449055:web:75e2ba10e6c586b5049e6a"
  };
  
  export function getFirebaseConfig() {
    if (!config || !config.apiKey) {
      throw new Error('No Firebase configuration object provided.' + '\n' +
      'Add your web app\'s configuration object to firebase-config.js');
    } else {
      return config;
    }
  }