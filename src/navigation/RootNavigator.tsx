import React, { useEffect, useMemo, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import AuthStack from "./AuthStack";
import OnboardingStack from "./OnboardingStack";
import SplashScreen from "../screens/splash/SplashScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import DevQAScreen from "../screens/dev/DevQAScreen";
import { useSession } from "../store/sessionStore";
import { useOnboardingState } from "../store/onboardingStore";
import { Routes } from "./routes";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
	const { userId, loading: sessionLoading } = useSession();
	const { onboardingDone, onboardingLoading } = useOnboardingState();

	const loading = Boolean(sessionLoading || onboardingLoading);

	// Splash timeout to avoid being stuck too long
	const [splashTimeoutOver, setSplashTimeoutOver] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setSplashTimeoutOver(true), 1200);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		console.log("[RootNavigator] state:", { loading, onboardingDone, userId, splashTimeoutOver });
	}, [loading, onboardingDone, userId, splashTimeoutOver]);

	const gate = useMemo(() => {
		// if still loading and timeout not over -> show splash
		if (loading && !splashTimeoutOver) return "SPLASH";
		// otherwise decide gate
		if (!onboardingDone) return "ONBOARDING";
		if (!userId) return "AUTH";
		return "MAIN";
	}, [loading, onboardingDone, userId, splashTimeoutOver]);

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{gate === "SPLASH" && <Stack.Screen name={Routes.Splash} component={SplashScreen} />}
			{gate === "ONBOARDING" && <Stack.Screen name={Routes.Onboarding} component={OnboardingStack} />}
			{gate === "AUTH" && <Stack.Screen name={Routes.AuthStack} component={AuthStack} />}
			{gate === "MAIN" && <Stack.Screen name={Routes.MainStack} component={MainTabs} />}

			{/* modals / global screens always registered so rootNavigate works */}
			<Stack.Screen name={Routes.Notifications} component={NotificationsScreen} />
			<Stack.Screen name={Routes.DevQA} component={DevQAScreen} />
		</Stack.Navigator>
	);
}
