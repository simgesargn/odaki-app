import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SessionProvider } from "./src/store/sessionStore";
import RootNavigator from "./src/navigation/RootNavigator";
import { navigationRef } from "./src/navigation/navigationRef";

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </SessionProvider>
  );
}