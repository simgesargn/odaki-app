import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingIntro from "../screens/onboarding/OnboardingIntro";
import OnboardingPermissions from "../screens/onboarding/OnboardingPermissions";
import OnboardingFinish from "../screens/onboarding/OnboardingFinish";
import { Routes } from "./routes";

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name={Routes.OnboardingIntro} component={OnboardingIntro} />
			<Stack.Screen name={Routes.OnboardingPermissions} component={OnboardingPermissions} />
			<Stack.Screen name={Routes.OnboardingFinish} component={OnboardingFinish} />
		</Stack.Navigator>
	);
}
