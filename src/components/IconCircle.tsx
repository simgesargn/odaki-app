import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radius } from "../theme/radius";

type Props = {
	children: React.ReactNode;
	size?: number;
	bgColor?: string;
	style?: any;
};

export default function IconCircle({ children, size = 44, bgColor = "#fff", style }: Props) {
	return (
		<View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }, style]}>
			{typeof children === "string" ? <Text style={{ fontSize: Math.floor(size / 2) }}>{children}</Text> : children}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
	},
});
