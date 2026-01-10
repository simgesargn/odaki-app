import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AuthStack from "./AuthStack";

const Stack = createNativeStackNavigator();

export default function AuthFlowStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Splash" component={SplashScreen} />
			<Stack.Screen name="Onboarding" component={OnboardingScreen} />
			<Stack.Screen name="AuthStack" component={AuthStack} />
		</Stack.Navigator>
	);
}
