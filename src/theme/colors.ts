export const colors = {
	// genel arka plan: Figma'ya yakın yumuşak pastel (lavanta / açık mavi)
	bg: "#F3F0FF", // ekranların ana arkaplanı (NOT pure white)

	// kartlar beyaz kalmalı
	surface: "#FFFFFF",
	card: "#FFFFFF",

	// metin
	text: "#0F172A",
	textMuted: "#6B7280",

	// birincil renk
	primary: "#2563EB",
	primaryText: "#FFFFFF",

	// sınırlar / aksanlar
	border: "#E6E9EE",
	danger: "#EF4444",
	success: "#22C55E",
	warning: "#EAB308",
	orange: "#F97316",

	// mevcut gradient setleri (korundu)
	gradient: {
		main: ["#2563EB", "#9333EA", "#EC4899"],
		focus: ["#7C3AED", "#2563EB"],
		ai: ["#2563EB", "#8B5CF6"],
	} as const,

	// yeni tokenlar
	// ekranlar için hafif arkaplan gradyanı (DecorativeBackground vb. için)
	backgroundGradient: ["#F3F0FF", "#EEF6FF"] as const,

	// kart gölgesi (component'lerde spread ile kullanılabilir)
	cardShadow: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.06,
		shadowRadius: 16,
		elevation: 4,
	} as const,

	// hafif yüzey rengi (overlay / locked card arkaplanı)
	mutedSurface: "#F3F4F6",
} as const;
