export const Routes = {
	// root / stacks
	Splash: "Splash",

	// onboarding stack (stack key)
	Onboarding: "Onboarding",
	// onboarding inner screens (unique)
	OnboardingIntro: "OnboardingIntro",
	OnboardingPermissions: "OnboardingPermissions",
	OnboardingFinish: "OnboardingFinish",

	// auth / main stacks
	AuthStack: "AuthStack",
	MainStack: "MainStack",

	// main tabs
	HomeTab: "HomeTab",
	TasksTab: "TasksTab",
	FocusTab: "FocusTab",
	AITab: "AITab",
	GardenTab: "GardenTab",
	StatsTab: "StatsTab",
	ProfileTab: "ProfileTab",

	// focus inner screens (added)
	FocusHome: "FocusHome",
	FocusSettings: "FocusSettings",

	// tasks stack
	TasksHome: "TasksHome",
	TasksNew: "TasksNew",
	TasksDetail: "TasksDetail",

	// profile stack
	ProfileHome: "ProfileHome",
	ProfileSettings: "ProfileSettings",
	ProfileAchievements: "ProfileAchievements",
	ProfileFriends: "ProfileFriends",
	ProfileGarden: "ProfileGarden",

	// auth
	Welcome: "Welcome",
	Login: "Login",
	Register: "Register",
	Forgot: "Forgot",
	Terms: "Terms",
	Privacy: "Privacy",
	SocialSim: "SocialSim",

	// misc
	Notifications: "Notifications",
	DevQA: "DevQA",

	// ai logs
	AiLogs: "ai_logs",
} as const;
