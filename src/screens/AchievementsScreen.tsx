import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, FlatList } from "react-native";
import Card from "../components/Card";
import Pill from "../components/Pill";

const TABS = ["Tümü", "Görevler", "Odak", "Sosyal", "Seri", "Özel"];

const SAMPLE = [
	{ id: "a1", title: "İlk Görev", progress: 1, total: 1, rarity: "Yaygın" },
	{ id: "a2", title: "5 Gün Seri", progress: 3, total: 5, rarity: "Nadir" },
];

export default function AchievementsScreen() {
	const [tab, setTab] = useState("Tümü");
	return (
		<SafeAreaView style={{ flex: 1, padding: 16 }}>
			<View style={{ flexDirection: "row", marginBottom: 12 }}>
				{TABS.map((t) => <Pill key={t} label={t} active={tab === t} onPress={() => setTab(t)} />)}
			</View>

			<FlatList data={SAMPLE} keyExtractor={(i) => i.id} renderItem={({ item }) => (
				<Card style={{ marginTop: 12 }}>
					<Text style={{ fontWeight: "700" }}>{item.title} <Text style={{ fontSize: 12, color: "#666" }}>({item.rarity})</Text></Text>
					<Text style={{ marginTop: 8 }}>Durum: {item.progress}/{item.total}</Text>
				</Card>
			)} />
		</SafeAreaView>
	);
}
