import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "../../services/authService";

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	async function onReset() {
		if (!email.trim()) {
			Alert.alert("Uyarı", "Lütfen e-posta girin.");
			return;
		}
		setLoading(true);
		try {
			const res = await resetPassword(email.trim());
			if (!res.ok) {
				Alert.alert("Hata", res.error);
				return;
			}
			Alert.alert("Başarılı", "Şifre sıfırlama maili gönderildi.");
		} catch (e) {
			Alert.alert("Hata", "İşlem başarısız.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: 20 }}>
			<View style={{ flex: 1, justifyContent: "center" }}>
				<TextInput placeholder="E-posta" value={email} onChangeText={setEmail} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10 }} keyboardType="email-address" autoCapitalize="none" />
				<TouchableOpacity style={{ marginTop: 12, backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center" }} onPress={onReset} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Sıfırlama Maili Gönder</Text>}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
