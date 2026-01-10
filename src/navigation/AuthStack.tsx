import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import SocialSimScreen from "../screens/auth/SocialSimScreen";
import TermsScreen from "../screens/legal/TermsScreen";
import PrivacyScreen from "../screens/legal/PrivacyScreen";
import { Routes } from "./routes";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name={Routes.Welcome} component={WelcomeScreen} />
			<Stack.Screen name={Routes.Login} component={LoginScreen} />
			<Stack.Screen name={Routes.Register} component={RegisterScreen} />
			<Stack.Screen name={Routes.Forgot} component={ForgotPasswordScreen} />
			<Stack.Screen name={Routes.SocialSim} component={SocialSimScreen} />
			<Stack.Screen name={Routes.Terms} component={TermsScreen} />
			<Stack.Screen name={Routes.Privacy} component={PrivacyScreen} />
		</Stack.Navigator>
	);
}
