import React, { useEffect } from "react";
import tasksStore from "./tasksStore";

export default function TasksProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// initialize cache once
		(async () => {
			try {
				await tasksStore.getTasks("local");
			} catch (e) {
				console.warn("[TasksProvider] init err", e);
			}
		})();
	}, []);
	return <>{children}</>;
}
