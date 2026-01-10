import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import TasksStack from "./TasksStack";
import FocusStack from "./FocusStack";
import AIScreen from "../screens/AIScreen";
import GardenScreen from "../screens/GardenScreen";
import StatsScreen from "../screens/StatsScreen";
import ProfileStack from "./ProfileStack";
import { theme } from "../ui/theme";
import { Text } from "react-native";
import { Routes } from "./routes";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
	return (
		<Tab.Navigator
			initialRouteName={Routes.HomeTab}
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.colors.primary,
				tabBarStyle: { backgroundColor: "#fff" },
			}}
		>
			<Tab.Screen name={Routes.HomeTab} component={HomeScreen} options={{ tabBarLabel: "Ana Sayfa", tabBarIcon: () => <Text>🏠</Text> }} />
			<Tab.Screen name={Routes.TasksTab} component={TasksStack} options={{ tabBarLabel: "Görevler", tabBarIcon: () => <Text>📝</Text> }} />
			<Tab.Screen name={Routes.FocusTab} component={FocusStack} options={{ tabBarLabel: "Odak", tabBarIcon: () => <Text>⏱️</Text> }} />
			<Tab.Screen name={Routes.AITab} component={AIScreen} options={{ tabBarLabel: "AI", tabBarIcon: () => <Text>🤖</Text> }} />
			<Tab.Screen name={Routes.GardenTab} component={GardenScreen} options={{ tabBarLabel: "Bahçe", tabBarIcon: () => <Text>🌸</Text> }} />
			<Tab.Screen name={Routes.StatsTab} component={StatsScreen} options={{ tabBarLabel: "İstatistik", tabBarIcon: () => <Text>📊</Text> }} />
			<Tab.Screen name={Routes.ProfileTab} component={ProfileStack} options={{ tabBarLabel: "Profil", tabBarIcon: () => <Text>👤</Text> }} />
		</Tab.Navigator>
	);
}
