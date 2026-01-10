import React, { useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import { useSession } from "../store/sessionStore";

export default function PremiumScreen() {
	const { user, setPremium } = useSession();
	const [loading, setLoading] = useState(false);
	const isPremium = Boolean(user?.isPremium);

	async function onToggle() {
		if (!user) return;
		setLoading(true);
		try {
			await setPremium(!isPremium);
			Alert.alert("Bilgi", isPremium ? "Premium kapatıldı." : "Premium aktifleştirildi.");
		} catch (err) {
			Alert.alert("Hata", "Premium güncellenemedi.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>Premium</Text>
			<View style={{ marginBottom: 12 }}>
				<Text>Avantajlar:</Text>
				<Text>- Daha uzun süreli premium çiçekler</Text>
				<Text>- AI günlük limitinin kaldırılması</Text>
				<Text>- Ek özellikler (gelecekte)</Text>
			</View>

			<Button title={isPremium ? "Premium'u Kapat" : "Premium'u Aktifleştir"} onPress={onToggle} disabled={loading} />

			<View style={{ marginTop: 12 }}>
				<Text style={{ color: "#666" }}>Bu ödev kapsamında ödeme simülasyonu yoktur.</Text>
			</View>
		</View>
	);
}
