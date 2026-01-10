import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";
import type { RootStackParamList } from "./types";
import { Routes } from "./routes";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function isNavigationReady() {
	return navigationRef.isReady();
}

function isValidRouteName(name: string | undefined | null): boolean {
	if (!name || typeof name !== "string") return false;
	return Object.values(Routes).includes(name);
}

/**
 * rootNavigate: accepts either a string name or an object { name, params }.
 * It asserts the name exists in Routes before navigating (dev-safety).
 */
export function rootNavigate(nameOrObj: string | { name?: string; params?: any }, params?: any) {
	let name: any = nameOrObj;
	let p = params;

	if (typeof nameOrObj === "object" && nameOrObj !== null) {
		name = (nameOrObj as any).name;
		p = (nameOrObj as any).params ?? params;
	}

	if (!isValidRouteName(name)) {
		console.error("[rootNavigate] Attempt to navigate to undefined route:", name, " — Allowed:", Object.values(Routes));
		return;
	}

	if (navigationRef.isReady()) {
		navigationRef.navigate(name as any, p as any);
	} else {
		console.warn("[rootNavigate] navigationRef not ready yet, skipped navigate to", name);
	}
}

export function rootPush(name: keyof RootStackParamList | string, params?: any) {
	if (!isValidRouteName(name as string)) {
		console.error("[rootPush] invalid route:", name);
		return;
	}
	if (navigationRef.isReady()) navigationRef.dispatch(CommonActions.navigate({ name: name as any, params }));
}

export function rootReplace(name: keyof RootStackParamList | string, params?: any) {
	if (!isValidRouteName(name as string)) {
		console.error("[rootReplace] invalid route:", name);
		return;
	}
	if (navigationRef.isReady()) navigationRef.dispatch(CommonActions.replace(name as any, params));
}

export function rootReset(name: keyof RootStackParamList | string, params?: any) {
	if (!isValidRouteName(name as string)) {
		console.error("[rootReset] invalid route:", name);
		return;
	}
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: name as any, params }],
			})
		);
	}
}

export function rootGoBack() {
	if (navigationRef.isReady() && navigationRef.canGoBack()) navigationRef.goBack();
}