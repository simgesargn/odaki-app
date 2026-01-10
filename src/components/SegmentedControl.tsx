import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { typography } from "../theme/typography";

export default function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
	const safe = Array.isArray(options) ? options : [];
	return (
		<View style={styles.row}>
			{safe.map((opt) => {
				const active = opt === value;
				return (
					<TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.pill, active ? styles.active : styles.inactive]}>
						<Text style={[typography.button, active ? styles.textActive : styles.textInactive]}>{opt}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", paddingVertical: spacing.sm },
	pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, marginRight: 8 },
	active: { backgroundColor: colors.primary },
	inactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
	textActive: { color: colors.primaryText },
	textInactive: { color: colors.text },
});
