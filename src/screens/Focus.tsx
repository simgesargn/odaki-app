import React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Routes } from "../navigation/routes";

type Props = NativeStackScreenProps<any, any>;

export default function Focus({ navigation }: Props) {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Focus ekranı</Text>
			<Button title="Ayarlar" onPress={() => navigation.navigate(Routes.FocusSettings)} />
		</View>
	);
}
