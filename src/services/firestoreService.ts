import { db } from "../firebase/firebase";
import {
	doc,
	getDoc,
	setDoc,
	collection,
	updateDoc,
	query,
	orderBy,
	limit,
	getDocs,
	runTransaction,
	addDoc,
	serverTimestamp,
	Timestamp,
	where,
	deleteDoc,
} from "firebase/firestore";
import type { User, FocusSession } from "../types/models";

/** Yardımcı: db hazır mı kontrol et (throw etmiyor, sadece log) */
function dbOrReturn() {
	if (!db) {
		console.warn("[firestoreService] Warning: firestore db yok (beklenmiyor).");
	}
	return db;
}

/**
 * users/{id} dokümanını alır veya oluşturur.
 */
export async function createOrGetUser(user: { id: string; email?: string | null }): Promise<User> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const userRef = doc(_db, "users", user.id);
		const snap = await getDoc(userRef);
		if (snap.exists()) {
			const d = snap.data() as any;
			return {
				id: user.id,
				email: d.email ?? null,
				createdAt: Number(d.createdAt) || Date.now(),
				isPremium: Boolean(d.isPremium),
				totalFocusMinutes: Number(d.totalFocusMinutes) || 0,
				streak: Number(d.streak) || 0,
				lastCompletedAt: d.lastCompletedAt ?? null,
				flowersUnlocked: Array.isArray(d.flowersUnlocked) ? d.flowersUnlocked : [],
			};
		}
		const now = Date.now();
		await setDoc(userRef, {
			email: user.email ?? null,
			createdAt: now,
			isPremium: false,
			totalFocusMinutes: 0,
			streak: 0,
			lastCompletedAt: null,
			flowersUnlocked: [],
		});
		return {
			id: user.id,
			email: user.email ?? null,
			createdAt: now,
			isPremium: false,
			totalFocusMinutes: 0,
			streak: 0,
			lastCompletedAt: null,
			flowersUnlocked: [],
		};
	} catch (err) {
		console.error("[firestoreService][createOrGetUser] Hata:", err);
		throw err;
	}
}

/**
 * Yeni: root focusSessions koleksiyonu içine session oluşturur.
 * startedAt serverTimestamp olarak kaydedilir; dönen obje client-side startedAt (ms) içerir.
 */
export async function createFocusSession(userId: string, minutesPlanned: number): Promise<FocusSession> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const userRef = doc(_db, "users", userId);
		const userSnap = await getDoc(userRef);
		const isPremium = userSnap.exists() ? Boolean((userSnap.data() as any).isPremium) : false;

		const colRef = collection(_db, "focusSessions");
		const sessionRef = doc(colRef); // auto-id
		const nowLocal = Date.now();
		await setDoc(sessionRef, {
			sessionId: sessionRef.id,
			userId,
			minutesPlanned,
			startedAt: serverTimestamp(),
			endedAt: null,
			completed: false,
			stageLabel: null,
			stageEmoji: null,
			isPremiumAtTime: isPremium,
		});
		return {
			id: sessionRef.id,
			userId,
			minutesPlanned,
			startedAt: nowLocal,
			endedAt: null,
			status: "running",
			flowerStageEarned: null,
		};
	} catch (err) {
		console.error("[firestoreService][createFocusSession] Hata:", err);
		throw err;
	}
}

/**
 * Oturumu tamamlar ve kullanıcı istatistiklerini transaction ile günceller.
 * - sessionId: root focusSessions/{sessionId}
 * - minutesPlanned: oturum planlanan dakika
 * - stageLabel/stageEmoji: kazanılan çiçek bilgisi
 */
