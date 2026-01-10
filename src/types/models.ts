// Firestore modelleri — timestamp alanları number (ms) olarak tutulur

export type User = {
	id: string;
	email?: string;
	createdAt: number; // ms
	isPremium: boolean;
	totalFocusMinutes: number;
	streak: number;
	lastCompletedAt?: number | null;
	flowersUnlocked: string[]; // örn ["Tohum","Filiz",...]
};

export type FocusSession = {
	id: string;
	userId: string;
	minutesPlanned: number;
	startedAt: number; // ms
	endedAt?: number | null; // ms
	status: "running" | "completed" | "cancelled";
	flowerStageEarned?: string | null;
};

export type Subscription = {
	userId: string;
	plan: "free" | "premium";
	startedAt: number; // ms
	expiresAt?: number;
};
