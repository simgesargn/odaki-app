import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
	return (
		<LinearGradient colors={["#8b5cf6", "#ff8fb1"]} style={styles.container}>
			<SafeAreaView style={styles.safe}>
				<View style={styles.center}>
					<View style={styles.logoPlaceholder} />
					<Text style={styles.title}>ODAKI</Text>
					<Text style={styles.subtitle}>Odaklan. Planla. Büyüt.</Text>
					<Text style={styles.loading}>Yükleniyor…</Text>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safe: { flex: 1 },
	center: { flex: 1, alignItems: "center", justifyContent: "center" },
	logoPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 20 },
	title: { fontSize: 40, fontWeight: "800", color: "#fff" },
	subtitle: { marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.9)" },
	loading: { marginTop: 20, color: "rgba(255,255,255,0.8)" },
});
