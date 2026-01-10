import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";

export function PrimaryButton({ title, onPress, style }: { title: string; onPress: () => void; style?: any }) {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.primary, style]}>
			<Text style={styles.primaryText}>{title}</Text>
		</TouchableOpacity>
	);
}

export function SecondaryButton({ title, onPress, style }: { title: string; onPress: () => void; style?: any }) {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.secondary, style]}>
			<Text style={styles.secondaryText}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	primary: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.lg, alignItems: "center" },
	primaryText: { color: colors.primaryText, fontWeight: "700" },
	secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.lg, alignItems: "center" },
	secondaryText: { color: colors.text, fontWeight: "700" },
});
