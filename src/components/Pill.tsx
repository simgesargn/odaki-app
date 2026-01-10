import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";

type Props = {
	label: string;
	selected?: boolean;
	active?: boolean;
	onPress?: () => void;
	leftIcon?: React.ReactNode;
	style?: any;
};

export default function Pill({ label, selected, active, onPress, leftIcon, style }: Props) {
	const isSelected = selected ?? active ?? false;
	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={onPress}
			style={[
					styles.pill,
					isSelected ? styles.active : styles.inactive,
					style,
			]}
		>
			{leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
			<Text style={[styles.text, isSelected ? styles.textActive : styles.textInactive]}>{label}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, marginRight: 8 },
	active: { backgroundColor: colors.primary },
	inactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
	text: { fontWeight: "700" },
	textActive: { color: colors.primaryText },
	textInactive: { color: colors.text },
	iconWrap: {
		marginRight: 8,
	},
});
