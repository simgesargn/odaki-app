import React, { createContext, useContext, useReducer } from "react";

type Task = { id: string; title: string };
type State = {
	premium: boolean;
	tasks: Task[];
	focusedTaskId?: string | null;
	// Yeni: oturum açmış kullanıcının id'si
	userId?: string | null;
};

type Action =
	| { type: "SET_PREMIUM"; payload: boolean }
	| { type: "ADD_TASK"; payload: Task }
	| { type: "SET_FOCUSED_TASK"; payload?: string | null }
	| { type: "SET_USER"; payload?: string | null };

const initialState: State = {
	premium: false,
	tasks: [],
	focusedTaskId: null,
	userId: null,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "SET_PREMIUM":
			return { ...state, premium: action.payload };
		case "ADD_TASK":
			return { ...state, tasks: [...state.tasks, action.payload] };
		case "SET_FOCUSED_TASK":
			return { ...state, focusedTaskId: action.payload ?? null };
		case "SET_USER":
			return { ...state, userId: action.payload ?? null };
		default:
			return state;
	}
}

const AppStateContext = createContext<{
	state: State;
	dispatch: React.Dispatch<Action>;
}>({
	state: initialState,
	dispatch: () => null,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
	return useContext(AppStateContext);
}
