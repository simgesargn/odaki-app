import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Constants from "expo-constants";

const TIMEOUT_MS = 30000;
const QUOTA_COOLDOWN_MS = 60 * 1000; // 60s

let last429At: number | null = null;

export function getQuotaStatus(): { active: boolean; secondsLeft: number } {
	const now = Date.now();
	if (!last429At) return { active: false, secondsLeft: 0 };
	const diff = now - last429At;
	if (diff >= QUOTA_COOLDOWN_MS) return { active: false, secondsLeft: 0 };
	return { active: true, secondsLeft: Math.ceil((QUOTA_COOLDOWN_MS - diff) / 1000) };
}

function getGeminiKey(): string | null {
	return process.env.EXPO_PUBLIC_GEMINI_API_KEY || null;
}

function getGeminiModel(): string {
	return process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.0-flash";
}

function getProviderExact(): string {
	return process.env.EXPO_PUBLIC_AI_PROVIDER || "";
}

function fallbackTextForMissingKey() {
	return "AI anahtarınız yapılandırılmamış. Lütfen ayarlarınızı kontrol edin.";
}

function makeFallbackForPrompt(prompt: string) {
	// Basit, güvenli Türkçe fallback. Kısa ve pratik öneriler üretir.
	const short = prompt ? prompt.slice(0, 200) : "";
	const suggestions = [
		"Kısa bir hedef belirle: 15-25 dk arasında bir oturum planla.",
		"Telefonunu uzaklaştır ve bildirimleri kapat.",
		"İlk 5 dk içinde en önemli 1 işi tamamlamaya odaklan.",
	];
	const note = "Şu an AI kotası dolu veya servis erişilemiyor. " + suggestions.join(" ");
	return `Kotanız dolu veya servis geçici olarak kullanılamıyor. ${note}`;
}

async function geminiRequest(prompt: string, apiKey: string, model: string): Promise<{ text: string; provider: "gemini" | "fallback"; error?: string }> {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
	const body = { contents: [{ parts: [{ text: prompt }] }] };
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: controller.signal,
		});
		const status = res.status;
		const raw = await res.text();
		let data: any = null;
		try {
			data = raw ? JSON.parse(raw) : null;
		} catch {
			// non-json -> fallback
			const fbText = makeFallbackForPrompt(prompt);
			return { text: fbText, provider: "fallback", error: "NON_JSON_RESPONSE" };
		}

		if (status === 429) {
			last429At = Date.now();
			const fbText = makeFallbackForPrompt(prompt);
			return { text: fbText, provider: "fallback", error: "QUOTA_EXCEEDED" };
		}
		if (!res.ok) {
			const fbText = makeFallbackForPrompt(prompt);
			return { text: fbText, provider: "fallback", error: `HTTP_${status}` };
		}

		// safe assembly of text
		const parts = data?.candidates?.[0]?.content?.parts ?? [];
		let text = "";
		if (Array.isArray(parts)) {
			text = parts.map((p: any) => (p && typeof p.text === "string" ? p.text : "")).join("").trim();
		} else {
			text = typeof data?.output === "string" ? data.output : "";
		}
		if (!text) {
			text = makeFallbackForPrompt(prompt);
			return { text, provider: "fallback", error: "EMPTY_MODEL_OUTPUT" };
		}
		return { text, provider: "gemini" };
	} catch (err: any) {
		if (err?.name === "AbortError") {
			const fbText = makeFallbackForPrompt(prompt);
			return { text: fbText, provider: "fallback", error: "TIMEOUT" };
		}
		const fbText = makeFallbackForPrompt(prompt);
		return { text: fbText, provider: "fallback", error: err?.message ?? "NETWORK_ERROR" };
	} finally {
		clearTimeout(timeout);
	}
}

export type AdviceInput = {
	minutes: number;
	completedSeconds: number;
	stageLabel: string;
	streak?: number | null;
	isPremium?: boolean;
	sessionId?: string;
};

function fallbackAdviceLocal(input: AdviceInput) {
	const m = input.minutes;
	const compMin = Math.round((input.completedSeconds || 0) / 60);
	const parts: string[] = [];
	if ((input.completedSeconds || 0) < m * 60) parts.push("Hedefin altında kaldın — daha kısa hedefle başlayabilirsin.");
	if (m >= 45) parts.push("Uzun oturum; bitişte kısa bir yürüyüş yap.");
	if (input.stageLabel && input.stageLabel.toLowerCase().includes("tohum")) parts.push("Telefonu uzak tut ve bildirimleri kapat.");
	const text = parts.length ? parts.join(" ") : `Tebrikler! ${compMin} dakika odaklandın — bu rutini sürdür.`;
	return { text, provider: "fallback" as const };
}

export async function generateFocusAdvice(input: AdviceInput): Promise<{ text: string; provider: "gemini" | "fallback" }> {
	const PROVIDER = getProviderExact();
	const apiKey = getGeminiKey();
	const model = getGeminiModel();
	if (PROVIDER !== "GEMINI" || !apiKey) {
		return { text: fallbackTextForMissingKey(), provider: "fallback" };
	}

	const prompt = `Kullanıcı oturum bilgileri:
- Planlanan dakika: ${input.minutes}
- Gerçekleşen saniye: ${input.completedSeconds}
- Evre: ${input.stageLabel}
Kısa, net ve Türkçe 2-3 cümle odak önerisi ver.`;

	const res = await geminiRequest(prompt, apiKey, model);
	// ai_logs kaydı burada yapılmıyor; çağıran fonksiyon kaydeder.
	return { text: res.text, provider: res.provider };
}

