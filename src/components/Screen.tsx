import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function Screen({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
			<View style={[styles.container, noPadding && styles.noPadding]}>{children}</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1 },
	container: { flex: 1, paddingHorizontal: spacing.md },
	noPadding: { paddingHorizontal: 0 },
});
