import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD5v6WqIr-xxsCunJNglyRDFQMJkX4-AyE",
    authDomain: "iot-services-269de.firebaseapp.com",
    projectId: "iot-services-269de",
    storageBucket: "iot-services-269de.appspot.com",
    messagingSenderId: "568571866562",
    appId: "1:568571866562:web:ded3a18215babaf2dbba5b",
    measurementId: "G-FNYQT1CBCW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };