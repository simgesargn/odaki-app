import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import Pill from "../../components/Pill";
import tasksStore from "../../store/tasksStore";
import { useSession } from "../../store/sessionStore";

export default function NewTaskScreen({ navigation }: any) {
	const { userId } = useSession();
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [category, setCategory] = useState("İş");
	const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
	const [date, setDate] = useState<string>("");
	const [time, setTime] = useState<string>("");
	const [shared, setShared] = useState(false);
	const [loading, setLoading] = useState(false);

	const categories = ["Ders", "İş", "Kişisel", "Alışveriş", "Sağlık"];

	async function onSave() {
		if (!title.trim()) return Alert.alert("Uyarı", "Başlık gerekli.");
		setLoading(true);
		try {
			// local store
			await tasksStore.addTask({ title: title.trim(), desc: desc.trim(), category, priority, date, time, status: "active" }, userId || "local");
			Alert.alert("Başarılı", "Görev oluşturuldu.");
			navigation.goBack();
		} catch (err) {
			Alert.alert("Hata", "Görev oluşturulamadı.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView style={{ padding: 16 }}>
				<Card>
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
						<Text style={{ fontWeight: "700", fontSize: 18 }}>Yeni Görev</Text>
						<TouchableOpacity onPress={onSave}><Text style={{ color: "#2563eb", fontWeight: "700" }}>Kaydet</Text></TouchableOpacity>
					</View>

					<TextInput placeholder="Başlık" value={title} onChangeText={setTitle} style={styles.input} />
					<TextInput placeholder="Açıklama" value={desc} onChangeText={setDesc} style={[styles.input, { height: 80 }]} multiline />

					<Text style={{ marginTop: 8, fontWeight: "700" }}>Kategori</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
						{categories.map((c) => <Pill key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
					</View>

					<Text style={{ marginTop: 12, fontWeight: "700" }}>Öncelik</Text>
					<View style={{ flexDirection: "row", marginTop: 8 }}>
						<Pill label="Düşük" selected={priority === "low"} onPress={() => setPriority("low")} />
						<Pill label="Orta" selected={priority === "medium"} onPress={() => setPriority("medium")} />
						<Pill label="Yüksek" selected={priority === "high"} onPress={() => setPriority("high")} />
					</View>

					<Text style={{ marginTop: 12, fontWeight: "700" }}>Tarih & Saat</Text>
					<TextInput placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} style={styles.input} />
					<TextInput placeholder="HH:MM" value={time} onChangeText={setTime} style={styles.input} />

					<View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
						<Switch value={shared} onValueChange={setShared} />
						<Text style={{ marginLeft: 8 }}>Arkadaşlarımla paylaş</Text>
					</View>

					<View style={{ marginTop: 12 }}>
						<PrimaryButton title="Görev Oluştur" onPress={onSave} />
					</View>
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	input: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: "#eee" },
});
