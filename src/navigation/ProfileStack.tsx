import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import AchievementsScreen from "../screens/achievements/AchievementsScreen";
import FriendsScreen from "../screens/FriendsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import GardenScreen from "../screens/GardenScreen";
import { Routes } from "./routes";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name={Routes.ProfileHome} component={ProfileScreen} />
			<Stack.Screen name={Routes.ProfileAchievements} component={AchievementsScreen} options={{ headerShown: true, title: "Başarılar" }} />
			<Stack.Screen name={Routes.ProfileFriends} component={FriendsScreen} options={{ headerShown: true, title: "Arkadaşlar" }} />
			<Stack.Screen name={Routes.ProfileSettings} component={SettingsScreen} options={{ headerShown: true, title: "Ayarlar" }} />
			<Stack.Screen name={Routes.ProfileGarden} component={GardenScreen} options={{ headerShown: true, title: "Bahçem" }} />
		</Stack.Navigator>
	);
}
