export async function tryHapticsSelection() {
	try {
		const Haptics = await import("expo-haptics");
		if (Haptics && typeof Haptics.selectionAsync === "function") {
			await Haptics.selectionAsync();
		}
	} catch {
		// yoksa no-op
	}
}

export type PickImageResult = { cancelled: boolean; uri?: string } | null;

export async function tryPickImage(): Promise<PickImageResult> {
	try {
		const ImagePicker = await import("expo-image-picker");
		// request permission
		const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!perm.granted) return null;
		const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
		if (res.cancelled) return { cancelled: true };
		return { cancelled: false, uri: (res as any).uri };
	} catch (err) {
		// dinamik import yok veya hata -> null
		return null;
	}
}
