import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "odaki_tasks_v1_";

type Task = {
	id: string;
	title: string;
	desc?: string;
	category?: string;
	priority?: "low" | "medium" | "high";
	date?: string | null;
	time?: string | null;
	status?: "active" | "completed";
	createdAt: number;
};

let tasksCache: Task[] = [];
let inited = false;
const listeners = new Set<() => void>();

async function load(userKey = "local") {
	if (inited) return tasksCache;
	try {
		const raw = await AsyncStorage.getItem(KEY_PREFIX + userKey);
		tasksCache = raw ? JSON.parse(raw) : [];
	} catch (e) {
		console.warn("[tasksStore] load err", e);
		tasksCache = [];
	}
	inited = true;
	return tasksCache;
}

async function persist(userKey = "local") {
	try {
		await AsyncStorage.setItem(KEY_PREFIX + userKey, JSON.stringify(tasksCache));
	} catch (e) {
		console.warn("[tasksStore] persist err", e);
	}
}

export async function getTasks(userKey = "local") {
	await load(userKey);
	return tasksCache.slice();
}

export async function addTask(payload: Partial<Task>, userKey = "local") {
	await load(userKey);
	const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
	const t: Task = {
		id,
		title: payload.title?.trim() || "Yeni Görev",
		desc: payload.desc || "",
		category: payload.category || "Genel",
		priority: payload.priority || "medium",
		date: payload.date || null,
		time: payload.time || null,
		status: "active",
		createdAt: Date.now(),
	};
	tasksCache.unshift(t);
	await persist(userKey);
	listeners.forEach((l) => l());
	return t;
}

export async function updateTask(id: string, changes: Partial<Task>, userKey = "local") {
	await load(userKey);
	tasksCache = tasksCache.map((t) => (t.id === id ? { ...t, ...changes } : t));
	await persist(userKey);
	listeners.forEach((l) => l());
	return true;
}

export async function deleteTask(id: string, userKey = "local") {
	await load(userKey);
	tasksCache = tasksCache.filter((t) => t.id !== id);
	await persist(userKey);
	listeners.forEach((l) => l());
	return true;
}

export function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

export default {
	getTasks,
	addTask,
	updateTask,
	deleteTask,
	subscribe,
};