export async function sendPrompt(userId: string, prompt: string): Promise<{ response: string; provider: "gemini" | "fallback"; error?: string }> {
	if (!prompt || !prompt.trim()) return { response: "Boş prompt gönderilemez", provider: "fallback", error: "EMPTY_PROMPT" };
	const PROVIDER = getProviderExact();
	const apiKey = getGeminiKey();
	const model = getGeminiModel();
	if (PROVIDER !== "GEMINI" || !apiKey) {
		const errMsg = fallbackTextForMissingKey();
		try {
			if (db) {
				await addDoc(collection(db, "ai_logs"), {
					userId,
					prompt,
					response: errMsg,
					provider: "fallback",
					createdAt: serverTimestamp(),
					type: "chat_error",
					errorMessage: "NO_API_KEY",
				});
			}
		} catch {}
		return { response: errMsg, provider: "fallback", error: "NO_API_KEY" };
	}

	const { text, provider, error } = await geminiRequest(prompt, apiKey, model);
	try {
		if (db) {
			await addDoc(collection(db, "ai_logs"), {
				userId,
				prompt,
				response: text,
				provider: provider === "gemini" ? "gemini" : "fallback",
				createdAt: serverTimestamp(),
				type: provider === "gemini" ? "chat" : "chat_error",
				errorMessage: provider === "fallback" ? error ?? "FALLBACK" : null,
			});
		}
	} catch (e) {
		console.error("[aiService] sendPrompt Firestore hata:", e);
	}
	return { response: text, provider, error };
}

export async function getFocusTip(prompt: string): Promise<{ text: string; provider: "gemini" | "fallback" }> {
	if (!prompt || !prompt.trim()) return { text: "Lütfen bir soru veya hedef girin.", provider: "fallback" };
	const PROVIDER = getProviderExact();
	const apiKey = getGeminiKey();
	const model = getGeminiModel();
	if (PROVIDER !== "GEMINI" || !apiKey) return { text: fallbackTextForMissingKey(), provider: "fallback" };
	const res = await geminiRequest(prompt, apiKey, model);
	return { text: res.text, provider: res.provider };
}

export async function getFocusTips(input: { minutes: number; stageLabel: string; isPremium: boolean }): Promise<{ tips: string[]; provider: "gemini" | "fallback" }> {
	const PROVIDER = getProviderExact();
	const apiKey = getGeminiKey();
	const model = getGeminiModel();
	const prompt = `Kısa ve pratik odak önerileri üret. Kullanıcı bilgileri: Planlanan dakika: ${input.minutes}, Evre: ${input.stageLabel}, Premium: ${input.isPremium ? "evet" : "hayır"}. 3 maddelik, kısa Türkçe öneriler ver.`;
	if (PROVIDER !== "GEMINI" || !apiKey) {
		const fb = ["Kısa bir hedef belirle, 15-25 dk ile başla.", "Bildirimleri kapat ve telefonu uzak tut.", "Pomodoro: 25dk odak, 5dk mola."];
		return { tips: fb, provider: "fallback" };
	}
	const res = await geminiRequest(prompt, apiKey, model);
	const text = res.text || "";
	const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
	if (lines.length >= 3) return { tips: lines.slice(0, 3), provider: res.provider };
	const sentences = text.split(/[.?!]\s+/).map((s) => s.trim()).filter(Boolean);
	if (sentences.length >= 3) return { tips: sentences.slice(0, 3).map(s => s.endsWith(".") ? s : s + "."), provider: res.provider };
	// fallback local
	const fb = ["Bildirimleri kapat.", "Kısa hedef: 15-25 dk.", "Ara ver ve nefes al."];
	return { tips: fb, provider: "fallback" };
}

const PROVIDER = (Constants.expoConfig?.extra as any)?.AI_PROVIDER ?? process.env.EXPO_PUBLIC_AI_PROVIDER;

// Basit yerel fallback cevaplar — UI bunları map ile güvenle render edebilir.
export const fallbackResponses = [
	"Merhaba! Nasıl yardımcı olabilirim?",
	"Öneri: 25 dk odak + 5 dk mola. Bunu deneyin.",
	"Yeni bir görev oluşturup öncelik atayabilirsiniz.",
];

export async function askAI(prompt: string): Promise<string[]> {
	try {
		if (PROVIDER === "GEMINI" && process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
			const apiKey = getGeminiKey();
			const model = getGeminiModel();
			const res = await geminiRequest(prompt, apiKey, model);
			// geminiRequest always returns {text, provider}
			if (res && typeof res.text === "string" && res.text.length > 0) {
				// split to paragraphs if long
				const parts = res.text.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean);
				return parts.length ? parts : [res.text];
			}
		}
	} catch (e) {
		console.warn("[aiService][askAI] provider error:", e);
	}
	// fallback
	return fallbackResponses;
}
