import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "../store/sessionStore";
import { ensureUser, getUser, setUserPremium } from "../services/firestoreService";

type PremiumContextType = {
	isPremium: boolean;
	loading: boolean;
	userId: string | null;
	refreshPremium: () => Promise<void>;
	upgradeToPremium: () => Promise<void>;
	cancelPremium: () => Promise<void>;
};

const PremiumContext = createContext<PremiumContextType>({
	isPremium: false,
	loading: true,
	userId: null,
	refreshPremium: async () => {},
	upgradeToPremium: async () => {},
	cancelPremium: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
	const { userId } = useSession();
	const [isPremium, setIsPremium] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	async function refreshPremium() {
		if (!userId) return;
		setLoading(true);
		try {
			const u = await getUser(userId);
			setIsPremium(Boolean(u?.isPremium));
		} catch (err) {
			console.error("[PremiumProvider][refreshPremium] Hata:", err);
		} finally {
			setLoading(false);
		}
	}

	async function upgradeToPremium() {
		if (!userId) return;
		setLoading(true);
		try {
			await setUserPremium(userId, true);
			await refreshPremium();
		} catch (err) {
			console.error("[PremiumProvider][upgradeToPremium] Hata:", err);
		} finally {
			setLoading(false);
		}
	}

	async function cancelPremium() {
		if (!userId) return;
		setLoading(true);
		try {
			await setUserPremium(userId, false);
			await refreshPremium();
		} catch (err) {
			console.error("[PremiumProvider][cancelPremium] Hata:", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!userId) {
			setIsPremium(false);
			setLoading(false);
			return;
		}
		ensureUser(userId).then(() => refreshPremium());
	}, [userId]);

	return (
		<PremiumContext.Provider value={{ isPremium, loading, userId, refreshPremium, upgradeToPremium, cancelPremium }}>
			{children}
		</PremiumContext.Provider>
	);
}

export function usePremium() {
	return useContext(PremiumContext);
}
