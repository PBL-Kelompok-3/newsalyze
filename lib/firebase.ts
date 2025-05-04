// lib/firebase.ts
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyDQj0TD8tw-3XbSGk73zd1r1k-O8cXwotU",
    authDomain: "newsalyze.firebaseapp.com",
    projectId: "newsalyze",
    storageBucket: "newsalyze.firebasestorage.app",
    messagingSenderId: "439305806397",
    appId: "1:439305806397:web:d2e725a303406bbfe44054",
    measurementId: "G-S8DW94233Y"
  };

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const googleProvider = new GoogleAuthProvider()

  export { auth, googleProvider }
