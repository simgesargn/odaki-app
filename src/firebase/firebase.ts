import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";

const extra = (Constants.expoConfig && (Constants.expoConfig as any).extra) || {};
const fb = extra.firebase || {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];
const missing = requiredKeys.filter((k) => !fb[k]);
if (missing.length) {
	console.error(`[firebase] EXPO_PUBLIC_FIREBASE_... env eksik: ${missing.join(", ")}. .env veya app config kontrol edin.`);
}

export const app = initializeApp(fb as any);
export const db = getFirestore(app);

let authInstance;
try {
	authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
	authInstance = getAuth(app);
}
export const auth = authInstance;
