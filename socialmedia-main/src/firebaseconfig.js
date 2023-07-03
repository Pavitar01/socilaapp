// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyA2YoiC3eBA1CCpG3bfnOZSK6UjyFhjTqs",
  authDomain: "myproj-fe2c7.firebaseapp.com",
  projectId: "myproj-fe2c7",
  storageBucket: "myproj-fe2c7.appspot.com",
  messagingSenderId: "793083197306",
  appId: "1:793083197306:web:565dd9090e5c17189cc8c3",
  measurementId: "G-97P78T32C6"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage ,app};