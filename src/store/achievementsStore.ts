import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "odaki_achievements_v1";

export type Achievement = { id: string; title: string; progress: number; total: number; rarity: string; locked?: boolean };

let cache: Achievement[] = [];
let inited = false;
const listeners = new Set<() => void>();

async function load() {
	if (inited) return cache;
	try {
		const raw = await AsyncStorage.getItem(KEY);
		cache = raw ? JSON.parse(raw) : [];
	} catch {
		cache = [];
	}
	inited = true;
	return cache;
}

async function persist() {
	try {
		await AsyncStorage.setItem(KEY, JSON.stringify(cache));
	} catch {}
}

export async function getAchievements() {
	await load();
	return cache.slice();
}

export async function addAchievement(a: Achievement) {
	await load();
	cache.unshift(a);
	await persist();
	listeners.forEach((l) => l());
}

export async function unlockAchievement(id: string) {
	await load();
	const idx = cache.findIndex((c) => c.id === id);
	if (idx >= 0 && cache[idx].locked) {
		cache[idx] = { ...cache[idx], locked: false };
		await persist();
		listeners.forEach((l) => l());
	}
}

export async function unlockAllAchievements() {
	await load();
	let changed = false;
	cache = cache.map((c) => {
		if (c.locked) {
			changed = true;
			return { ...c, locked: false };
		}
		return c;
	});
	if (changed) {
		await persist();
		listeners.forEach((l) => l());
	}
}

export async function seedDemo() {
	cache = [
		{ id: "a1", title: "İlk Görev", progress: 1, total: 1, rarity: "Yaygın", locked: false },
		{ id: "a2", title: "5 Gün Seri", progress: 3, total: 5, rarity: "Nadir", locked: true },
		{ id: "a3", title: "10 Görev Tamamla", progress: 7, total: 10, rarity: "Epik", locked: true },
	];
	await persist();
	listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

export default { getAchievements, addAchievement, seedDemo, subscribe, unlockAchievement, unlockAllAchievements };
