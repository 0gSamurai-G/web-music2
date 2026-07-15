import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBq0PV9AvSyCUYqqtAarjXN6Ox6cSqs_1w",
  authDomain: "mystic-chat-df071.firebaseapp.com",
  projectId: "mystic-chat-df071",
  storageBucket: "mystic-chat-df071.firebasestorage.app",
  messagingSenderId: "619113459587",
  appId: "1:619113459587:web:360253a372d021c83b50b6",
  measurementId: "G-M0L6523C2J"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
