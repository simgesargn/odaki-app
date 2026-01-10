// ...existing imports...
import { getSafeGradient } from "../../utils/getSafeGradient";
import { colors } from "../../theme/colors";
import { Routes } from "../../navigation/routes";
import { ActionButton } from "../components/ActionButton";
import DecorativeBackground from "../../components/DecorativeBackground";
// ...existing code...

return (
	<SafeAreaView style={{ flex: 1 }}>
		<DecorativeBackground />
		<LinearGradient colors={getSafeGradient(colors.gradient.main)} style={{ padding: 20 }}>
			<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<TouchableOpacity onPress={() => { /* hamburger placeholder */ }}><Text style={{ color: "#fff" }}>☰</Text></TouchableOpacity>

				<TouchableOpacity onPress={() => setEmojiPickerVisible(true)} style={{ alignItems: "center" }}>
					{/* ...avatar... */}
					<Text style={{ color: "#fff", fontWeight: "800", marginTop: 8 }}>
						{user?.username ?? user?.fullName ?? user?.email ?? "Kullanıcı"}
					</Text>
				</TouchableOpacity>

				{/* Düzeltilmiş: Settings -> ProfileSettings */}
				<ActionButton title="Ayarlar" onPress={() => navigation.navigate(Routes.ProfileSettings)} kind="secondary" />
			</View>
		</LinearGradient>

		{/* ...rest... */}
	</SafeAreaView>
);
