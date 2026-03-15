import React from "react";
import SettingsScreen from "./SettingsScreen";

jest.mock("firebase/auth", () => ({
	getAuth: () => ({ currentUser: { uid: "test-uid" } }),
	signOut: jest.fn(),
	sendEmailVerification: jest.fn(),
	verifyBeforeUpdateEmail: jest.fn(),
	updatePassword: jest.fn(),
	deleteUser: jest.fn(),
}));

jest.mock("../utils/ThemeProvider", () => ({
	useThemeContext: () => ({
		themeMode: "light",
		toggleTheme: jest.fn(),
	}),
}));

jest.mock("../hooks/useReauthentication", () => ({
	useReauthentication: () => ({
		openReauth: jest.fn(),
		ReauthModal: () => null,
	}),
}));

jest.mock("../utils/DataController", () => ({
	setUnits: jest.fn(),
	getUnits: jest.fn().mockResolvedValue(["celsius", "kilometers", "millimeters"]),
}));

jest.mock("../utils/ToastContext", () => ({
	useToast: () => ({ showToast: jest.fn(), showError: jest.fn() }),
}));

describe("SettingsScreen", () => {
	it("exports a component", () => {
		expect(typeof SettingsScreen).toBe("function");
	});
});
