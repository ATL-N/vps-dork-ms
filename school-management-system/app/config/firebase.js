// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdXREsBkDXD292J9-hmNNunTQdMNp3v1Y",
  authDomain: "school-management-e22be.firebaseapp.com",
  projectId: "school-management-e22be",
  storageBucket: "school-management-e22be.appspot.com",
  messagingSenderId: "1099484349064",
  appId: "1:1099484349064:web:a72709851ecfb62183953d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const database = getFirestore(app)


