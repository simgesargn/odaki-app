import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Screen from "../../components/Screen";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import achievementsStore, { Achievement } from "../../store/achievementsStore";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import GradientHeader from "../../components/GradientHeader";
import { getSafeGradient } from "../../utils/getSafeGradient";

export default function AchievementsScreen() {
	const [items, setItems] = useState<Achievement[]>([]);

	async function load() {
		const list = await achievementsStore.getAchievements();
		setItems(list);
	}

	useEffect(() => {
		load();
		const unsub = achievementsStore.subscribe(() => load());
		return () => unsub();
	}, []);

	// UI-only: render locked / unlocked differently
	function renderItem({ item }: { item: Achievement }) {
		const locked = Boolean(item.locked);
		return (
			<Card style={[styles.card, locked ? styles.cardLocked : styles.cardUnlocked]}>
				<View style={styles.cardContent}>
					<View style={{ flex: 1 }}>
						<Text style={[styles.title, locked ? styles.titleLocked : styles.titleUnlocked]} numberOfLines={2}>
							{item.title}
						</Text>
						<Text style={[styles.meta, locked ? styles.metaLocked : styles.metaUnlocked]}>
							{item.progress}/{item.total} tamamlandı
						</Text>
					</View>

					{/* right area: lock badge or progress % */}
					{locked ? (
						<View style={styles.lockWrap}>
							<View style={styles.lockCircle}>
								<Text style={styles.lockIcon}>🔒</Text>
							</View>
						</View>
					) : (
						<Text style={[styles.percent, styles.percentUnlocked]}>{Math.round((item.progress / item.total) * 100)}%</Text>
					)}
				</View>

				{/* bottom row: rarity + action */}
				<View style={styles.bottomRow}>
					<Text style={[styles.rarity, locked ? styles.rarityLocked : styles.rarityUnlocked]}>{item.rarity}</Text>

					{locked ? (
						// locked: show disabled style
						<View style={styles.lockAction}>
							<Text style={{ color: colors.textMuted, fontSize: 12 }}>Kilitli</Text>
						</View>
					) : (
						<TouchableOpacity style={styles.openAction}>
							<Text style={{ color: colors.primaryText, fontWeight: "700" }}>Göster</Text>
						</TouchableOpacity>
					)}
				</View>
			</Card>
		);
	}

	return (
		<Screen>
			<GradientHeader title="Başarılar" gradientColors={getSafeGradient(colors.gradient.main)} />
			<View style={{ marginTop: spacing.md }}>
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
					<Text style={{ ...typography.h2, color: colors.text }}>Başarılar</Text>
					<PrimaryButton title="Tümünü Aç" onPress={async () => { /* UI-only; backend handled elsewhere */ await achievementsStore.unlockAllAchievements(); }} />
				</View>

				<FlatList
					data={Array.isArray(items) ? items : []}
					keyExtractor={(i) => i.id}
					numColumns={2}
					columnWrapperStyle={{ justifyContent: "space-between", marginBottom: spacing.md }}
					renderItem={renderItem}
					contentContainerStyle={{ paddingBottom: spacing.xl }}
				/>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: {
		width: "48%",
		borderRadius: 20,
		padding: spacing.md,
	},

	cardContent: {
		flexDirection: "row",
		alignItems: "center",
	},

	// unlocked styles
	cardUnlocked: {
		backgroundColor: colors.card,
		opacity: 1,
	},
	title: { fontWeight: "800", fontSize: 16 },
	titleUnlocked: { color: colors.text },
	meta: { marginTop: 8, fontSize: 12 },
	metaUnlocked: { color: colors.textMuted },

	percent: { fontWeight: "700", fontSize: 16 },
	percentUnlocked: { color: colors.primary },

	// locked styles (grayscale-like)
	cardLocked: {
		backgroundColor: colors.mutedSurface,
		opacity: 0.85,
	},
	titleLocked: { color: colors.textMuted },
	metaLocked: { color: colors.textMuted },
	rarityLocked: { color: colors.textMuted },

	// bottom row
	bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },

	rarity: { fontSize: 12 },
	rarityUnlocked: { color: "#888" },

	openAction: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
	lockAction: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "transparent" },

	// lock badge
	lockWrap: { marginLeft: 12 },
	lockCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(0,0,0,0.06)",
		alignItems: "center",
		justifyContent: "center",
	},
	lockIcon: { fontSize: 16 },

	// small helpers
	percent: { marginLeft: 12 },
});
