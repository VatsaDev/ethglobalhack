import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAPY1LfM2_X-TSXNJ3SsSo2aGIkpAMoHDE",
  authDomain: "extend0x.firebaseapp.com",
  projectId: "extend0x",
  storageBucket: "extend0x.appspot.com",
  messagingSenderId: "508075357704",
  appId: "1:508075357704:web:104361177ff0c8e057c3bd",
  measurementId: "G-W106Z8FPZ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
