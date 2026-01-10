import React from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView style={{ padding: 16 }}>
				<Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Kullanım Koşulları</Text>
				<Text>1. Uygulama demo/prototip amaçlıdır.</Text>
				<Text>2. Kullanıcı içerikleri size aittir.</Text>
				<Text>3. Hizmet sürekliliği garanti edilmez.</Text>
				<Text>4. Veriler Firestore'da saklanır.</Text>
				<Text>5. Premium satın almaları testi kapsamaz.</Text>
				<Text>6. Sağlık/medikal tavsiye içermez.</Text>
				<Text>7. Üçüncü taraf API kullanımı olabilir.</Text>
				<Text>8. Gizlilik politikasını kabul etmiş sayılırsınız.</Text>
				<Text>9. Sorun bildirimleri destek ile paylaşılmalıdır.</Text>
				<Text>10. Uygulama geliştiricisi sorumluluğu sınırlıdır.</Text>
				<Text style={{ marginTop: 12, fontStyle: "italic" }}>Bu uygulama demo/prototip niteliğindedir.</Text>
			</ScrollView>
		</SafeAreaView>
	);
}
