import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";

export default function Card({ children, style }: { children: React.ReactNode; style?: any }) {
	return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.card,
		borderRadius: radius.card,
		padding: spacing.md,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.06,
		shadowRadius: 12,
		elevation: 3,
		borderWidth: 1,
		borderColor: colors.border,
	},
});
