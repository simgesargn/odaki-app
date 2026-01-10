import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { theme } from "./theme";

export function Screen({ children, style }: any) {
	return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

export function Card({ children, style }: any) {
	return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ title, onPress, disabled }: any) {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.primary, disabled && styles.disabled]}>
			<Text style={styles.primaryText}>{title}</Text>
		</TouchableOpacity>
	);
}

export function SecondaryButton({ title, onPress }: any) {
	return (
		<TouchableOpacity onPress={onPress} style={styles.secondary}>
			<Text style={styles.secondaryText}>{title}</Text>
		</TouchableOpacity>
	);
}

export function TextField(props: any) {
	return <TextInput style={styles.input} placeholderTextColor={theme.colors.muted} {...props} />;
}

export function SectionTitle({ children }: any) {
	return <Text style={styles.section}>{children}</Text>;
}

export function EmptyState({ title, subtitle }: any) {
	return (
		<View style={styles.empty}>
			<Text style={{ fontWeight: "700", marginBottom: 8 }}>{title}</Text>
			<Text style={{ color: theme.colors.muted }}>{subtitle}</Text>
		</View>
	);
}

export function Badge({ children, style }: any) {
	return (
		<View style={[styles.badge, style]}>
			<Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{children}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing(2) },
	card: { backgroundColor: theme.colors.card, borderRadius: theme.radius, padding: theme.spacing(2), ...theme.shadow },
	primary: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: "center" },
	primaryText: { color: "#fff", fontWeight: "700" },
	secondary: { backgroundColor: "transparent", paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" },
	secondaryText: { color: theme.colors.primary, fontWeight: "700" },
	input: { borderWidth: 1, borderColor: "#eee", padding: 10, borderRadius: 8, backgroundColor: "#fff" },
	section: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
	empty: { alignItems: "center", padding: 20, backgroundColor: "#fff", borderRadius: 8 },
	badge: { backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
});
