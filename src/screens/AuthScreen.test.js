import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import AuthScreen from "./AuthScreen";

const mockNavigation = {
	replace: jest.fn(),
	reset: jest.fn(),
	navigate: jest.fn(),
};

jest.mock("../utils/ToastContext", () => ({
	useToast: () => ({
		showToast: jest.fn(),
		showError: jest.fn(),
	}),
}));

jest.mock("firebase/auth");

jest.mock("../utils/DataController", () => ({
	setUser: jest.fn(),
}));

jest.mock("../utils/APIController", () => ({
	searchGolfCourses: jest.fn(),
	getCourseDetails: jest.fn(),
}));

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("AuthScreen", () => {
	it("renders login view by default", () => {
		const { getAllByText } = render(<AuthScreen navigation={mockNavigation} />, { wrapper });
		expect(getAllByText("Sign In").length).toBeGreaterThan(0);
	});

	it("renders Register view when toggled", () => {
		const { getAllByText, getByPlaceholderText } = render(<AuthScreen navigation={mockNavigation} />, { wrapper });
		const registerSegments = getAllByText("Register");
		fireEvent.click(registerSegments[0]);
		expect(getByPlaceholderText("First Name")).toBeInTheDocument();
	});
});
