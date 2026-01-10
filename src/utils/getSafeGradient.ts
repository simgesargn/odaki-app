import { colors } from "../theme/colors";

export function getSafeGradient(input?: string[], fallback: string[] = colors.gradient.main) {
	if (Array.isArray(input) && input.length >= 2) return input;
	if (Array.isArray(fallback) && fallback.length >= 2) return fallback;
	// en son çare sabit iki renk
	return ["#2563EB", "#9333EA"];
}
