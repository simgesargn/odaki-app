import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FocusScreen from "../screens/FocusScreen";
import FocusSettingsScreen from "../screens/FocusSettingsScreen";
import { Routes } from "./routes";

const Stack = createNativeStackNavigator();

export default function FocusStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name={Routes.FocusHome} component={FocusScreen} />
			<Stack.Screen name={Routes.FocusSettings} component={FocusSettingsScreen} options={{ headerShown: true, title: "Ayarlar" }} />
		</Stack.Navigator>
	);
}
