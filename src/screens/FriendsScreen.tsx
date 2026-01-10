import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import friendsStore, { Friend } from "../store/friendsStore";

export default function FriendsScreen() {
	const [query, setQuery] = useState("");
	const [list, setList] = useState<Friend[]>([]);

	async function load() {
		const f = await friendsStore.getFriends();
		setList(f);
	}

	useEffect(() => {
		load();
		const unsub = friendsStore.subscribe(() => load());
		return () => unsub();
	}, []);

	return (
		<SafeAreaView style={{ flex: 1, padding: 16 }}>
			<Card>
				<Text style={{ fontWeight: "700" }}>Arkadaşlar</Text>
				<TextInput placeholder="Kullanıcı adı veya e‑posta ara" value={query} onChangeText={setQuery} style={{ marginTop: 8, backgroundColor: "#fff", padding: 8, borderRadius: 8 }} />
			</Card>

			<View style={{ marginTop: 12 }}>
				<PrimaryButton title="Arkadaş Ekle" onPress={() => alert("Arkadaş ekleme simülasyonu")} />
			</View>

			{list.length === 0 ? (
				<Card style={{ marginTop: 12 }}><Text>Henüz arkadaşınız yok. Arkadaş ekleyin.</Text></Card>
			) : (
				<FlatList data={list} keyExtractor={(i) => i.id} renderItem={({ item }) => <Card style={{ marginTop: 12 }}><Text>{item.name} • {item.status}</Text></Card>} />
			)}
		</SafeAreaView>
	);
}
