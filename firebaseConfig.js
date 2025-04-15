import { initializeApp } from "firebase/app";
import {
	initializeAuth,
	getReactNativePersistence,
	browserLocalPersistence,
	FacebookAuthProvider,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
	measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize auth with platform-specific persistence
const auth = initializeAuth(app, {
	persistence: Platform.OS === "web" ? browserLocalPersistence : getReactNativePersistence(AsyncStorage),
});

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
