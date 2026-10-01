import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import AccountScreen from "./AccountScreen";

const mockNavigation = {
	navigate: jest.fn(),
};

const mockGetUser = jest.fn();
const mockGetRounds = jest.fn();

jest.mock("../utils/DataController", () => ({
	getUser: () => mockGetUser(),
	getRounds: (...args) => mockGetRounds(...args),
}));

jest.mock("../utils/ToastContext", () => ({
	useToast: () => ({ showToast: jest.fn(), showError: jest.fn() }),
}));

jest.mock("@react-navigation/native", () => {
	const React = require("react");
	const actual = jest.requireActual("@react-navigation/native");
	return {
		...actual,
		useFocusEffect: (callback) => {
			React.useEffect(() => {
				const cleanup = typeof callback === "function" ? callback() : undefined;
				return typeof cleanup === "function" ? cleanup : undefined;
			}, []);
		},
	};
});

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("AccountScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetUser.mockResolvedValue({
			firstName: "John",
			lastName: "Doe",
			profilePicture: null,
			homeCourse: "Pebble Beach",
		});
		mockGetRounds.mockResolvedValue([]);
	});

	it("renders Edit Profile button", async () => {
		render(<AccountScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Edit Profile");
		expect(screen.getByText("Edit Profile")).toBeInTheDocument();
	});

	it("calls getUser on mount", async () => {
		render(<AccountScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Edit Profile");
		expect(mockGetUser).toHaveBeenCalled();
	});
});
