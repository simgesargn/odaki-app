import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Pill from "../components/Pill";
import GradientHeader from "../components/GradientHeader";
import { getSafeGradient } from "../utils/getSafeGradient";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useSession } from "../store/sessionStore";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { listUserTasks } from "../services/firestoreService";
import SegmentedControl from "../components/SegmentedControl";
import DecorativeBackground from "../components/DecorativeBackground";

type FocusSum = { minutes: number };

function toDate(val: any): Date | null {
	if (!val && val !== 0) return null;
	// Firestore Timestamp
	if (val?.toDate && typeof val.toDate === "function") return val.toDate();
	// numeric millis
	if (typeof val === "number") return new Date(val);
	// ISO string
	if (typeof val === "string") {
		const d = new Date(val);
		if (!isNaN(d.getTime())) return d;
	}
	return null;
}

export default function StatsScreen() {
	const { userId, user } = useSession();
	const [loading, setLoading] = useState<boolean>(true);
	const [dailyFocus, setDailyFocus] = useState<number>(0);
	const [weeklyFocus, setWeeklyFocus] = useState<number>(0);
	const [completedToday, setCompletedToday] = useState<number>(0);
	const [completedWeek, setCompletedWeek] = useState<number>(0);
	const [filter, setFilter] = useState<"day" | "week">("day");
	const [streak, setStreak] = useState<number>(user?.streak ?? 0);

	useEffect(() => {
		setStreak(user?.streak ?? 0);
	}, [user?.streak]);

	useEffect(() => {
		let unsubFocusDay: (() => void) | null = null;
		let unsubFocusWeek: (() => void) | null = null;
		let mounted = true;

		async function load() {
			setLoading(true);
			setDailyFocus(0);
			setWeeklyFocus(0);
			setCompletedToday(0);
			setCompletedWeek(0);

			if (!userId) {
				setLoading(false);
				return;
			}

			// start of day & week
			const now = new Date();
			const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const dayTs = Timestamp.fromDate(startOfDay);

			const dayOfWeek = now.getDay(); // 0 (Sun) .. 6
			const diffToMonday = (dayOfWeek + 6) % 7; // convert so Monday is start
			const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
			const weekTs = Timestamp.fromDate(startOfWeek);

			try {
				// focusSessions may be top-level collection with userId field
				if (db) {
					// daily focus
					const qDay = query(collection(db, "focusSessions"), where("userId", "==", userId), where("createdAt", ">=", dayTs));
					unsubFocusDay = onSnapshot(qDay, (snap) => {
						let sum = 0;
						snap.forEach((d) => {
							const data = d.data() as any;
							// possible fields: minutes, durationMinutes, duration
							const val =
								typeof data.minutes === "number" ? data.minutes :
								typeof data.durationMinutes === "number" ? data.durationMinutes :
								typeof data.duration === "number" ? data.duration :
								0;
							sum += Number(val) || 0;
						});
						if (mounted) setDailyFocus(sum);
					}, (err) => {
						console.warn("[Stats][focusDay] onSnapshot err", err);
						// fallback to user.totalFocusMinutes if available
						if (mounted && user?.totalFocusMinutes) setDailyFocus(0);
					});

					// weekly focus
					const qWeek = query(collection(db, "focusSessions"), where("userId", "==", userId), where("createdAt", ">=", weekTs));
					unsubFocusWeek = onSnapshot(qWeek, (snap) => {
						let sum = 0;
						snap.forEach((d) => {
							const data = d.data() as any;
							const val =
								typeof data.minutes === "number" ? data.minutes :
								typeof data.durationMinutes === "number" ? data.durationMinutes :
								typeof data.duration === "number" ? data.duration :
								0;
							sum += Number(val) || 0;
						});
						if (mounted) setWeeklyFocus(sum);
					}, (err) => {
						console.warn("[Stats][focusWeek] onSnapshot err", err);
						if (mounted && user?.totalFocusMinutes) setWeeklyFocus(user.totalFocusMinutes || 0);
					});
				}
			} catch (e) {
				console.warn("[Stats] focus subscriptions error", e);
				if (mounted && user?.totalFocusMinutes) {
					setDailyFocus(0);
					setWeeklyFocus(user.totalFocusMinutes || 0);
				}
			}

			// tasks: use listUserTasks service and filter by date/status
			try {
				const tasks = await listUserTasks(userId);
				const safeTasks = Array.isArray(tasks) ? tasks : [];
				let cToday = 0;
				let cWeek = 0;
				for (const t of safeTasks) {
					const created = toDate(t?.createdAt);
					const status = t?.status ?? t?.state ?? t?.completed ? "completed" : "active";
					if (status === "completed") {
						if (created) {
							if (created >= startOfDay) cToday++;
							if (created >= startOfWeek) cWeek++;
						} else {
							// if no created date, count in week by default
							cWeek++;
						}
					}
				}
				if (mounted) {
					setCompletedToday(cToday);
					setCompletedWeek(cWeek);
				}
			} catch (e) {
				console.warn("[Stats] listUserTasks error", e);
				if (mounted) {
					setCompletedToday(0);
					setCompletedWeek(0);
				}
			} finally {
				if (mounted) setLoading(false);
			}
		}

		load();

		return () => {
			mounted = false;
			if (unsubFocusDay) unsubFocusDay();
			if (unsubFocusWeek) unsubFocusWeek();
		};
	}, [userId]);

	const display = useMemo(() => {
		if (filter === "day") {
			return { focus: dailyFocus, completed: completedToday, label: "Bugün" };
		}
		return { focus: weeklyFocus, completed: completedWeek, label: "Bu Hafta" };
	}, [filter, dailyFocus, weeklyFocus, completedToday, completedWeek]);

	if (loading) {
		return (
			<Screen>
				<ActivityIndicator style={{ marginTop: spacing.lg }} />
			</Screen>
		);
	}

	return (
		<Screen>
				<DecorativeBackground />
			<GradientHeader title="İstatistik" gradientColors={getSafeGradient(colors.gradient.main)} />
			<View style={{ marginTop: spacing.md }}>
				<Card style={{ marginBottom: spacing.md }}>
					<Text style={[typography.h2, { color: colors.text }]}>Özet</Text>
					<View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
						<View style={{ alignItems: "center" }}>
							<Text style={{ color: colors.textMuted }}>Odak ({display.label})</Text>
							<Text style={{ ...typography.h1, marginTop: 8 }}>{display.focus} dk</Text>
						</View>
						<View style={{ alignItems: "center" }}>
							<Text style={{ color: colors.textMuted }}>Tamamlanan Görevler</Text>
							<Text style={{ ...typography.h1, marginTop: 8 }}>{display.completed}</Text>
						</View>
						<View style={{ alignItems: "center" }}>
							<Text style={{ color: colors.textMuted }}>Seri</Text>
							<Text style={{ ...typography.h1, marginTop: 8 }}>{streak}</Text>
						</View>
					</View>
				</Card>

				 {/* replaced pills with SegmentedControl */}
				<SegmentedControl options={["Bugün", "Bu Hafta"]} value={filter === "day" ? "Bugün" : "Bu Hafta"} onChange={(v) => setFilter(v === "Bugün" ? "day" : "week")} />

				{/* more detailed cards: breakdown */}
				<Card style={{ marginBottom: spacing.md }}>
					<Text style={[typography.h3, { color: colors.text }]}>Detaylı Bilgi</Text>
					<View style={{ marginTop: spacing.md }}>
						<Text style={{ color: colors.textMuted }}>Toplam Odak (tüm zaman): {user?.totalFocusMinutes ?? 0} dk</Text>
						<Text style={{ color: colors.textMuted, marginTop: 8 }}>Toplam Tamamlanan Görev: {Array.isArray(user?.totalCompletedTasks) ? user.totalCompletedTasks.length : (user?.totalCompletedTasksCount ?? (completedWeek + completedToday))}</Text>
					</View>
				</Card>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({});
