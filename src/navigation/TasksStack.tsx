import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksListScreen from "../screens/tasks/TasksListScreen";
import TaskDetailScreen from "../screens/tasks/TaskDetailScreen";
import NewTaskScreen from "../screens/tasks/NewTaskScreen";
import { Routes } from "./routes";

const Stack = createNativeStackNavigator();

export default function TasksStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name={Routes.TasksHome} component={TasksListScreen} />
			<Stack.Screen name={Routes.TasksDetail} component={TaskDetailScreen} options={{ headerShown: true, title: "Görev Detayı" }} />
			<Stack.Screen name={Routes.TasksNew} component={NewTaskScreen} options={{ headerShown: true, title: "Yeni Görev" }} />
		</Stack.Navigator>
	);
}
