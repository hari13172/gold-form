// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { FirebaseApp } from "firebase/app"; // Import FirebaseApp type
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBohbSlH8kC8ItGEFjnSarWGAXfpfS0Fbg",
  authDomain: "gold-7c768.firebaseapp.com",
  databaseURL: "https://gold-7c768-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gold-7c768",
  storageBucket: "gold-7c768.appspot.com",
  messagingSenderId: "313634874231",
  appId: "1:313634874231:web:07f266f7d2202801dc7772",
  measurementId: "G-F3LT1CPXH8"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
const auth = getAuth(app)

export { auth,database };