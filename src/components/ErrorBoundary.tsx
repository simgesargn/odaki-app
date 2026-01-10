import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: any) {
		console.error("[ErrorBoundary] caught:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Bir hata oluştu</Text>
					<Text style={styles.msg}>{this.state.error?.message ?? "Bilinmeyen hata"}</Text>
					<Button title="Yeniden başlat" onPress={() => { /* kullanıcı manuel yeniler */ }} />
				</View>
			);
		}
		return this.props.children as React.ReactElement;
	}
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
	title: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
	msg: { color: "#666", marginBottom: 12, textAlign: "center" },
});
