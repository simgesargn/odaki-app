import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "odaki_onboarding_done";

let onboardingDone = false;
let onboardingLoading = true;
const listeners = new Set<() => void>();

async function init() {
	try {
		const raw = await AsyncStorage.getItem(KEY);
		onboardingDone = raw === "true";
	} catch (e) {
		console.warn("[onboardingStore] read err", e);
		onboardingDone = false;
	} finally {
		onboardingLoading = false;
		notify();
	}
}

function notify() {
	for (const cb of listeners) cb();
}

export async function setOnboardingDone(value: boolean) {
	try {
		await AsyncStorage.setItem(KEY, value ? "true" : "false");
		onboardingDone = value;
	} catch (e) {
		console.warn("[onboardingStore] set err", e);
		onboardingDone = value;
	}
	onboardingLoading = false;
	notify();
}

export function getOnboardingState() {
	return { onboardingDone, onboardingLoading };
}

export function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

// initialize once
init();

// React hook for components
export function useOnboardingState() {
	const [{ done, loading }, setState] = useState(() => ({ done: onboardingDone, loading: onboardingLoading }));

	useEffect(() => {
		function update() {
			setState({ done: onboardingDone, loading: onboardingLoading });
		}
		const unsub = subscribe(update);
		// in case init already set values
		update();
		return () => unsub();
	}, []);

	return {
		onboardingDone: done,
		onboardingLoading: loading,
		setOnboardingDone,
	};
}
