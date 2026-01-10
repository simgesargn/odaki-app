import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../../services/authService";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Routes } from "../../navigation/routes";

type Props = NativeStackScreenProps<any, any>;

function mapRegisterError(errMsg?: string) {
	if (!errMsg) return "Kayıt başarısız.";
	if (errMsg.includes("auth/email-already-in-use")) return "Bu e‑posta zaten kullanımda.";
	if (errMsg.includes("auth/weak-password")) return "Parola en az 6 karakter olmalıdır.";
	return errMsg;
}

const usernameValid = (s: string) => /^[a-zA-Z0-9_]{3,}$/.test(s);

export default function RegisterScreen({ navigation }: Props) {
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function onRegister() {
		if (!name.trim()) return Alert.alert("Geçersiz", "Ad Soyad gerekli.");
		if (!usernameValid(username)) return Alert.alert("Geçersiz", "Kullanıcı adı en az 3 karakter, harf/rakam veya altçizgi içermelidir.");
		if (!email.includes("@")) return Alert.alert("Geçersiz", "Geçerli bir e‑posta girin.");
		if (password.length < 6) return Alert.alert("Geçersiz", "Parola en az 6 karakter olmalıdır.");

		setLoading(true);
		try {
			const res = await signUp(email.trim(), password);
			if (!res.ok) {
				Alert.alert("Kayıt hatası", mapRegisterError(res.error));
				return;
			}
			const uid = res.user.user.uid;
			try {
				await setDoc(doc(db, "users", uid), {
					fullName: name.trim(),
					username: username.trim(),
					email: email.trim(),
					createdAt: serverTimestamp(),
					isPremium: false
				}, { merge: true });
			} catch (e) {
				console.warn("[Register] users doc yazılamadı:", e);
			}
			Alert.alert("Kayıt başarılı", "Giriş yapabilirsiniz.");
			navigation.navigate(Routes.Login, { demoEmail: email.trim() });
		} catch (err) {
			Alert.alert("Hata", "Kayıt sırasında hata oluştu.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: 20 }}>
			<View style={{ flex: 1, justifyContent: "center" }}>
				<Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Hesap Oluştur</Text>
				<TextInput placeholder="Ad Soyad" value={name} onChangeText={setName} style={styles.input} />
				<TextInput placeholder="Kullanıcı Adı" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
				<TextInput placeholder="E‑posta" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
				<TextInput placeholder="Parola (min 6)" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
				<TouchableOpacity style={styles.btn} onPress={onRegister} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Kayıt Ol</Text>}
				</TouchableOpacity>
			</View>
			<View style={{ alignItems: "center", padding: 12 }}>
				<TouchableOpacity onPress={() => navigation.navigate(Routes.Login)}><Text style={{ color: "#2563eb" }}>Zaten hesabın var mı? Giriş Yap</Text></TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate(Routes.Terms)} style={{ marginTop: 8 }}><Text>Kullanım Koşulları</Text></TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate(Routes.Privacy)}><Text>Gizlilik Politikası</Text></TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: "#eee" },
	btn: { marginTop: 14, backgroundColor: "#2563eb", padding: 12, borderRadius: 10, alignItems: "center" },
});
