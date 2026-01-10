import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";

export default function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.btn}>
			<Text style={styles.text}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	btn: {
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		paddingVertical: spacing.sm * 2,
		paddingHorizontal: spacing.lg,
		borderRadius: radius.lg,
		alignItems: "center",
	},
	text: { color: colors.text, fontWeight: "700" },
});
