import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { colors as themeColors } from "../theme/colors";

export default function SafeLinearGradient({ colors, style, children }: { colors?: string[]; style?: any; children?: React.ReactNode }) {
	const safe = Array.isArray(colors) && colors.length >= 2 ? colors : (themeColors.gradient?.main ?? ["#2563EB", "#9333EA"]);
	return <LinearGradient colors={safe} style={style}>{children}</LinearGradient>;
}
