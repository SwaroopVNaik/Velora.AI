import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "veloraai-ab3e1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "veloraai-ab3e1"
};

const app = initializeApp(firebaseConfig);
const auth= getAuth(app)
const provider=new GoogleAuthProvider()

export {auth,provider}
