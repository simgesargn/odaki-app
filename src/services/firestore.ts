import { firestoreDb } from "../firebase/firebase";
import {
	collection,
	doc,
	setDoc,
	addDoc,
	updateDoc,
	query,
	where,
	getDocs,
	serverTimestamp,
	Firestore,
	DocumentData,
} from "firebase/firestore";
import type { AllowedAppDoc, BlockedAppDoc } from "../types/firestore";

/**
 * Yardımcı: firestoreDb'nin hazır olduğunu doğrula
 */
function getDbOrThrow(): Firestore {
	if (!firestoreDb) {
		throw new Error(
			"[firestore] firestoreDb başlatılmamış. EXPO_PUBLIC_FIREBASE_... env değerlerini ve firebase init'i kontrol edin."
		);
	}
	return firestoreDb as Firestore;
}

/**
 * Kullanıcı dokümanını oluşturur veya var ise merge eder.
 * - user parametresi: { uid, displayName?, email? }
 * - createdAt serverTimestamp ile eklenir; merge true olduğu için var olan alanlar korunur.
 */
export async function ensureUser(user: {
	uid: string;
	displayName?: string | null;
	email?: string | null;
}) {
	const db = getDbOrThrow();
	const userRef = doc(db, "users", user.uid);
	// Kullanıcıyı ekle / güncelle (merge)
	await setDoc(
		userRef,
		{
			displayName: user.displayName ?? null,
			email: user.email ?? null,
			// Eğer zaten varsa serverTimestamp ile overwrite etmemek için merge kullanıyoruz.
			createdAt: serverTimestamp(),
			premium: false,
		},
		{ merge: true }
	);
	// Basitçe uid döndür
	return user.uid;
}

/**
 * Yeni bir focus oturumu oluşturur.
 * - userId: oturumu başlatan kullanıcı id'si
 * - minutes: hedeflenen dakika
 * Dönen değer: oluşturulan session doc id
 */
export async function createFocusSession(userId: string, minutes: number): Promise<string> {
	const db = getDbOrThrow();
	const colRef = collection(db, "focusSessions");
	const docRef = await addDoc(colRef, {
		userId,
		minutes,
		startedAt: serverTimestamp(),
		endedAt: null,
		completed: false,
		createdAt: serverTimestamp(),
	});
	return docRef.id;
}

/**
 * Mevcut focus oturumunu bitirir: endedAt ve completed alanlarını günceller.
 * - sessionId: session doküman id
 * - completed: boolean
 */
export async function finishFocusSession(sessionId: string, completed: boolean): Promise<void> {
	const db = getDbOrThrow();
	const sessionRef = doc(db, "focusSessions", sessionId);
	await updateDoc(sessionRef, {
		endedAt: serverTimestamp(),
		completed,
	});
}

/**
 * Kullanıcının allowedApps listesini getirir.
 * - userId: sorgulanan kullanıcı id
 * Döner: array of doküman (id + data)
 */
export async function getAllowedApps(userId: string): Promise<Array<{ id: string; data: AllowedAppDoc }>> {
	const db = getDbOrThrow();
	const q = query(collection(db, "allowedApps"), where("userId", "==", userId));
	const snap = await getDocs(q);
	return snap.docs.map((d) => ({ id: d.id, data: d.data() as AllowedAppDoc }));
}

/**
 * Kullanıcının blockedApps listesini getirir.
 * - userId: sorgulanan kullanıcı id
 * Döner: array of doküman (id + data)
 */
export async function getBlockedApps(userId: string): Promise<Array<{ id: string; data: BlockedAppDoc }>> {
	const db = getDbOrThrow();
	const q = query(collection(db, "blockedApps"), where("userId", "==", userId));
	const snap = await getDocs(q);
	return snap.docs.map((d) => ({ id: d.id, data: d.data() as BlockedAppDoc }));
}
