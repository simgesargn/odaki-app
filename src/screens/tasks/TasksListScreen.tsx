import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import Pill from "../../components/Pill";
import tasksStore from "../../store/tasksStore";
import { Routes } from "../../navigation/routes";
import { useFocusEffect } from "@react-navigation/native";
import { ActionButton } from "../../components/ActionButton";
import DecorativeBackground from "../../components/DecorativeBackground";

export default function TasksListScreen({ navigation }: any) {
	const [tasks, setTasks] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "active" | "done">("all");

	async function load() {
		setLoading(true);
		try {
			const list = await tasksStore.getTasks("local");
			setTasks(list || []);
		} catch (err) {
			console.error("[TasksList] load", err);
			Alert.alert("Hata", "Görevler yüklenemedi.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		const unsub = tasksStore.subscribe(() => load());
		return () => unsub();
	}, []);

	// reload on screen focus (after creating a task or returning)
	useFocusEffect(
		useCallback(() => {
			load();
		}, [])
	);

	const stats = useMemo(() => {
		const total = tasks.length;
		const done = tasks.filter((t) => t.status === "completed").length;
		const active = total - done;
		return { total, done, active };
	}, [tasks]);

	const filtered = tasks.filter((t) => (filter === "all" ? true : filter === "active" ? t.status !== "completed" : t.status === "completed"));

	async function onDelete(id: string) {
		try {
			await tasksStore.deleteTask(id, "local");
		} catch (err) {
			Alert.alert("Hata", "Silme başarısız.");
		}
	}

	async function onToggleComplete(t: any) {
		try {
			await tasksStore.updateTask(t.id, { status: t.status === "completed" ? "active" : "completed" }, "local");
		} catch (err) {
			Alert.alert("Hata", "Güncelleme başarısız.");
		}
	}

	if (loading) return <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></SafeAreaView>;

	return (
		<SafeAreaView style={{ flex: 1, padding: 16 }}>
			<DecorativeBackground />
			<Card style={{ marginBottom: 12 }}>
				<Text style={{ fontWeight: "700" }}>Görevler</Text>
				<View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
					<Text>Toplam: {stats.total}</Text>
					<Text>Tamamlanan: {stats.done}</Text>
					<Text>Aktif: {stats.active}</Text>
				</View>
			</Card>

			<View style={{ flexDirection: "row", marginBottom: 12 }}>
				<Pill label="Tümü" selected={filter === "all"} onPress={() => setFilter("all")} />
				<Pill label="Aktif" selected={filter === "active"} onPress={() => setFilter("active")} />
				<Pill label="Tamamlanan" selected={filter === "done"} onPress={() => setFilter("done")} />
			</View>

			<ActionButton title="Yeni Görev Oluştur" onPress={() => navigation.navigate(Routes.TasksNew)} />

			<FlatList
				data={filtered}
				keyExtractor={(i) => i.id}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => navigation.navigate(Routes.TasksDetail, { taskId: item.id })} style={{ marginTop: 12 }}>
						<Card>
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontWeight: "700" }}>{item.title}</Text>
									<Text style={{ color: "#666", fontSize: 12 }}>{item.category} • {item.priority}</Text>
								</View>
								<View style={{ alignItems: "center" }}>
									<TouchableOpacity onPress={() => onToggleComplete(item)} style={{ padding: 8, backgroundColor: item.status === "completed" ? "#e6f7e9" : "#f0f4ff", borderRadius: 8 }}>
										<Text>{item.status === "completed" ? "✓" : "○"}</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => onDelete(item.id)} style={{ marginTop: 8 }}>
										<Text style={{ color: "#ef4444" }}>Sil</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Card>
					</TouchableOpacity>
				)}
			/>
		</SafeAreaView>
	);
}
