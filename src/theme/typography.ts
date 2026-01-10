export const typography = {
	// Headings (Figma hiyerarşisine göre)
	h1: { fontSize: 28, fontWeight: "800" as const, lineHeight: 36, letterSpacing: 0 },
	h2: { fontSize: 22, fontWeight: "700" as const, lineHeight: 30, letterSpacing: 0 },
	h3: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24, letterSpacing: 0 },
	h4: { fontSize: 16, fontWeight: "600" as const, lineHeight: 22, letterSpacing: 0 },

	// Subtitle / secondary heading
	subtitle: { fontSize: 15, fontWeight: "600" as const, lineHeight: 20, letterSpacing: 0 },

	// Body text (primary)
	body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20, letterSpacing: 0 },

	// Caption / small text
	caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16, letterSpacing: 0 },

	// Buttons
	button: { fontSize: 14, fontWeight: "700" as const, lineHeight: 18, letterSpacing: 0.2 },
} as const;
