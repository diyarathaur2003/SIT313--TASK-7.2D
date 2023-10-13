// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAIdSkfjh61ev4sgnS3pek0QDflhbOPoc4",
    authDomain: "storedata-9c785.firebaseapp.com",
    projectId: "storedata-9c785",
    storageBucket: "storedata-9c785.appspot.com",
    messagingSenderId: "770247921684",
    appId: "1:770247921684:web:7d3133db296f50b85d9701",
    measurementId: "G-4ETSSLY8ZN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);