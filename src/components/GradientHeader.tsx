import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { getSafeGradient } from "../utils/getSafeGradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GradientHeader({ title, left, right, gradientColors }: { title?: string; left?: React.ReactNode; right?: React.ReactNode; gradientColors?: string[] }) {
	const safeGradient = getSafeGradient(gradientColors, colors.gradient.main);
	return (
		<LinearGradient colors={safeGradient} style={styles.gradient}>
			<SafeAreaView edges={["top"]} style={styles.safe}>
				<View style={styles.row}>
					<View style={styles.side}>{left}</View>
					<Text style={styles.title}>{title}</Text>
					<View style={styles.side}>{right}</View>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	gradient: { width: "100%" },
	safe: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
	row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	side: { width: 44, alignItems: "center" },
	title: { color: colors.surface, ...typography.h1, textAlign: "center", flex: 1 },
});
