import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { User } from "../types/models";
import { ensureUser, setUserPremium, getUser } from "../services/firestoreService";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useOnboardingState } from "./onboardingStore";
import Constants from "expo-constants";
import tasksStore from "../store/tasksStore";

type SessionContextType = {
	userId: string | null;
	user: User | null;
	loading: boolean; // combined auth + onboarding loading
	onboardingDone: boolean;
	setOnboardingDone: (v: boolean) => Promise<void>;
	setPremium: (value: boolean) => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
	const [userId, setUserId] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [authLoading, setAuthLoading] = useState<boolean>(true);
	const unsubRef = useRef<(() => void) | null>(null);
	const didResetRef = useRef(false);

	// onboarding store
	const { onboardingDone, onboardingLoading, setOnboardingDone } = useOnboardingState();

	// DEV: always require login on cold start if flag true
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const devFlagEnv = (process.env.EXPO_PUBLIC_ALWAYS_REQUIRE_LOGIN === "true");
				const devFlagExtra = Boolean((Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_ALWAYS_REQUIRE_LOGIN === "true");
				const alwaysRequire = devFlagEnv || devFlagExtra;
				if (!alwaysRequire) return;
				if (didResetRef.current) return;
				didResetRef.current = true;

				console.log("[SessionProvider][DEV_RESET] active - forcing onboarding=false, signOut, clear caches");

				// set onboarding false (persisted)
				try {
					await setOnboardingDone(false);
				} catch (e) {
					console.warn("[SessionProvider][DEV_RESET] setOnboardingDone hata:", e);
				}

				// sign out firebase auth (if available)
				try {
					if (auth && typeof auth.signOut === "function") {
						await auth.signOut();
					}
				} catch (e) {
					console.warn("[SessionProvider][DEV_RESET] signOut hata:", e);
				}

				// clear session-local state immediately
				if (mounted) {
					setUserId(null);
					setUser(null);
				}

				// clear local tasks if possible (best-effort)
				try {
					if (tasksStore && typeof tasksStore.getTasks === "function" && typeof tasksStore.deleteTask === "function") {
						const list = await tasksStore.getTasks("local");
						if (Array.isArray(list)) {
							for (const t of list) {
								try {
									await tasksStore.deleteTask(t.id, "local");
								} catch (err) {
									// best effort - ignore individual delete errors
								}
							}
						}
					}
				} catch (e) {
					console.warn("[SessionProvider][DEV_RESET] tasks clear hata:", e);
				}
			} catch (e) {
				console.warn("[SessionProvider][DEV_RESET] genel hata:", e);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []); // sadece ilk mount

	useEffect(() => {
		let mounted = true;
		setAuthLoading(true);

		// defensive timeout: eğer 8s içinde auth callback gelmezse loading false yap
		const fallback = setTimeout(() => {
			if (mounted && authLoading) {
				console.warn("[SessionProvider] auth loading timeout -> forcing false");
				setAuthLoading(false);
			}
		}, 8000); // 8s

		const unsubAuth = onAuthStateChanged(
			auth,
			async (fbUser: FirebaseUser | null) => {
				if (!mounted) return;
				// cleanup previous snapshot
				if (unsubRef.current) {
					unsubRef.current();
					unsubRef.current = null;
				}

				try {
					if (fbUser) {
						const uid = fbUser.uid;
						setUserId(uid);
						setUser({
							id: uid,
							email: fbUser.email ?? null,
							createdAt: Date.now(),
							isPremium: false,
							totalFocusMinutes: 0,
							streak: 0,
							lastCompletedAt: null,
							flowersUnlocked: [],
						});
						await ensureUser(uid);
						if (db) {
							const userRef = doc(db, "users", uid);
							unsubRef.current = onSnapshot(
								userRef,
								(snap) => {
									if (!snap.exists()) {
										setUser(null);
										setAuthLoading(false);
										return;
									}
									const d = snap.data() as any;
									const createdVal = d.createdAt;
									let createdAtNum = Date.now();
									if (createdVal) {
										if (typeof createdVal === "number") createdAtNum = Number(createdVal);
										else if (createdVal?.toMillis) createdAtNum = (createdVal as Timestamp).toMillis();
										else createdAtNum = Number(createdVal) || Date.now();
									}
									setUser({
										id: uid,
										email: d.email ?? fbUser.email ?? null,
										createdAt: createdAtNum,
										isPremium: Boolean(d.isPremium),
										totalFocusMinutes: Number(d.totalFocusMinutes) || 0,
										streak: Number(d.streak) || 0,
										lastCompletedAt: d.lastCompletedAt ?? null,
										flowersUnlocked: Array.isArray(d.flowersUnlocked) ? d.flowersUnlocked : [],
									});
									setAuthLoading(false);
								},
								(err) => {
									console.error("[SessionProvider][onSnapshot] Hata:", err);
									setAuthLoading(false);
								}
							);
						} else {
							const u = await getUser(uid);
							setUser(u);
							setAuthLoading(false);
						}
					} else {
						// logged out
						setUserId(null);
						setUser(null);
						setAuthLoading(false);
					}
				} catch (e) {
					console.error("[SessionProvider] auth handler error:", e);
					setAuthLoading(false);
				}
			},
			(err) => {
				console.error("[SessionProvider][onAuthStateChanged] hata:", err);
				setAuthLoading(false);
			}
		);

		return () => {
			mounted = false;
			clearTimeout(fallback);
			if (unsubRef.current) unsubRef.current();
			unsubAuth();
		};
	}, []);

	const combinedLoading = Boolean(authLoading || onboardingLoading);

	const setPremium = async (value: boolean) => {
		if (!userId) return;
		try {
			await setUserPremium(userId, value);
		} catch (err) {
			console.error("[SessionProvider][setPremium] Hata:", err);
		}
	};

	return (
		<SessionContext.Provider value={{ userId, user, loading: combinedLoading, onboardingDone, setOnboardingDone, setPremium }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const ctx = useContext(SessionContext);
	if (!ctx) throw new Error("useSession must be used within SessionProvider");
	return ctx;
}
