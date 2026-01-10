import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import Pill from "../components/Pill";
import IconCircle from "../components/IconCircle";
import { useSession } from "../store/sessionStore";
import { listUserTasks, deleteUserTask } from "../services/firestoreService";
import { Routes } from "../navigation/routes";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import tasksStore from "../store/tasksStore";
import GradientHeader from "../components/GradientHeader";
import { rootNavigate } from "../navigation/navigationRef";
import { ActionButton } from "../components/ActionButton";
import DecorativeBackground from "../components/DecorativeBackground";

type Props = NativeStackScreenProps<any, any>;

export default function HomeScreen({ navigation }: Props) {
	const { userId, user } = useSession();
	const [tasks, setTasks] = useState<Array<any>>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [search, setSearch] = useState<string>("");
	const [filter, setFilter] = useState<"all" | "today" | "high">("all");
	const [localTasks, setLocalTasks] = useState<any[]>([]);
	const drawerX = useRef(new Animated.Value(-1)).current; // -1 hidden, 0 shown
	const [drawerOpen, setDrawerOpen] = useState(false);
	const screenW = Dimensions.get("window").width;

	function openDrawer() {
		setDrawerOpen(true);
		Animated.timing(drawerX, { toValue: 0, duration: 240, useNativeDriver: true }).start();
	}
	function closeDrawer() {
		Animated.timing(drawerX, { toValue: -1, duration: 200, useNativeDriver: true }).start(() => setDrawerOpen(false));
	}

	// drawer translateX interpolation
	const translateX = drawerX.interpolate({ inputRange: [-1, 0], outputRange: [-screenW, 0] });

	async function load() {
		if (!userId) {
			setTasks([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const list = await listUserTasks(userId);
			setTasks(list || []);
		} catch (err) {
			console.error("[HomeScreen] load tasks hata:", err);
			Alert.alert("Hata", "Görevler yüklenemedi.");
		} finally {
			setLoading(false);
		}
	}

	async function loadLocal() {
		const list = await tasksStore.getTasks("local");
		setLocalTasks(list || []);
	}

	useEffect(() => {
		load();
		loadLocal();
		const unsub = tasksStore.subscribe(() => loadLocal());
		return () => unsub();
	}, [userId]);

	const summary = useMemo(() => {
		const total = localTasks.length;
		const completed = localTasks.filter((t) => t.status === "completed").length;
		const focusMinutes = user?.totalFocusMinutes ?? 0;
		const streak = user?.streak ?? 0;
		return { total, completed, focusMinutes, streak };
	}, [localTasks, user]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		let arr = localTasks.slice();
		if (filter === "today") {
			arr = arr.filter((t) => {
				const c = t?.createdAt;
				const dt = c ? new Date(c) : null;
				return dt && dt >= startOfDay;
			});
		} else if (filter === "high") {
			arr = arr.filter((t) => (t.priority ?? "").toLowerCase() === "high");
		}
		if (q) {
			arr = arr.filter((t) => (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q));
		}
		return arr;
	}, [localTasks, search, filter]);

	async function onCompleteTask(id: string) {
		if (!userId) return;
		try {
			await deleteUserTask(userId, id); // demo: tamamlanan görevi sil
			await load();
		} catch (err) {
			console.error("[HomeScreen] complete hata:", err);
			Alert.alert("Hata", "Görev tamamlanamadı.");
		}
	}

	if (loading) return <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></SafeAreaView>;

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<DecorativeBackground />
			<GradientHeader
				title="ODAKI"
				left={<TouchableOpacity onPress={openDrawer}><Text style={{ color: "#fff", fontSize: 20 }}>☰</Text></TouchableOpacity>}
				right={
					<TouchableOpacity onPress={() => rootNavigate(Routes.Notifications)}>
						<Text style={{ color: "#fff", fontSize: 20 }}>🔔</Text>
					</TouchableOpacity>
				}
			/>

			<View style={{ padding: spacing.md }}>
				{/* Bugünün Özeti */}
				<Card style={{ marginBottom: spacing.md }}>
					<Text style={{ fontWeight: "700", marginBottom: 8 }}>Bugünün Özeti</Text>
					<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
						<View>
							<Text style={{ color: colors.muted }}>Görev</Text>
							<Text style={{ fontWeight: "700", fontSize: 18 }}>{summary.completed}/{summary.total}</Text>
						</View>
						<View>
							<Text style={{ color: colors.muted }}>Odak (dk)</Text>
							<Text style={{ fontWeight: "700", fontSize: 18 }}>{summary.focusMinutes}</Text>
						</View>
						<View>
							<Text style={{ color: colors.muted }}>Seri</Text>
							<Text style={{ fontWeight: "700", fontSize: 18 }}>{summary.streak}</Text>
						</View>
					</View>
				</Card>

				{/* Hızlı kutucuklar */}
				<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
					<ActionButton title="Görev" onPress={() => navigation.navigate(Routes.TasksTab)} />
					<ActionButton title="Odak" onPress={() => navigation.navigate(Routes.FocusTab)} kind="secondary" />
					<ActionButton title="AI" onPress={() => navigation.navigate(Routes.AITab)} />
					<ActionButton title="İstatistik" onPress={() => navigation.navigate(Routes.StatsTab)} />
				</View>

				{/* Arama + filtre */}
				<View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.md }}>
					<TextInput value={search} onChangeText={setSearch} placeholder="Görev ara..." style={{ flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#eee" }} />
					<TouchableOpacity style={{ marginLeft: 8 }} onPress={() => setSearch("")}><Text>✖</Text></TouchableOpacity>
				</View>
				<View style={{ flexDirection: "row", marginBottom: spacing.md }}>
					<Pill label="Tümü" active={filter === "all"} onPress={() => setFilter("all")} />
					<Pill label="Bugün" active={filter === "today"} onPress={() => setFilter("today")} />
					<Pill label="Yüksek öncelik" active={filter === "high"} onPress={() => setFilter("high")} />
				</View>

				{/* Gündemde listesi */}
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
					<Text style={{ fontWeight: "700", fontSize: 16 }}>Gündemde</Text>
					<TouchableOpacity onPress={() => navigation.navigate(Routes.TasksTab)}><Text style={{ color: colors.primary }}>Tümünü Gör</Text></TouchableOpacity>
				</View>

				{filtered.length === 0 ? (
					<Card><Text style={{ color: colors.muted }}>Gündemde görev yok.</Text></Card>
				) : (
					<FlatList
						data={filtered}
						keyExtractor={(i) => i.id}
						renderItem={({ item }) => (
							<TouchableOpacity onPress={() => {}} style={{ marginBottom: 8 }}>
								<Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontWeight: "700" }}>{item.title}</Text>
										<Text style={{ color: colors.muted, fontSize: 12 }}>{item.description ?? ""}</Text>
									</View>
									<View style={{ marginLeft: 12, alignItems: "center" }}>
										<TouchableOpacity onPress={() => onCompleteTask(item.id)} style={{ padding: 8, backgroundColor: "#e6f7e9", borderRadius: 8 }}>
											<Text>✔</Text>
										</TouchableOpacity>
										<Text style={{ marginTop: 6, color: item.priority === "high" ? "#ef4444" : item.priority === "low" ? "#10b981" : "#f59e0b", fontWeight: "700" }}>
											{(item.priority ?? "orta").toUpperCase()}
										</Text>
									</View>
								</Card>
							</TouchableOpacity>
						)}
					/>
				)}
			</View>

			{/* Drawer overlay */}
			{drawerOpen && (
				<>
					<TouchableOpacity onPress={closeDrawer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" }} />
					<Animated.View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: screenW * 0.78, transform: [{ translateX }], backgroundColor: "#fff", padding: 16 }}>
						<Text style={{ fontWeight: "800", fontSize: 18, marginBottom: 12 }}>Menü</Text>
						<TouchableOpacity onPress={() => { navigation.navigate(Routes.ProfileTab); closeDrawer(); }} style={{ paddingVertical: 12 }}><Text>Profil</Text></TouchableOpacity>
						<TouchableOpacity onPress={() => { navigation.navigate(Routes.TasksTab); closeDrawer(); }} style={{ paddingVertical: 12 }}><Text>Görevler</Text></TouchableOpacity>
						<TouchableOpacity onPress={() => { navigation.navigate(Routes.FocusTab); closeDrawer(); }} style={{ paddingVertical: 12 }}><Text>Odak</Text></TouchableOpacity>
						{/* add more items as needed */}
					</Animated.View>
				</>
			)}
		</SafeAreaView>
	);
}
