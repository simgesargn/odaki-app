export type MainTabsParamList = {
	HomeTab: undefined;
	TasksTab: undefined;
	FocusTab: undefined;
	AITab: undefined;
	GardenTab: undefined;
	StatsTab: undefined;
	ProfileTab: undefined;
};

export type RootStackParamList = {
	Splash: undefined;
	Onboarding: undefined;
	AuthStack: undefined;
	MainStack: undefined;
	Notifications: undefined;
	DevQA: undefined;
	// task/profile stack inner screens (optional params)
	TasksHome: undefined;
	TasksNew: undefined;
	TasksDetail: { taskId?: string } | undefined;
	ProfileHome: undefined;
	ProfileSettings: undefined;
	ProfileAchievements: undefined;
	ProfileFriends: undefined;
	ProfileGarden: undefined;
};
