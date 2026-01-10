import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useOnboardingState } from "../../store/onboardingStore";
import { ONBOARDING_PAGES } from "../../constants/onboardingFeatures";
import { getSafeGradient } from "../../utils/getSafeGradient";
import { colors } from "../../theme/colors";

export default function OnboardingScreen({ initialPage = 0 }: { initialPage?: number }) {
	const pages = Array.isArray(ONBOARDING_PAGES) ? ONBOARDING_PAGES : [];
	const startPage = Math.max(0, Math.min(initialPage, pages.length - 1));
	const [page, setPage] = useState(startPage);
	const { setOnboardingDone } = useOnboardingState();

	useEffect(() => {
		console.log("[Onboarding] show page", startPage);
	}, [startPage]);

	async function finish() {
		try {
			await setOnboardingDone(true);
		} catch (e) {
			console.warn("[Onboarding] setOnboardingDone hata:", e);
		}
	}

	function next() {
		if (page < pages.length - 1) setPage((p) => p + 1);
		else finish();
	}

	function skip() {
		finish();
	}

	return (
		<LinearGradient colors={getSafeGradient(colors.gradient.main)} style={styles.container}>
			<SafeAreaView style={styles.safe}>
				<TouchableOpacity style={styles.skip} onPress={skip}>
					<Text style={{ color: "#fff" }}>Atla</Text>
				</TouchableOpacity>

				<View style={styles.content}>
					<View style={styles.circle}><Text style={{ fontSize: 48 }}>{pages[page]?.emoji ?? "✨"}</Text></View>
					<Text style={styles.title}>{pages[page]?.title ?? ""}</Text>
					<Text style={styles.desc}>{pages[page]?.desc ?? ""}</Text>
				</View>

				<View style={styles.footer}>
					<View style={styles.dots}>
						{pages.map((_, i) => (
							<View key={i} style={[styles.dot, page === i && styles.dotActive]} />
						))}
					</View>

					<TouchableOpacity style={styles.nextBtn} onPress={next}>
						<Text style={{ color: "#fff", fontWeight: "700" }}>{page === pages.length - 1 ? "Başla" : "Devam"}</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safe: { flex: 1, padding: 20 },
	skip: { alignSelf: "flex-end" },
	content: { flex: 1, alignItems: "center", justifyContent: "center" },
	circle: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#fff", marginBottom: 20, alignItems: "center", justifyContent: "center" },
	title: { fontSize: 24, fontWeight: "800", color: "#fff", textAlign: "center" },
	desc: { marginTop: 12, fontSize: 14, color: "rgba(255,255,255,0.95)", textAlign: "center", paddingHorizontal: 20 },
	footer: { paddingBottom: 24, alignItems: "center" },
	dots: { flexDirection: "row", marginBottom: 12 },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.4)", margin: 6 },
	dotActive: { backgroundColor: "#fff" },
	nextBtn: { backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
});
