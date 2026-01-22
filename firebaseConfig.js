import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, getReactNativePersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

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
	persistence: Platform.OS === "web" ? browserLocalPersistence : getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Firestore offline persistence for caching and offline support
// This allows the app to work offline and queue writes until connectivity returns
enableIndexedDbPersistence(db).catch((err) => {
	if (err.code === "failed-precondition") {
		// Multiple tabs open, persistence can only be enabled in one tab at a time
		console.warn("Firestore persistence unavailable: multiple tabs open");
	} else if (err.code === "unimplemented") {
		// The current browser/environment doesn't support persistence
		console.warn("Firestore persistence not supported in this environment");
	}
});
