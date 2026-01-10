import React from "react";
import { PrimaryButton, SecondaryButton } from "./Button";

export function ActionButton({ title, onPress, kind = "primary", style }: { title: string; onPress: () => void; kind?: "primary" | "secondary"; style?: any }) {
	if (kind === "secondary") return <SecondaryButton title={title} onPress={onPress} style={style} />;
	return <PrimaryButton title={title} onPress={onPress} style={style} />;
}