export async function completeFocusSession(
	sessionId: string,
	userId: string,
	stageLabel: string,
	stageEmoji: string | null,
	minutesPlanned: number
): Promise<void> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const sessionRef = doc(_db, "focusSessions", sessionId);
		const userRef = doc(_db, "users", userId);
		const nowMs = Date.now();

		await runTransaction(_db, async (tx) => {
			const sessionSnap = await tx.get(sessionRef);
			if (!sessionSnap.exists()) throw new Error("Session bulunamadı");
			const sdata = sessionSnap.data() as any;
			if (sdata.completed) return;

			tx.update(sessionRef, {
				endedAt: serverTimestamp(),
				completed: true,
				stageLabel,
				stageEmoji,
			});

			const userSnap = await tx.get(userRef);
			const prevTotal = userSnap.exists() ? Number((userSnap.data() as any).totalFocusMinutes) || 0 : 0;
			const prevFlowers = userSnap.exists() ? (userSnap.data() as any).flowersUnlocked || [] : [];
			const newFlowers = Array.isArray(prevFlowers) ? prevFlowers.slice() : [];
			if (stageLabel && !newFlowers.includes(stageLabel)) newFlowers.push(stageLabel);

			// streakDays hesaplama (local tarih karşılaştırması)
			let newStreak = 1;
			const lastCompleted: any = userSnap.exists() ? (userSnap.data() as any).lastCompletedAt : null;
			if (lastCompleted && (lastCompleted as Timestamp).toDate) {
				const lastDate = (lastCompleted as Timestamp).toDate();
				const lastYMD = `${lastDate.getFullYear()}-${lastDate.getMonth()}-${lastDate.getDate()}`;
				const today = new Date(nowMs);
				const todayYMD = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
				const yesterday = new Date(nowMs - 24 * 60 * 60 * 1000);
				const yesterdayYMD = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
				if (lastYMD === todayYMD) {
					newStreak = Number((userSnap.data() as any).streakDays) || 1;
				} else if (lastYMD === yesterdayYMD) {
					newStreak = (Number((userSnap.data() as any).streakDays) || 0) + 1;
				} else {
					newStreak = 1;
				}
			} else {
				newStreak = 1;
			}

			tx.set(
				userRef,
				{
					totalFocusMinutes: prevTotal + minutesPlanned,
					lastCompletedAt: serverTimestamp(),
					streakDays: newStreak,
				},
				{ merge: true }
			);
		});
	} catch (err) {
		console.error("[firestoreService][completeFocusSession] Hata:", err);
		throw err;
	}
}

/**
 * Oturumu iptal eder (root collection).
 */
export async function cancelFocusSession(sessionId: string): Promise<void> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const sessionRef = doc(_db, "focusSessions", sessionId);
		const now = Date.now();
		await updateDoc(sessionRef, {
			endedAt: serverTimestamp(),
			completed: false,
			status: "cancelled",
		});
	} catch (err) {
		console.error("[firestoreService][cancelFocusSession] Hata:", err);
		throw err;
	}
}

/**
 * Kullanıcının son N oturumunu döner (root focusSessions).
 */
export async function listRecentSessions(userId: string, limitN = 10): Promise<FocusSession[]> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const q = query(collection(_db, "focusSessions"), where("userId", "==", userId), orderBy("endedAt", "desc"), limit(limitN));
		const snap = await getDocs(q);
		return snap.docs.map((d) => {
			const data = d.data() as any;
			return {
				id: d.id,
				userId: data.userId,
				minutesPlanned: Number(data.minutesPlanned),
				startedAt: data.startedAt ? (data.startedAt as any) : null,
				endedAt: data.endedAt ? (data.endedAt as any) : null,
				status: data.completed ? "completed" : data.status || "running",
				flowerStageEarned: data.stageLabel ?? null,
			} as FocusSession;
		});
	} catch (err) {
		console.error("[firestoreService][listRecentSessions] Hata:", err);
		return [];
	}
}

/**
 * Kullanıcı istatistiklerini döner.
 */
export async function getUserStats(userId: string): Promise<{
	totalFocusMinutes: number;
	streakDays: number;
	lastCompletedAt?: any | null;
}> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const ref = doc(_db, "users", userId);
		const snap = await getDoc(ref);
		if (!snap.exists()) return { totalFocusMinutes: 0, streakDays: 0, lastCompletedAt: null };
		const d = snap.data() as any;
		return {
			totalFocusMinutes: Number(d.totalFocusMinutes) || 0,
			streakDays: Number(d.streakDays) || 0,
			lastCompletedAt: d.lastCompletedAt ?? null,
		};
	} catch (err) {
		console.error("[firestoreService][getUserStats] Hata:", err);
		return { totalFocusMinutes: 0, streakDays: 0, lastCompletedAt: null };
	}
}

/**
 * Kullanıcıyı döner veya null.
 */
