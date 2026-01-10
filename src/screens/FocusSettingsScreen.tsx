import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../store/sessionStore";
import { getFocusTip, getFocusTips, getQuotaStatus } from "../services/aiService";
import { addAiLog, getDailyAiUsageCount, logAiSuggestion } from "../services/firestoreService";
import { Screen, Card, TextField, PrimaryButton, SectionTitle, EmptyState } from "../ui/components";

export default function FocusSettingsScreen() {
	const { userId, user, setPremium } = useSession();
	const [prompt, setPrompt] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const [todayCount, setTodayCount] = useState<number>(0);

	const isPremium = Boolean(user?.isPremium);

	// Yeni: AI öneri için input ve sonuçlar
	const [tipMinutes, setTipMinutes] = useState<string>("25");
	const [tipStage, setTipStage] = useState<string>("Tohum");
	const [tips, setTips] = useState<string[] | null>(null);
	const [tipsLoading, setTipsLoading] = useState(false);

	const [quotaActive, setQuotaActive] = useState<boolean>(false);
	const [quotaSecondsLeft, setQuotaSecondsLeft] = useState<number>(0);

	const [allowedApps, setAllowedApps] = useState<string[]>(["Takvim", "Spotify"]);
	const [blockedApps, setBlockedApps] = useState<string[]>(["YouTube", "Instagram", "TikTok"]);
	const [limitReached, setLimitReached] = useState(false);

	useEffect(() => {
		(async () => {
			if (!userId) return;
			const cnt = await getDailyAiUsageCount(userId);
			setTodayCount(cnt);
		})();
	}, [userId]);

	useEffect(() => {
		const q = getQuotaStatus();
		setQuotaActive(q.active);
		setQuotaSecondsLeft(q.secondsLeft);
		let interval: any = null;
		if (q.active) {
			interval = setInterval(() => {
				const nq = getQuotaStatus();
				setQuotaActive(nq.active);
				setQuotaSecondsLeft(nq.secondsLeft);
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		if (!user?.isPremium && allowedApps.length >= 3) setLimitReached(true);
		else setLimitReached(false);
	}, [allowedApps, user]);

	async function onGetAdvice() {
		if (!userId) return;
		const quota = getQuotaStatus();
		if (quota.active) {
			Alert.alert("Kota Aşıldı", `Kotanız doldu. ${quota.secondsLeft}s sonra tekrar deneyin.`);
			setQuotaActive(true);
			setQuotaSecondsLeft(quota.secondsLeft);
			return;
		}
		if (!prompt.trim()) {
			Alert.alert("Uyarı", "Lütfen sorununuzu veya hedefinizi yazın.");
			return;
		}
		if (!isPremium && todayCount >= 3) {
			Alert.alert("Limit", "Günlük ücretsiz istek hakkınızı doldurdunuz. Premium ile sınırsız.");
			return;
		}
		setLoading(true);
		try {
			const res = await getFocusTip(prompt.trim());
			const text = res.text ?? "";
			setResult(text);
			// ai_logs'a kaydet (provider bilgisi de eklenir)
			await addAiLog(userId, prompt.trim(), text, res.provider === "gemini" ? "GEMINI" : "FALLBACK");
			const cnt = await getDailyAiUsageCount(userId);
			setTodayCount(cnt);
		} catch (err) {
			console.error("[FocusSettingsScreen] AI hatası:", err);
			Alert.alert("Hata", "AI servisine ulaşılamadı, tekrar deneyin.");
		} finally {
			setLoading(false);
		}
	}

	async function onGet3Tips() {
		if (!userId) return;
		const quota = getQuotaStatus();
		if (quota.active) {
			Alert.alert("Kota Aşıldı", `Kotanız doldu. ${quota.secondsLeft}s sonra tekrar deneyin.`);
			setQuotaActive(true);
			setQuotaSecondsLeft(quota.secondsLeft);
			return;
		}
		const minutesNum = Math.max(1, Math.round(Number(tipMinutes) || 25));
		setTipsLoading(true);
		try {
			const res = await getFocusTips({ minutes: minutesNum, stageLabel: tipStage, isPremium });
			const arr = res.tips ?? [];
			setTips(arr);
			await logAiSuggestion({
				userId,
				focusSessionId: null,
				prompt: `minutes=${minutesNum}; stage=${tipStage}; premium=${isPremium}`,
				response: arr.join("\n"),
				provider: res.provider === "gemini" ? "GEMINI" : "FALLBACK",
			});
		} catch (err) {
			console.error("[FocusSettingsScreen][onGet3Tips] Hata:", err);
			Alert.alert("Hata", "AI önerisi alınamadı.");
		} finally {
			setTipsLoading(false);
		}
	}

	function removeAllowed(app: string) {
		setAllowedApps((s) => s.filter((a) => a !== app));
	}

	function addAllowed(app: string) {
		if (!user?.isPremium && allowedApps.length >= 3) {
			Alert.alert("Limit", "Ücretsiz kullanıcılar için maksimum 3 izinli uygulama hakkı vardır. Premium'a geçin.");
			return;
		}
		setAllowedApps((s) => (s.includes(app) ? s : [...s, app]));
		setBlockedApps((s) => s.filter((b) => b !== app));
	}

	function unbanApp(app: string) {
		// simülasyon: app'i allowed listesine ekle (sınır kontrolü)
		addAllowed(app);
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: 16 }}>
			<Card>
				<Text style={{ fontWeight: "700", fontSize: 18 }}>Akademik Not</Text>
				<Text style={{ marginTop: 8 }}>Odak modu uygulama kısıtlaması simülasyon şeklindedir. Gerçek sistem izinleri cihaz ayarlarından yönetilir.</Text>
			</Card>

			<Card style={{ marginTop: 12 }}>
				<Text style={{ fontWeight: "700" }}>Ücretsiz Plan Limiti</Text>
				<Text style={{ marginTop: 8 }}>Ücretsiz kullanıcılar maksimum 3 izinli uygulama ekleyebilir. Premium ile sınırsız.</Text>
				{user?.isPremium ? <Text style={{ color: "green", marginTop: 8 }}>Premium: Sınırsız</Text> : <Text style={{ color: "#666", marginTop: 8 }}>İzinli uygulamalar: {allowedApps.length}/3</Text>}
				{!user?.isPremium && (
					<PrimaryButton title="Premium'a Geç" onPress={() => { setPremium(true); Alert.alert("Bilgi", "Premium aktifleştirildi (simülasyon)."); }} />
				)}
			</Card>

			<Card style={{ marginTop: 12 }}>
				<Text style={{ fontWeight: "700" }}>İzinli Uygulamalar</Text>
				<FlatList data={allowedApps} keyExtractor={(i) => i} renderItem={({ item }) => (
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
						<Text>{item}</Text>
						<TouchableOpacity onPress={() => removeAllowed(item)}><Text style={{ color: "#ef4444" }}>Kaldır</Text></TouchableOpacity>
					</View>
				)} />
			</Card>

			<Card style={{ marginTop: 12 }}>
				<Text style={{ fontWeight: "700" }}>Engellenmiş Uygulamalar</Text>
				{blockedApps.map((b) => (
					<View key={b} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
						<Text>{b}</Text>
						<TouchableOpacity onPress={() => unbanApp(b)}><Text style={{ color: "#2563eb" }}>İzin Ver</Text></TouchableOpacity>
					</View>
				))}
			</Card>

			<Card style={{ marginTop: 12 }}>
				<Text style={{ fontWeight: "700" }}>Nasıl Çalışır?</Text>
				<Text style={{ marginTop: 8 }}>Odak modu simülasyonudur: odak başlarken belirlediğiniz uygulamalar izinli kabul edilir; engellenmiş uygulama açılmaya çalışılırsa simülasyon uyarısı gösterilir ve çiçek ilerlemesi azalır.</Text>
			</Card>

			<Card>
				<SectionTitle>AI Koç</SectionTitle>
				<TextField multiline placeholder="Bugünkü hedefimi yazın..." value={prompt} onChangeText={setPrompt} />
				<View style={{ marginTop: 12 }}>
					<PrimaryButton title="AI'dan Öneri Al" onPress={onGetAdvice} />
				</View>
				{/* quotaActive card if needed */}
				{/* result / tips rendering */}
			</Card>
		</SafeAreaView>
	);
}
