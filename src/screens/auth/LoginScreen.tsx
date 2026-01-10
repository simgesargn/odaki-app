import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Routes } from "../../navigation/routes";

type Props = NativeStackScreenProps<any, any>;

function mapAuthError(errMsg?: string) {
	if (!errMsg) return "Giriş başarısız.";
	if (errMsg.includes("auth/user-not-found")) return "Bu e‑posta ile kayıtlı kullanıcı bulunamadı.";
	if (errMsg.includes("auth/wrong-password")) return "Parola hatalı.";
	if (errMsg.includes("auth/too-many-requests")) return "Çok fazla başarısız giriş denemesi. Biraz bekleyin.";
	if (errMsg.includes("email")) return errMsg;
	return errMsg;
}

export default function LoginScreen({ navigation, route }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [show, setShow] = useState(false);

	useEffect(() => {
		// demo email gelebilir
		const demo = route.params?.demoEmail;
		if (demo) setEmail(String(demo));
	}, [route.params]);

	async function onLogin() {
		if (!email?.trim() || !password) {
			Alert.alert("Eksik alan", "E‑posta ve parola gerekli.");
			return;
		}
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email.trim(), password);
			// onAuthStateChanged yönlendirecek
		} catch (e) {
			console.warn("[Login] hata", e);
			Alert.alert("Hata", "Giriş sırasında hata oluştu.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: 20 }}>
			<View style={{ flex: 1, justifyContent: "center" }}>
				<Text style={{ fontSize: 26, fontWeight: "800", marginBottom: 12 }}>Hoş Geldin! 👋</Text>
				<Text style={{ marginBottom: 8, color: "#666" }}>Devam etmek için giriş yap</Text>

				<TextInput placeholder="E‑posta" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<TextInput placeholder="Parola" value={password} onChangeText={setPassword} secureTextEntry={!show} style={[styles.input, { flex: 1 }]} />
					<TouchableOpacity onPress={() => setShow((s) => !s)} style={{ marginLeft: 8 }}>
						<Text style={{ color: "#2563eb" }}>{show ? "Gizle" : "Göster"}</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity onPress={() => navigation.navigate(Routes.Forgot)}><Text style={{ color: "#2563eb", marginTop: 8 }}>Şifremi Unuttum?</Text></TouchableOpacity>

				<TouchableOpacity style={styles.btn} onPress={onLogin} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Giriş Yap</Text>}
				</TouchableOpacity>

				<View style={{ marginTop: 16, alignItems: "center" }}>
					<Text style={{ color: "#888", marginBottom: 8 }}>veya</Text>
					<TouchableOpacity style={styles.social} onPress={() => navigation.navigate(Routes.SocialSim, { provider: "google" })}>
						<Text>Google ile Devam Et</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.social} onPress={() => navigation.navigate(Routes.SocialSim, { provider: "facebook" })}>
						<Text>Facebook ile Devam Et</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={{ alignItems: "center", padding: 12 }}>
				<TouchableOpacity onPress={() => navigation.navigate(Routes.Register)}><Text style={{ color: "#2563eb" }}>Hesabın yok mu? Kayıt Ol</Text></TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: "#eee" },
	btn: { marginTop: 14, backgroundColor: "#2563eb", padding: 12, borderRadius: 10, alignItems: "center" },
	social: { marginTop: 10, backgroundColor: "#fff", padding: 10, borderRadius: 8, width: "80%", alignItems: "center", marginBottom: 6 },
});
