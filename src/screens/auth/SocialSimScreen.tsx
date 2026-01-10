import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Routes } from "../../navigation/routes";

type Props = NativeStackScreenProps<any, any>;

export default function SocialSimScreen({ route, navigation }: Props) {
	const provider = route.params?.provider ?? "google";
	return (
		<SafeAreaView style={{ flex: 1, padding: 20 }}>
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ fontWeight: "800", fontSize: 20 }}>{provider.toUpperCase()} prototip izni</Text>
				<Text style={{ marginTop: 12, textAlign: "center" }}>ODAKI uygulamasının aşağıdaki bilgilere erişmesi isteniyor:</Text>
				<View style={{ marginTop: 12, backgroundColor: "#eef6ff", padding: 12, borderRadius: 10 }}>
					<Text>• Profil bilgilerine erişim</Text>
					<Text>• E-posta adresine erişim</Text>
				</View>
				<Text style={{ marginTop: 12, color: "#2563eb" }}>Bu bir prototip simülasyonudur.</Text>
				<TouchableOpacity style={styles.allow} onPress={() => {
					// prototip simülasyonu: yönlendir Login'e
					navigation.navigate(Routes.Login);
				}}>
					<Text style={{ color: "#fff", fontWeight: "700" }}>İzin Ver ve Devam Et</Text>
				</TouchableOpacity>
				<TouchableOpacity style={{ marginTop: 8 }} onPress={() => navigation.goBack()}><Text>İptal Et</Text></TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	allow: { marginTop: 20, backgroundColor: "#2563eb", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
});
