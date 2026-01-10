import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tasksStore from "../../store/tasksStore";
import achievementsStore from "../../store/achievementsStore";
import friendsStore from "../../store/friendsStore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { auth } from "../../firebase/firebase";

export default function DevQAScreen() {
	const nav = useNavigation();

	async function resetOnboarding() {
		try {
			// set onboarding false via onboardingStore dynamic import
			const { useOnboardingState } = await import("../../store/onboardingStore");
			// call setOnboardingDone(false) via hook not possible here; instead write flag directly to AsyncStorage
			const AsyncStorage = await import("@react-native-async-storage/async-storage");
			await AsyncStorage.default.setItem("odaki_onboarding_done", "false");
			Alert.alert("Tamam", "Onboarding sıfırlandı. Uygulamayı yeniden başlatın veya logout yapın.");
		} catch (e) {
			Alert.alert("Hata", "Sıfırlama başarısız.");
		}
	}

	async function logout() {
		try {
			await auth.signOut();
			Alert.alert("Çıkış yapıldı");
		} catch (e) {
			Alert.alert("Hata", "Çıkış başarısız.");
		}
	}

	async function seedTasks() {
		await tasksStore.addTask({ title: "Demo Görev 1", desc: "Deneme", category: "İş", priority: "high" }, "local");
		await tasksStore.addTask({ title: "Demo Görev 2", desc: "Deneme", category: "Kişisel", priority: "medium" }, "local");
		Alert.alert("Tamam", "Demo görevler eklendi.");
	}

	async function seedAchievements() {
		await achievementsStore.seedDemo();
		Alert.alert("Tamam", "Demo başarılar eklendi.");
	}

	async function seedFriends() {
		await friendsStore.seedDemo();
		Alert.alert("Tamam", "Demo arkadaşlar eklendi.");
	}

	return (
		<SafeAreaView style={{ flex: 1, padding: 16 }}>
			<Text style={{ fontWeight: "800", fontSize: 18, marginBottom: 12 }}>Dev QA</Text>

			<TouchableOpacity onPress={resetOnboarding} style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}><Text>Reset onboarding</Text></TouchableOpacity>
			<TouchableOpacity onPress={logout} style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}><Text>Logout</Text></TouchableOpacity>
			<TouchableOpacity onPress={seedTasks} style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}><Text>Seed demo tasks</Text></TouchableOpacity>
			<TouchableOpacity onPress={seedAchievements} style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}><Text>Seed demo achievements</Text></TouchableOpacity>
			<TouchableOpacity onPress={seedFriends} style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}><Text>Seed demo friends</Text></TouchableOpacity>
		</SafeAreaView>
	);
}
