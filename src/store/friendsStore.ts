import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "odaki_friends_v1";

export type Friend = { id: string; name: string; status: "friend" | "online" | "request-in" | "request-out" };

let cache: Friend[] = [];
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

export async function getFriends() {
	await load();
	return cache.slice();
}

export async function addFriend(f: Friend) {
	await load();
	cache.unshift(f);
	await persist();
	listeners.forEach((l) => l());
}

export async function seedDemo() {
	cache = [
		{ id: "u1", name: "Ayşe Y.", status: "online" },
		{ id: "u2", name: "Mehmet K.", status: "friend" },
		{ id: "r1", name: "Gelen İstek - Ali", status: "request-in" },
	];
	await persist();
	listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

export default { getFriends, addFriend, seedDemo, subscribe };
