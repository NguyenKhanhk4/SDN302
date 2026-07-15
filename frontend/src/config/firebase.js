import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCd0MiQUP5rIf-eHriPiQ2eSUDIacNE7k8",
  authDomain: "sdn302-8711c.firebaseapp.com",
  projectId: "sdn302-8711c",
  storageBucket: "sdn302-8711c.firebasestorage.app",
  messagingSenderId: "610999147128",
  appId: "1:610999147128:web:5edb7f209883213f7b6b8d",
  measurementId: "G-HYQ54G4V01"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
