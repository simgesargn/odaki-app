import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../store/sessionStore";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, writeBatch, doc, updateDoc } from "firebase/firestore";

type NotificationItem = { id: string; title: string; body?: string; read?: boolean; type?: string; createdAt?: any };

export default function NotificationsScreen() {
	const navigation = useNavigation();
	const { userId } = useSession();
	const [items, setItems] = useState<NotificationItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [processing, setProcessing] = useState<boolean>(false);
	const [unlockedAll, setUnlockedAll] = useState<boolean>(false);

	useEffect(() => {
		let mounted = true;
		async function load() {
			setLoading(true);
			const SAMPLE = [
				{ id: "n1", title: "Görev hatırlatıcısı", body: "Bugün 15:00'te toplantınız var.", read: false },
				{ id: "n2", title: "Ödül", body: "Odak oturumunu tamamladınız, yeni çiçek!", read: false },
			];
			if (db && userId) {
				try {
					const q = query(collection(db, "notifications"), where("userId", "==", userId));
					const snap = await getDocs(q);
					const list: NotificationItem[] = [];
					snap.forEach((d) => {
						const data = d.data() as any;
						list.push({
							id: d.id,
							title: data.title ?? "Bildirim",
							body: data.body ?? "",
							read: !!data.read,
							type: data.type ?? undefined,
							createdAt: data.createdAt ?? null,
						});
					});
					if (mounted) setItems(Array.isArray(list) ? list : SAMPLE);
				} catch (e) {
					console.warn("[Notifications] firestore load hata:", e);
					if (mounted) setItems(SAMPLE);
				} finally {
					if (mounted) setLoading(false);
				}
			} else {
				if (mounted) {
					setItems(SAMPLE);
					setLoading(false);
				}
			}
		}
		load();
		return () => { mounted = false; };
	}, [userId]);

	async function markAllRead() {
		if (processing) return;
		setProcessing(true);
		setItems((prev) => (Array.isArray(prev) ? prev.map((p) => ({ ...p, read: true })) : prev));
		if (db && userId) {
			try {
				const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
				const snap = await getDocs(q);
				if (!snap.empty) {
					const batch = writeBatch(db);
					snap.forEach((d) => {
						const ref = doc(db, "notifications", d.id);
						batch.update(ref, { read: true });
					});
					await batch.commit();
				}
			} catch (e) {
				console.warn("[Notifications] markAllRead firestore hata:", e);
			}
		}
		setProcessing(false);
	}

	async function unlockAll() {
		if (processing) return;
		setProcessing(true);
		setUnlockedAll(true);
		if (db && userId) {
			try {
				const userRef = doc(db, "users", userId);
				await updateDoc(userRef, { flowersUnlocked: ["all"] });
			} catch (e) {
				console.warn("[Notifications] unlockAll firestore hata:", e);
				setUnlockedAll(false);
			}
		}
		setProcessing(false);
	}

	function renderNotif({ item }: { item: NotificationItem }) {
		return (
			<TouchableOpacity style={{ marginBottom: spacing.sm }}>
				<Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<View style={{ flex: 1 }}>
						<Text style={{ fontWeight: item.read ? "600" : "800", color: colors.text }}>{item.title}</Text>
						{item.body ? <Text style={{ color: colors.textMuted, marginTop: 6 }}>{item.body}</Text> : null}
					</View>
					<View style={{ marginLeft: 12, alignItems: "center" }}>
						{item.read ? <Text style={{ color: colors.textMuted }}>Okundu</Text> : <Text style={{ color: colors.primary }}>Yeni</Text>}
					</View>
				</Card>
			</TouchableOpacity>
		);
	}

	return (
		<Screen>
			<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
					<Text style={{ color: colors.primary }}>← Geri</Text>
				</TouchableOpacity>

				<Text style={{ ...typography.h2, color: colors.text }}>Bildirimler</Text>

				<View style={{ width: 44 }} />
			</View>

			<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
				<TouchableOpacity onPress={markAllRead} disabled={processing} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
					<Text style={{ color: colors.text }}>Tümünü Okundu İşaretle</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={unlockAll} disabled={processing || unlockedAll} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: unlockedAll ? "#eef2ff" : colors.primary }}>
					<Text style={{ color: unlockedAll ? colors.primary : colors.primaryText }}>{unlockedAll ? "Hepsi Açıldı" : "Tümünü Aç"}</Text>
				</TouchableOpacity>
			</View>

			{loading ? (
				<ActivityIndicator />
			) : (
				<FlatList data={Array.isArray(items) ? items : []} keyExtractor={(i) => i.id} renderItem={renderNotif} contentContainerStyle={{ paddingBottom: 40 }} />
			)}
		</Screen>
	);
}
