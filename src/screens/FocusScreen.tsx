import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Button, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Routes } from "../navigation/routes";
import { useSession } from "../store/sessionStore";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import Pill from "../components/Pill";
import IconCircle from "../components/IconCircle";
import { spacing } from "../theme/spacing";

type Props = NativeStackScreenProps<any, any>;

const PRESETS_ALL = [15, 25, 45, 60];
const PRESETS_FREE = [15, 25];

function getStageLabel(minutes: number): string {
	if (minutes >= 120) return "Nadir Çiçek";
	if (minutes >= 60) return "Çiçek";
	if (minutes >= 45) return "Tomurcuk";
	if (minutes >= 25) return "Filiz";
	if (minutes >= 15) return "Tohum";
	return "Tohum";
}

export default function FocusScreen({ navigation }: Props) {
	const { userId, user, setPremium } = useSession();
	const [isPremiumLocal, setIsPremiumLocal] = useState<boolean | null>(null);
	const [selectedMinutes, setSelectedMinutes] = useState<number>(user?.isPremium ? 25 : 15);
	const [remainingSec, setRemainingSec] = useState<number>(selectedMinutes * 60);
	const [running, setRunning] = useState<boolean>(false);
	const intervalRef = useRef<number | null>(null);
	const [flowerCollection] = useState<Array<{ name: string; unlocked: boolean }>>([
		{ name: "Tohum", unlocked: true },
		{ name: "Filiz", unlocked: false },
		{ name: "Tomurcuk", unlocked: false },
		{ name: "Çiçek", unlocked: false },
		{ name: "Nadir Çiçek", unlocked: false },
	]);

	// izinli / engelli uygulama simülasyonu
	const [allowedApps, setAllowedApps] = useState<string[]>(["Takvim", "Spotify"]);
	const [blockedApps] = useState<string[]>(["YouTube", "Instagram", "TikTok"]);
	const [blockedModalApp, setBlockedModalApp] = useState<string | null>(null);
	const [flowerProgress, setFlowerProgress] = useState<number>(0);

	useEffect(() => setRemainingSec(selectedMinutes * 60), [selectedMinutes]);

	function startTick() {
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			setRemainingSec((prev) => {
				if (prev <= 1) {
					clearInterval(intervalRef.current as any);
					intervalRef.current = null;
					return 0;
				}
				return prev - 1;
			});
		}, 1000) as any;
	}

	function formatTime(totalSec: number) {
		const mm = Math.floor(totalSec / 60)
			.toString()
			.padStart(2, "0");
		const ss = Math.floor(totalSec % 60)
			.toString()
			.padStart(2, "0");
		return `${mm}:${ss}`;
	}

	function onStart() {
		if (running) return;
		setRunning(true);
		setRemainingSec(selectedMinutes * 60);
		startTick();
	}

	async function onFinish() {
		// only reward if timer finished
		if (remainingSec > 0) {
			// ask confirm to abandon session
			Alert.alert("Erken Bitir", "Oturumu erken bitirmek istiyor musunuz? Bu durumda çiçek kazanılmaz.", [
				{ text: "İptal", style: "cancel" },
				{
					text: "Erken Bitir",
					style: "destructive",
					onPress: async () => {
						// cancel without reward
						if (intervalRef.current) {
							clearInterval(intervalRef.current as any);
							intervalRef.current = null;
						}
						// optionally cancelFocusSession if sessionId exists
						try {
							setRunning(false);
							setRemainingSec(selectedMinutes * 60);
						} catch (e) {}
					},
				},
			]);
			return;
		}

		// remainingSec === 0 -> normal completion (award)
		try {
			const minutesPlanned = selectedMinutes;
			let earned = getStageLabel(minutesPlanned);
			if (earned === "Nadir Çiçek" && !user?.isPremium) {
				Alert.alert("Premium gerekli", "Nadir Çiçek yalnızca Premium kullanıcılar içindir. Çiçek verildi.");
				earned = "Çiçek";
			}
			setFlowerProgress((p) => Math.min(100, p + 25));
			Alert.alert("Tebrikler!", `${earned} kazandın 🌸`);
		} catch (err) {
			console.error("[FocusScreen][onFinish] Hata:", err);
			Alert.alert("Hata", "Oturum tamamlanamadı.");
		} finally {
			if (intervalRef.current) {
				clearInterval(intervalRef.current as any);
				intervalRef.current = null;
			}
			setRunning(false);
			setRemainingSec(selectedMinutes * 60);
		}
	}

	// simülasyon: engellenmiş uygulama açma denemesi
	function simulateOpenApp(appName: string) {
		if (!running) {
			Alert.alert("Bilgi", "Odak modundayken uygulamayı açmak için önce başlatın.");
			return;
		}
		if (allowedApps.includes(appName)) {
			Alert.alert("Açıldı", `${appName} açıldı (izinli).`);
			return;
		}
		// bloklandı: modal göster ve çiçek ilerlemesini azalt
		setBlockedModalApp(appName);
		setFlowerProgress((p) => Math.max(0, p - 10));
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: spacing.md, backgroundColor: "#f6f8fb" }}>
			{/* header */}
			<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
				<Text style={{ fontSize: 20, fontWeight: "800" }}>Odak & Çiçek Yetiştir</Text>
				<TouchableOpacity onPress={() => navigation.navigate(Routes.FocusSettings)}><Text>⚙️</Text></TouchableOpacity>
			</View>

			{/* büyük daire */}
			<View style={{ alignItems: "center", marginBottom: spacing.md }}>
				<IconCircle size={160}>🌱</IconCircle>
				<Text style={{ marginTop: 12, fontWeight: "700", fontSize: 18 }}>Tohum</Text>
			</View>

			{/* süre seçimi */}
			<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
				{(user?.isPremium ? [15, 25, 45, 60] : [15, 25]).map((m) => (
					<TouchableOpacity key={m} onPress={() => setSelectedMinutes(m)} style={{ flex: 1, marginHorizontal: 4 }}>
						<Pill label={`${m} dk`} active={selectedMinutes === m} onPress={() => setSelectedMinutes(m)} />
					</TouchableOpacity>
				))}
			</View>

			{/* premium card */}
			<Card style={{ marginBottom: spacing.md }}>
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<View>
						<Text style={{ fontWeight: "700" }}>Premium Çiçekler</Text>
						<Text style={{ color: "#666", marginTop: 6 }}>Daha nadir çiçekler için Premium'a geçin.</Text>
					</View>
					{user?.isPremium ? <Text style={{ color: "green", fontWeight: "700" }}>Aktif</Text> : <PrimaryButton title="Premium'a Geç" onPress={() => { setPremium(true); }} />}
				</View>
			</Card>

			<Card style={{ marginBottom: spacing.md }}>
				<Text style={{ fontWeight: "700" }}>Bilgi</Text>
				<Text style={{ marginTop: 8 }}>Bu özellik gerçek sistem engellemesi değildir, simülasyondur.</Text>
			</Card>

			{/* sayaç ve başlat */}
			<View style={{ alignItems: "center", marginBottom: spacing.md }}>
				<Text style={{ fontSize: 34, fontWeight: "800" }}>{formatTime(remainingSec)}</Text>
				<View style={{ flexDirection: "row", marginTop: 12 }}>
					<PrimaryButton title={running ? "Bitir" : "Çiçeği Büyütmeye Başla"} onPress={running ? onFinish : onStart} />
				</View>
			</View>

			{/* sayaçlar ve çiçek koleksiyonu */}
			<Card style={{ marginBottom: spacing.md }}>
				<Text style={{ fontWeight: "700", marginBottom: 8 }}>İstatistik</Text>
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<View><Text style={{ color: "#666" }}>Toplam dk</Text><Text style={{ fontWeight: "700" }}>{user?.totalFocusMinutes ?? 0}</Text></View>
					<View><Text style={{ color: "#666" }}>Seri</Text><Text style={{ fontWeight: "700" }}>{user?.streak ?? 0}</Text></View>
					<View><Text style={{ color: "#666" }}>Çiçek</Text><Text style={{ fontWeight: "700" }}>{Math.round(flowerProgress / 25)}</Text></View>
				</View>
			</Card>

			<Text style={{ fontWeight: "700", marginBottom: 8 }}>Çiçek Koleksiyonum</Text>
			<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
				{flowerCollection.map((f, idx) => (
					<View key={f.name} style={{ width: "30%", marginBottom: 12, alignItems: "center" }}>
						<Card style={{ alignItems: "center", padding: 12, opacity: f.unlocked ? 1 : 0.5 }}>
							<Text style={{ fontSize: 28 }}>{f.unlocked ? "🌸" : "🔒"}</Text>
							<Text style={{ marginTop: 8, fontWeight: "700" }}>{f.name}</Text>
						</Card>
					</View>
				))}
			</View>

			{/* engellenmiş uygulama simülasyonu: butonlarla test */}
			<Card style={{ marginTop: spacing.md }}>
				<Text style={{ fontWeight: "700", marginBottom: 8 }}>Uygulama Simülasyonu</Text>
				<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
					{["YouTube", "Instagram", "Spotify", "Takvim"].map((a) => (
						<TouchableOpacity key={a} onPress={() => simulateOpenApp(a)} style={{ padding: 8, borderRadius: 8, backgroundColor: "#fff", marginRight: 8, marginBottom: 8 }}>
							<Text>{a}</Text>
						</TouchableOpacity>
					))}
				</View>
				<Text style={{ color: "#666", marginTop: 8 }}>Engellenmiş uygulamayı açmak çiçeği küçültür (simülasyon).</Text>
			</Card>

			{/* blocked modal */}
			<Modal visible={!!blockedModalApp} transparent animationType="fade">
				<View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
					<View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 16 }}>
						<Text style={{ fontWeight: "700", marginBottom: 8 }}>Uyarı</Text>
						<Text>{blockedModalApp} şu an engellenmiş durumda. Odak modunu bozmak isterseniz iptal edin.</Text>
						<View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
							<TouchableOpacity onPress={() => setBlockedModalApp(null)} style={{ marginRight: 8 }}><Text>Tamam</Text></TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}
