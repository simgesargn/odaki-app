import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import { PrimaryButton } from "../components/Button";
import { sendPrompt, fallbackResponses } from "../services/aiService";
import { getSafeGradient } from "../utils/getSafeGradient";
import { colors } from "../theme/colors";
import GradientHeader from "../components/GradientHeader";
import { rootNavigate } from "../navigation/navigationRef";
import { Routes } from "../navigation/routes";
import { spacing } from "../theme/spacing";

type MessageType = { id: string; text: string; role: "user" | "ai" };

export default function AIScreen() {
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [quick, setQuick] = useState<string[]>([]);
	const [input, setInput] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [blocked, setBlocked] = useState<{ reason: "quota" | "provider"; message: string } | null>(null);

	useEffect(() => {
		setQuick(["Nasıl odaklanırım?", "Kısa rehber", "Hızlı ipuçları"]);
	}, []);

	async function onSend() {
		const text = (input || "").trim();
		if (!text) return;
		if (blocked) return;
		const userId = ""; 
		const userIdExists = Boolean(userId);
		setLoading(true);
		setInput("");
		setMessages((m) => [...(Array.isArray(m) ? m : []), { id: `u_${Date.now()}`, text, role: "user" }]);
		try {
			const res = await sendPrompt(userIdExists ? userId : "anonymous", text);
			if (res.provider === "fallback" && res.error === "QUOTA_EXCEEDED") {
				setBlocked({ reason: "quota", message: "AI kotanız doldu. Lütfen bir süre sonra tekrar deneyin." });
				setMessages((m) => [...(Array.isArray(m) ? m : []), { id: `ai_fb_${Date.now()}`, text: res.response || "AI şu anda kullanılamıyor", role: "ai" }]);
				return;
			}
			if (res.provider === "fallback" && res.error === "NO_API_KEY") {
				setBlocked({ reason: "provider", message: "AI anahtarı yapılandırılmamış. Ayarlardan ekleyin." });
				setMessages((m) => [...(Array.isArray(m) ? m : []), { id: `ai_fb_${Date.now()}`, text: res.response || "AI şu anda kullanılamıyor", role: "ai" }]);
				return;
			}
			const parts = (typeof res.response === "string" ? res.response.split(/\r?\n\r?\n/) : []);
			const safeParts = Array.isArray(parts) && parts.length ? parts : [res.response || "AI şu anda kullanılamıyor"];
			const aiMsgs = safeParts.map((t, i) => ({ id: `ai_${Date.now()}_${i}`, text: t, role: "ai" } as MessageType));
			setMessages((m) => [...(Array.isArray(m) ? m : []), ...aiMsgs]);
		} catch (err) {
			console.warn("[AIScreen][onSend] err", err);
			const aiMsgs = fallbackResponses.map((t, i) => ({ id: `ai_fb_${Date.now()}_${i}`, text: t, role: "ai" }));
			setMessages((m) => [...(Array.isArray(m) ? m : []), ...aiMsgs]);
		} finally {
			setLoading(false);
		}
	}

	function renderItem({ item }: { item: MessageType }) {
		return (
			<View style={[styles.msgRow, item.role === "ai" ? styles.aiMsg : styles.userMsg]}>
				<Text style={styles.msgText}>{item.text}</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
			<GradientHeader title="AI Asistan" gradientColors={getSafeGradient(colors.gradient.ai)} />
			<View style={{ flex: 1, padding: spacing.md }}>
				{/* Blok kart (quota / provider) — replaced with styled info card */}
				{blocked ? (
					<View style={{ marginBottom: spacing.md }}>
						<View style={[styles.infoCard]}>
							{/* Icon */}
							<View style={styles.iconWrap}>
								<View style={[
									styles.iconCircle,
									{ backgroundColor: blocked.reason === "quota" ? "#FEF3F2" : colors.mutedSurface }
								]}>
									<Text style={styles.iconText}>{blocked.reason === "quota" ? "⛔" : "⚠️"}</Text>
								</View>
							</View>

							{/* Body */}
							<View style={styles.infoBody}>
								<Text style={[{ fontWeight: "800", color: colors.text }]}>
									{blocked.reason === "quota" ? "Kota Aşıldı" : "AI Kullanılamıyor"}
								</Text>
								<Text style={{ color: colors.textMuted, marginTop: 8 }}>{blocked.message}</Text>
							</View>

							{/* Actions */}
							<View style={styles.infoActions}>
								{blocked.reason === "provider" ? (
									<TouchableOpacity onPress={() => rootNavigate(Routes.ProfileSettings)}>
										<View style={styles.actionBtn}>
											<Text style={{ color: colors.primary }}>Ayarlar</Text>
										</View>
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => setBlocked(null)}>
										<View style={styles.actionBtn}>
											<Text style={{ color: colors.primary }}>Tamam</Text>
										</View>
									</TouchableOpacity>
								)}
							</View>
						</View>
					</View>
				) : null}

				{loading && <ActivityIndicator style={{ marginVertical: 8 }} />}

				{Array.isArray(messages) && messages.length > 0 ? (
					<FlatList data={messages} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} />
				) : (
					<Card style={{ marginBottom: 12 }}>
						<Text style={{ fontWeight: "700" }}>Henüz sohbet yok</Text>
						<Text style={{ marginTop: 8, color: colors.textMuted }}>Sorularınızı yazın veya hızlı ipuçlarından seçin.</Text>
					</Card>
				)}

				<View style={{ marginVertical: 12, flexDirection: "row", flexWrap: "wrap" }}>
					{(Array.isArray(quick) ? quick : []).map((q) => (
						<TouchableOpacity key={q} onPress={() => setInput(q)} style={styles.quickPill}>
							<Text>{q}</Text>
						</TouchableOpacity>
					))}
				</View>

				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<TextInput value={input} onChangeText={setInput} placeholder="Sorunuzu yazın..." style={styles.input} editable={!blocked && !loading} />
					<PrimaryButton title="Gönder" onPress={onSend} style={{ opacity: blocked || loading ? 0.6 : 1 }} />
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	msgRow: { padding: 12, borderRadius: 12, marginBottom: 8 },
	aiMsg: { backgroundColor: "#f1f5f9", alignSelf: "flex-start" },
	userMsg: { backgroundColor: "#dbeafe", alignSelf: "flex-end" },
	msgText: { color: "#111827" },
	quickPill: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
	input: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: "#eee" },
	// added styles for AI info card:
	infoCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surface,
		borderRadius: 12,
		padding: spacing.md,
		// apply card shadow token if available
		...((colors as any).cardShadow || {}),
		borderWidth: 1,
		borderColor: colors.border,
	},
	iconWrap: {
		marginRight: spacing.md,
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: { fontSize: 20 },
	infoBody: { flex: 1 },
	infoActions: { marginLeft: 12, alignItems: "flex-end" },
	actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "transparent" },
});
