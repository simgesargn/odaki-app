import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

export default function DecorativeBackground() {
	return (
		<>
			{/* subtle screen gradient overlay */}
			<LinearGradient colors={colors.backgroundGradient} style={styles.screenGradient} pointerEvents="none" />

			{/* decorative top-left blob */}
			<LinearGradient colors={[colors.gradient.main[0], colors.gradient.main[1]]} style={[styles.blob, styles.blobTopLeft]} pointerEvents="none" />

			{/* decorative bottom-right blob */}
			<LinearGradient colors={[colors.gradient.ai[0], colors.gradient.ai[1]]} style={[styles.blob, styles.blobBottomRight]} pointerEvents="none" />
		</>
	);
}

const styles = StyleSheet.create({
	screenGradient: {
		...StyleSheet.absoluteFillObject,
		opacity: 1,
	},
	blob: {
		position: "absolute",
		width: 260,
		height: 260,
		borderRadius: 130,
		opacity: 0.12,
	},
	blobTopLeft: {
		top: -60,
		left: -40,
		transform: [{ rotate: "-20deg" }],
		opacity: 0.16,
	},
	blobBottomRight: {
		bottom: -80,
		right: -50,
		width: 320,
		height: 320,
		borderRadius: 160,
		transform: [{ rotate: "25deg" }],
		opacity: 0.12,
	},
});
