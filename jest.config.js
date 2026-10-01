const sharedConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		".*firebaseConfig$": "<rootDir>/__mocks__/firebaseConfig.js",
		"react-native-dotenv": "<rootDir>/__mocks__/react-native-dotenv.js",
		"@expo/vector-icons/FontAwesome5": "<rootDir>/__mocks__/@expo/vector-icons.js",
		"@expo/vector-icons/MaterialIcons": "<rootDir>/__mocks__/@expo/vector-icons.js",
		"@expo/vector-icons/Ionicons": "<rootDir>/__mocks__/@expo/vector-icons.js",
	},
	testMatch: [
		"**/__tests__/**/*.[jt]s?(x)",
		"**/?(*.)+(spec|test).[jt]s?(x)",
	],
	collectCoverageFrom: [
		"src/**/*.{js,jsx}",
		"!src/**/*.test.{js,jsx}",
		"!**/node_modules/**",
	],
};

module.exports = {
	projects: [
		{
			...sharedConfig,
			displayName: "node",
			preset: "jest-expo/node",
			testMatch: [
				"<rootDir>/src/utils/**/*.test.[jt]s?(x)",
			],
			testPathIgnorePatterns: [
				"ThemeProvider.test",
				"NetworkProvider.test",
				"ToastContext.test",
			],
			testEnvironment: "node",
		},
		{
			...sharedConfig,
			displayName: "react-native",
			preset: "jest-expo/web",
			testMatch: [
				"<rootDir>/src/components/**/*.test.[jt]s?(x)",
				"<rootDir>/src/screens/**/*.test.[jt]s?(x)",
				"<rootDir>/src/utils/ThemeProvider.test.[jt]s?(x)",
				"<rootDir>/src/utils/NetworkProvider.test.[jt]s?(x)",
				"<rootDir>/src/utils/ToastContext.test.[jt]s?(x)",
			],
		},
	],
};
