import React from "react";
import { SafeAreaView, View, Text, FlatList } from "react-native";
import Card from "../components/Card";
import { spacing } from "../theme/spacing";

const FLOWERS = [
	{ name: "Çiçek", need: 3, rarity: "Yaygın" },
	{ name: "Gül", need: 5, rarity: "Nadir" },
	{ name: "Lale", need: 10, rarity: "Nadir" },
	{ name: "Ayçiçeği", need: 20, rarity: "Epik" },
	{ name: "Papatya", need: 30, rarity: "Epik" },
	{ name: "Lotus", need: 100, rarity: "Efsanevi" },
	{ name: "Buket", need: 999, rarity: "Premium" },
];

export default function GardenScreen() {
	const have = 2; // simülasyon: kullanıcı kaç çiçeğe sahip
	return (
		<SafeAreaView style={{ flex: 1, padding: spacing.md }}>
			<Card>
				<Text style={{ fontWeight: "700" }}>Koleksiyon: {have}/7</Text>
				<Text style={{ color: "#666", marginTop: 8 }}>Hedef: 7 çiçek</Text>
			</Card>

			<FlatList
				data={FLOWERS}
				keyExtractor={(i) => i.name}
				renderItem={({ item, index }) => (
					<Card style={{ marginTop: spacing.sm }}>
						<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<Text style={{ fontWeight: "700" }}>{item.name} {item.need >= 999 ? "(Premium)" : ""}</Text>
							<Text>{item.rarity}</Text>
						</View>
						<Text style={{ marginTop: 8, color: "#666" }}>{item.need} odak günü gerekli</Text>
					</Card>
				)}
			/>
		</SafeAreaView>
	);
}