export async function getUser(userId: string): Promise<User | null> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const ref = doc(_db, "users", userId);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		const d = snap.data() as any;
		return {
			id: userId,
			email: d.email ?? null,
			createdAt: Number(d.createdAt) || Date.now(),
			isPremium: Boolean(d.isPremium),
			streak: Number(d.streak) || 0,
			totalFocusMinutes: Number(d.totalFocusMinutes) || 0,
		};
	} catch (err) {
		console.error("[firestoreService][getUser] Hata:", err);
		return null;
	}
}

/**
 * Kullanıcı premium durumunu günceller.
 */
export async function setPremium(userId: string, isPremium: boolean): Promise<void> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const userRef = doc(_db, "users", userId);
		if (isPremium) {
			await updateDoc(userRef, {
				isPremium: true,
				premiumSince: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
		} else {
			await updateDoc(userRef, {
				isPremium: false,
				premiumSince: null,
				updatedAt: serverTimestamp(),
			});
		}
		console.log("PREMIUM_SET", isPremium);
	} catch (err) {
		console.error("[firestoreService][setPremium] Hata:", err);
		throw err;
	}
}

// saveAiAdvice: ai tavsiyesini ai_logs içine kaydeder (type: "advice")
export async function saveAiAdvice(userId: string, payload: {
	sessionId: string;
	minutes: number;
	completedSeconds: number;
	stageLabel: string;
	isPremiumAtTime: boolean;
	adviceText: string;
	provider: "gemini" | "fallback";
}) {
	try {
		const colRef = collection(db, "ai_logs");
		const docRef = await addDoc(colRef, {
			userId,
			focusSessionId: payload.sessionId,
			minutes: payload.minutes,
			completedSeconds: payload.completedSeconds,
			stageLabel: payload.stageLabel,
			isPremiumAtTime: payload.isPremiumAtTime,
			response: payload.adviceText,
			provider: payload.provider,
			createdAt: serverTimestamp(),
			type: "advice",
		});
		console.log("AI_ADVICE_SAVED", docRef.id);
		return docRef.id;
	} catch (err) {
		console.error("[firestoreService][saveAiAdvice] Hata:", err);
		throw err;
	}
}

// Son AI advice kaydını ai_logs'tan al (type filtresi kaldırıldı)
export async function getLatestAiAdvice(userId: string) {
	try {
		const q = query(
			collection(db, "ai_logs"),
			where("userId", "==", userId),
			orderBy("createdAt", "desc"),
			limit(1)
		);
		const snap = await getDocs(q);
		if (snap.empty) return null;
		const d = snap.docs[0].data() as any;
		return { id: snap.docs[0].id, ...d };
	} catch (err) {
		console.error("[firestoreService][getLatestAiAdvice] Hata:", err);
		return null;
	}
}

// Günlük AI kullanım sayısını ai_logs'tan alır (type filtresi kaldırıldı)
export async function getDailyAiUsageCount(userId: string): Promise<number> {
	try {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const q = query(
			collection(db, "ai_logs"),
			where("userId", "==", userId),
			where("createdAt", ">=", start)
		);
		const snap = await getDocs(q);
		return snap.size;
	} catch (err) {
		console.error("[firestoreService][getDailyAiUsageCount] Hata:", err);
		return 0;
	}
}

// ai log ekler (root ai_logs)
export async function addAiLog(userId: string, prompt: string, response: string, provider: string = "gemini") {
	try {
		const colRef = collection(db, "ai_logs");
		const docRef = await addDoc(colRef, {
			userId,
			prompt,
			response,
			provider,
			createdAt: serverTimestamp(),
			type: "chat",
		});
		return docRef.id;
	} catch (err) {
		console.error("[firestoreService][addAiLog] Hata:", err);
		throw err;
	}
}

// generic AI suggestion log (uniform)
export async function logAiSuggestion(params: {
	userId: string;
	focusSessionId?: string | null;
	prompt: string;
	response: string;
	provider: "GEMINI" | "FALLBACK" | string;
}) {
	try {
		const colRef = collection(db, "ai_logs");
		await addDoc(colRef, {
			userId: params.userId,
			focusSessionId: params.focusSessionId ?? null,
			prompt: params.prompt,
			response: params.response,
			provider: params.provider,
			createdAt: serverTimestamp(),
			type: "suggestion",
		});
		console.log("AI_LOG_SAVED");
	} catch (err) {
		console.error("[firestoreService][logAiSuggestion] Hata:", err);
		throw err;
	}
}

