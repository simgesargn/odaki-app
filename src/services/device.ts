import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from "expo-crypto";

const STORAGE_KEY = "odaki_user_id";

async function genUuid(): Promise<string> {
	// expo-crypto randomUUID varsa kullan, yoksa fallback
	if ((Crypto as any).randomUUID) {
		try {
			return (Crypto as any).randomUUID();
		} catch {
			// fallback
		}
	}
	// küçük rastgele id fallback
	return "odaki_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

export async function getOrCreateDeviceUserId(): Promise<string> {
	const existing = await AsyncStorage.getItem(STORAGE_KEY);
	if (existing) return existing;
	const id = await genUuid();
	await AsyncStorage.setItem(STORAGE_KEY, id);
	return id;
}

// Uyumluluk için eski isim
export const getOrCreateUserId = getOrCreateDeviceUserId;
