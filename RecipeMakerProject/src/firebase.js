import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyA0j3Wbp289D4-Ah1RtYtrUh_O_ByK9FAw",
  authDomain: "cooksync-ff36a.firebaseapp.com",
  projectId: "cooksync-ff36a",
  storageBucket: "cooksync-ff36a.firebasestorage.app",
  messagingSenderId: "617733988322",
  appId: "1:617733988322:web:80e76d792c1e9cfba8a3bb"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
