import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { User } from "../types/models";
import { ensureUser, getUser } from "../services/firestoreService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useSession } from "../store/sessionStore";

type UserContextType = {
	userId: string | null;
	user: User | null;
	loading: boolean;
	refreshUser: () => Promise<void>;
	setPremium: (isPremium: boolean) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
	userId: null,
	user: null,
	loading: true,
	refreshUser: async () => {},
	setPremium: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
	const { userId: sessionUserId } = useSession();
	const [userId, setUserId] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const unsubRef = useRef<(() => void) | null>(null);

	async function refreshUser() {
		if (!sessionUserId) return;
		try {
			const u = await getUser(sessionUserId);
			setUser(u);
		} catch (err) {
			console.error("[UserProvider][refreshUser] Hata:", err);
		}
	}

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				if (!sessionUserId) {
					setUserId(null);
					setUser(null);
					setLoading(false);
					return;
				}
				setUserId(sessionUserId);
				await ensureUser(sessionUserId);
				if (db) {
					const userRef = doc(db, "users", sessionUserId);
					if (unsubRef.current) unsubRef.current();
					unsubRef.current = onSnapshot(userRef, (snap) => {
						if (!snap.exists()) return;
						const d = snap.data() as any;
						setUser({
							id: sessionUserId,
							email: d.email ?? null,
							createdAt: Number(d.createdAt) || Date.now(),
							isPremium: Boolean(d.isPremium),
							totalFocusMinutes: Number(d.totalFocusMinutes) || 0,
							streak: Number(d.streak) || 0,
							lastCompletedAt: d.lastCompletedAt ?? null,
							flowersUnlocked: Array.isArray(d.flowersUnlocked) ? d.flowersUnlocked : [],
						});
						setLoading(false);
					});
				} else {
					await refreshUser();
					setLoading(false);
					}
			} catch (err) {
				console.error("[UserProvider] Başlatma hatası:", err);
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
			if (unsubRef.current) unsubRef.current();
		};
	}, [sessionUserId]);

	async function setPremium(isPremium: boolean) {
		if (!sessionUserId) return;
		try {
			await ensureUser(sessionUserId); // ensure existence
			// use firestoreService.setPremium (already available in service)
			await import("../services/firestoreService").then((m) => m.setUserPremium(sessionUserId, isPremium));
			await refreshUser();
		} catch (err) {
			console.error("[UserProvider][setPremium] Hata:", err);
		}
	}

	return <UserContext.Provider value={{ userId, user, loading, refreshUser, setPremium }}>{children}</UserContext.Provider>;
}

export function useUser() {
	return useContext(UserContext);
}