// Yeni: users/{id} dokümanını garanti altına alır (yoksa oluştur)
export async function ensureUser(userId: string, email?: string | null): Promise<void> {
	try {
		const _db = dbOrReturn();
		if (!_db) return;
		const userRef = doc(_db, "users", userId);
		const snap = await getDoc(userRef);
		if (!snap.exists()) {
			await setDoc(userRef, {
				userId,
				email: email ?? null,
				createdAt: serverTimestamp(),
				isPremium: false,
				premiumSince: null,
				totalFocusMinutes: 0,
				streak: 0,
				lastCompletedAt: null,
				flowersUnlocked: [],
			});
		}
	} catch (err) {
		console.error("[firestoreService][ensureUser] Hata:", err);
		// don't throw to avoid app crash during bootstrap
	}
}

// Yeni: kullanıcının premium durumunu döner (yoksa false)
export async function getUserPremium(userId: string): Promise<boolean> {
	try {
		const _db = dbOrReturn();
		if (!_db) return false;
		const ref = doc(_db, "users", userId);
		const snap = await getDoc(ref);
		if (!snap.exists()) return false;
		const d = snap.data() as any;
		return Boolean(d.isPremium);
	} catch (err) {
		console.error("[firestoreService][getUserPremium] Hata:", err);
		return false;
	}
}

// Yeni: setUserPremium wrapper - gerçek değişikliği setPremium ile yapar
export async function setUserPremium(userId: string, isPremium: boolean): Promise<void> {
	try {
		// setPremium mevcut fonksiyon; aynı işlemi yapar (serverTimestamp, log)
		await setPremium(userId, isPremium);
	} catch (err) {
		console.error("[firestoreService][setUserPremium] Hata:", err);
		throw err;
	}
}

export type TaskItem = {
	id: string;
	title: string;
	createdAt: any;
};

export async function listUserTasks(userId: string): Promise<TaskItem[]> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const q = query(collection(_db, "users", userId, "tasks"), orderBy("createdAt", "desc"));
		const snap = await getDocs(q);
		return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TaskItem[];
	} catch (err) {
		console.error("[firestoreService][listUserTasks] Hata:", err);
		return [];
	}
}

export async function addUserTask(userId: string, title: string): Promise<string | null> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const colRef = collection(_db, "users", userId, "tasks");
		const docRef = await addDoc(colRef, {
			title,
			createdAt: serverTimestamp(),
		});
		return docRef.id;
	} catch (err) {
		console.error("[firestoreService][addUserTask] Hata:", err);
		return null;
	}
}

export async function deleteUserTask(userId: string, taskId: string): Promise<void> {
	try {
		const _db = dbOrReturn();
		if (!_db) throw new Error("[firestoreService] firestore db başlatılmamış. Firebase init'i kontrol edin.");
		const ref = doc(_db, "users", userId, "tasks", taskId);
		await deleteDoc(ref);
	} catch (err) {
		console.error("[firestoreService][deleteUserTask] Hata:", err);
	}
}

// Tasks (schema: title, desc, category, priority, date, time, status, createdAt, updatedAt, ownerId, sharedWith)
export async function createTask(ownerId: string, data: any) {
	try {
		const payload = {
			...data,
			ownerId,
			status: data.status ?? "active",
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};
		const ref = await addDoc(collection(db, "tasks"), payload);
		return { ok: true, id: ref.id };
	} catch (err) {
		console.error("[firestoreService][createTask]", err);
		return { ok: false, error: err };
	}
}

export async function getTask(taskId: string) {
	try {
		const ref = doc(db, "tasks", taskId);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return { id: snap.id, ...(snap.data() as any) };
	} catch (err) {
		console.error("[firestoreService][getTask]", err);
		return null;
	}
}

export async function updateTask(taskId: string, data: any) {
	try {
		const ref = doc(db, "tasks", taskId);
		await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
		return { ok: true };
	} catch (err) {
		console.error("[firestoreService][updateTask]", err);
		return { ok: false, error: err };
	}
}

export async function deleteTask(ownerId: string, taskId: string) {
	try {
		// optional: check ownerId matches
		await deleteDoc(doc(db, "tasks", taskId));
		return { ok: true };
	} catch (err) {
		console.error("[firestoreService][deleteTask]", err);
		return { ok: false, error: err };
	}
}
