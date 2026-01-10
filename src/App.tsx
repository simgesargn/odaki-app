import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SessionProvider } from "./store/sessionStore";
import RootNavigator from "./navigation/RootNavigator";
import { navigationRef } from "./navigation/navigationRef";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
	return (
		<SessionProvider>
			<ErrorBoundary>
				<NavigationContainer ref={navigationRef}>
					<RootNavigator />
				</NavigationContainer>
			</ErrorBoundary>
		</SessionProvider>
	);
}
