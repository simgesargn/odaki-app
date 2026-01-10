import React, { useEffect, useState } from "react";
import { View, Text, Button, Modal, Alert, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { tryPickImage } from "../services/optionalExpo";
import { useSession } from "../store/sessionStore";
import { Routes } from "../navigation/routes";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

export default function ProfileScreen({ navigation }: any) {
	const { userId, user, loading, setPremium, setOnboardingDone } = useSession();
	const [avatarUri, setAvatarUri] = useState<string | null>(null);
	const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
	const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		if (user?.avatar) setAvatarUri(user.avatar);
		else setAvatarUri(null);
		if (user?.avatarEmoji) setAvatarEmoji(user.avatarEmoji);
	}, [user]);

	async function pickImageFromGallery() {
		if (!user?.isPremium) {
			Alert.alert("Premium gerekli", "Gerçek fotoğraf yükleme özelliği premium sürümde!");
			return;
		}
		setUploading(true);
		const res = await tryPickImage();
		setUploading(false);
		if (!res) {
			Alert.alert("Özellik yok", "Bu derlemede galeri yükleme devre dışı.");
			return;
		}
		if (res.cancelled) return;
		if (res.uri) {
			try {
				if (userId) {
					await setDoc(doc(db, "users", userId), { avatar: res.uri, avatarEmoji: null }, { merge: true });
					setAvatarUri(res.uri);
					setAvatarEmoji(null);
				}
			} catch (e) {
				console.warn("Avatar kaydedilemedi", e);
				Alert.alert("Hata", "Fotoğraf kaydedilemedi.");
			}
		}
	}

	async function pickEmoji(e: string) {
		setEmojiPickerVisible(false);
		setAvatarEmoji(e);
		setAvatarUri(null);
		try {
			if (userId) {
				await setDoc(doc(db, "users", userId), { avatarEmoji: e, avatar: null }, { merge: true });
			}
		} catch (err) {
			console.warn("[Profile][pickEmoji] Hata:", err);
			Alert.alert("Hata", "Emoji kaydedilemedi.");
		}
	}

	async function resetOnboarding() {
		try {
			await setOnboardingDone(false);
			Alert.alert("Bilgi", "Onboarding sıfırlandı.");
		} catch {
			Alert.alert("Hata", "Sıfırlama başarısız.");
		}
	}

	if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>Yükleniyor...</Text></View>;

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient colors={["#8b5cf6", "#7cc1ff"]} style={{ padding: 20 }}>
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<TouchableOpacity onPress={() => { /* hamburger placeholder */ }}><Text style={{ color: "#fff" }}>☰</Text></TouchableOpacity>

					<TouchableOpacity onPress={() => setEmojiPickerVisible(true)} style={{ alignItems: "center" }}>
						{avatarUri ? (
							<Image source={{ uri: avatarUri }} style={styles.avatarImage} />
						) : avatarEmoji ? (
							<Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
						) : (
							<Text style={styles.avatarEmoji}>🧑‍🌾</Text>
						)}
						<Text style={{ color: "#fff", fontWeight: "800", marginTop: 8 }}>{user?.fullName ?? user?.email ?? "Kullanıcı"}</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => navigation.navigate(Routes.Settings)}><Text style={{ color: "#fff" }}>⚙️</Text></TouchableOpacity>
				</View>
			</LinearGradient>

			<View style={{ padding: 16 }}>
				<Card>
					<Text style={{ fontWeight: "700" }}>Günlük Seri</Text>
					<Text style={{ marginTop: 8 }}>{user?.streak ?? 0} gün</Text>
				</Card>

				<View style={{ marginTop: 12 }}>
					<PrimaryButton title="Bahçem" onPress={() => navigation.navigate(Routes.ProfileGarden)} />
					<PrimaryButton title="Başarılar" onPress={() => navigation.navigate(Routes.ProfileAchievements)} />
					<PrimaryButton title="Arkadaşlar" onPress={() => navigation.navigate(Routes.ProfileFriends)} />
				</View>

				<View style={{ marginTop: 12 }}>
					{user?.isPremium ? (
						<Button title={uploading ? "Yükleniyor..." : "Galeriden Fotoğraf Yükle"} onPress={pickImageFromGallery} disabled={uploading} />
					) : (
						<Text style={{ color: "#666", marginBottom: 8 }}>Gerçek fotoğraf yükleme özelliği premium sürümde!</Text>
					)}
					<Button title="Emoji seç" onPress={() => setEmojiPickerVisible(true)} />
				</View>

				<View style={{ marginTop: 12 }}>
					<Text>Hızlı bilgiler</Text>
					<Text>İstatistikler: {user?.totalFocusMinutes ?? 0} dk</Text>
					<Text>Arkadaşlar: -</Text>
					<Text>Üye olma tarihi: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</Text>
					<Button title="Çıkış Yap" onPress={async () => { try { await auth.signOut(); } catch { Alert.alert("Hata", "Çıkış başarısız"); } }} />
					<Button title="Onboarding'i Sıfırla" onPress={resetOnboarding} />
					<Button title={user?.isPremium ? "Premium Aktif" : "Premium'a Geç"} onPress={() => setPremium(true)} />
				</View>
			</View>

			<Modal visible={emojiPickerVisible} transparent animationType="slide">
				<View style={modalStyles.overlay}>
					<View style={modalStyles.sheet}>
						<Text style={{ fontWeight: "700", fontSize: 16 }}>Profil Fotoğrafı Seç</Text>
						<View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
							{["🧑‍🌾","🌱","🌸","🌻","🌷","🌹","🪴","🦋","🌟"].map((e) => (
								<TouchableOpacity key={e} onPress={() => pickEmoji(e)} style={{ padding: 8, margin: 6 }}>
									<Text style={{ fontSize: 28 }}>{e}</Text>
								</TouchableOpacity>
							))}
						</View>

						{user?.isPremium ? (
							<TouchableOpacity onPress={pickImageFromGallery} style={{ marginTop: 12 }}>
								<Text style={{ color: "#2563eb" }}>Galeriden Fotoğraf Seç</Text>
							</TouchableOpacity>
						) : (
							<Text style={{ marginTop: 12, color: "#666" }}>Gerçek fotoğraf yükleme özelliği premium sürümde!</Text>
						)}

						<TouchableOpacity onPress={() => setEmojiPickerVisible(false)} style={{ marginTop: 16 }}>
							<Text style={{ color: "#999" }}>Kapat</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	avatarImage: { width: 80, height: 80, borderRadius: 40 },
	avatarEmoji: { fontSize: 48 },
});

const modalStyles = StyleSheet.create({
	overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
	sheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
});
