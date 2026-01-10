import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTask, updateTask, deleteTask } from "../../services/firestoreService";
import { useSession } from "../../store/sessionStore";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";

export default function TaskDetailScreen({ route, navigation }: any) {
	const { taskId } = route.params || {};
	const { userId } = useSession();
	const [task, setTask] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	async function load() {
		if (!taskId) return;
		setLoading(true);
		const t = await getTask(taskId);
		setTask(t);
		setLoading(false);
	}

	useEffect(() => { load(); }, [taskId]);

	function priorityColor(p: string) {
		if (p === "high") return ["#ff7a7a", "#ef4444"];
		if (p === "medium") return ["#ffd89b", "#f59e0b"];
		return ["#c7f9d2", "#34d399"];
	}

	async function onDelete() {
		if (!userId || !taskId) return;
		try {
			await deleteTask(userId, taskId);
			Alert.alert("Silindi");
			navigation.goBack();
		} catch (err) {
			Alert.alert("Hata", "Silme başarısız.");
		}
	}

	async function onToggleComplete() {
		if (!task) return;
		try {
			await updateTask(task.id, { status: task.status === "completed" ? "active" : "completed" });
			await load();
		} catch {
			Alert.alert("Hata", "Güncelleme başarısız.");
		}
	}

	if (loading) return <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></SafeAreaView>;

	if (!task) return <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>Görev bulunamadı</Text></SafeAreaView>;

	const colors = priorityColor(task.priority);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={{ height: 140, backgroundColor: colors[0], alignItems: "center", justifyContent: "center" }}>
				<Text style={{ fontSize: 20, fontWeight: "800" }}>{task.title}</Text>
			</View>

			<View style={{ padding: 16 }}>
				<Card>
					<Text style={{ fontWeight: "700" }}>Açıklama</Text>
					<Text style={{ marginTop: 8 }}>{task.desc ?? "Yok"}</Text>
				</Card>

				<Card style={{ marginTop: 12 }}>
					<Text>Öncelik: {task.priority}</Text>
					<Text>Kategori: {task.category}</Text>
					<Text>Tarih: {task.date ?? "-" } {task.time ?? ""}</Text>
					<Text>Durum: {task.status}</Text>
				</Card>

				<View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
					<PrimaryButton title={task.status === "completed" ? "Tamamlamayı Geri Al" : "Görevi Tamamla"} onPress={onToggleComplete} />
					<PrimaryButton title="Sil" onPress={() => { Alert.alert("Sil", "Silmek istediğinize emin misiniz?", [{ text: "İptal" }, { text: "Sil", style: "destructive", onPress: onDelete }]); }} />
				</View>
			</View>
		</SafeAreaView>
	);
}
