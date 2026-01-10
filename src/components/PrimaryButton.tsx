import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { tryHapticsSelection } from "../services/optionalExpo";

export default function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
	async function handlePress() {
		await tryHapticsSelection();
		onPress();
	}

	return (
		<TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={[styles.btn, disabled && styles.disabled]} disabled={disabled}>
			<Text style={styles.text}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	btn: {
		backgroundColor: colors.primary,
		paddingVertical: spacing.sm * 2,
		paddingHorizontal: spacing.lg,
		borderRadius: radius.lg,
		alignItems: "center",
	},
	text: { color: colors.surface, fontWeight: "700" },
	disabled: { opacity: 0.6 },
});
