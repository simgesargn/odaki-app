import React, { useState } from "react";
import { SafeAreaView, View, Text, Switch, TextInput, Button, Alert } from "react-native";
import Card from "../components/Card";
import { auth } from "../firebase/firebase";
import { updatePassword } from "firebase/auth";

export default function SettingsScreen() {
	const [notifications, setNotifications] = useState(true);
	const [newPass, setNewPass] = useState("");
	const [changing, setChanging] = useState(false);

	async function onChangePassword() {
		if (!auth.currentUser) return Alert.alert("Giriş gerekli");
		if (newPass.length < 6) return Alert.alert("Parola en az 6 karakter olmalı");
		setChanging(true);
		try {
			await updatePassword(auth.currentUser, newPass);
			Alert.alert("Başarılı", "Parola değiştirildi.");
			setNewPass("");
		} catch (err: any) {
			console.error(err);
			Alert.alert("Hata", "Parola değiştirilemedi. Yeniden giriş gerekebilir.");
		} finally {
			setChanging(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: 16 }}>
			<Card>
				<Text style={{ fontWeight: "700" }}>Bildirim Ayarları</Text>
				<View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
					<Text>Bildirimler</Text>
					<Switch value={notifications} onValueChange={setNotifications} />
				</View>
			</Card>

			<Card style={{ marginTop: 12 }}>
				<Text style={{ fontWeight: "700" }}>Şifre Değiştir</Text>
				<TextInput placeholder="Yeni parola" value={newPass} onChangeText={setNewPass} secureTextEntry style={{ backgroundColor: "#fff", padding: 8, borderRadius: 8, marginTop: 8 }} />
				<Button title="Değiştir" onPress={onChangePassword} disabled={changing} />
			</Card>

			<Card style={{ marginTop: 12 }}>
				<Text style={{ fontWeight: "700" }}>Gizlilik Politikası</Text>
				<Text>Son güncelleme: 24 Aralık 2024</Text>
			</Card>
		</SafeAreaView>
	);
}
