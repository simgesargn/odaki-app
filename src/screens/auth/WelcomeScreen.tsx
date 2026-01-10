import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Routes } from "../../navigation/routes";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any, any>;

export default function WelcomeScreen({ navigation }: Props) {
	return (
		<LinearGradient colors={["#8b5cf6", "#7cc1ff"]} style={styles.container}>
			<SafeAreaView style={styles.safe}>
				<View style={styles.center}>
					<Text style={styles.hi}>Hoş Geldin! 👋</Text>
					<TouchableOpacity style={styles.primary} onPress={() => navigation.navigate(Routes.Login)}><Text style={styles.primaryText}>Giriş Yap</Text></TouchableOpacity>
					<View style={styles.row}>
						<TouchableOpacity style={styles.social} onPress={() => navigation.navigate(Routes.SocialSim, { provider: "google" })}><Text>Google ile Devam Et</Text></TouchableOpacity>
						<TouchableOpacity style={styles.social} onPress={() => navigation.navigate(Routes.SocialSim, { provider: "facebook" })}><Text>Facebook ile Devam Et</Text></TouchableOpacity>
					</View>
					<TouchableOpacity onPress={() => navigation.navigate(Routes.Register)}><Text style={{ color: "#fff", marginTop: 12 }}>Hesap oluştur</Text></TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	safe: { flex: 1 },
	center: { flex: 1, alignItems: "center", justifyContent: "center" },
	hi: { fontSize: 28, color: "#fff", fontWeight: "800", marginBottom: 20 },
	primary: { backgroundColor: "#2563eb", paddingHorizontal: 36, paddingVertical: 12, borderRadius: 24 },
	primaryText: { color: "#fff", fontWeight: "700" },
	row: { marginTop: 18, width: "100%", alignItems: "center" },
	social: { backgroundColor: "#fff", padding: 10, borderRadius: 8, width: "80%", alignItems: "center", marginTop: 10 },
});
