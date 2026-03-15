import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import RoundScreen from "./RoundScreen";

const mockNavigation = {
	navigate: jest.fn(),
};

const mockGetRounds = jest.fn();
const mockDeleteRound = jest.fn();

jest.mock("../utils/DataController", () => ({
	getRounds: (...args) => mockGetRounds(...args),
	deleteRound: (...args) => mockDeleteRound(...args),
}));

jest.mock("../utils/ToastContext", () => ({
	useToast: () => ({
		showToast: jest.fn(),
		showError: jest.fn(),
	}),
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
		useScrollToTop: () => {},
	};
});

function createMockRound(overrides = {}) {
	return {
		id: "r1",
		course: "Pebble Beach",
		score: 72,
		holes: "18 Holes",
		date: { toDate: () => new Date("2024-01-15") },
		weatherCode: 0,
		temp: 20,
		wind: 15,
		rain: 0,
		...overrides,
	};
}

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("RoundScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRounds.mockResolvedValue([]);
	});

	it("shows empty state when no rounds", async () => {
		mockGetRounds.mockResolvedValue([]);
		render(<RoundScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Time to go tee it up and add some rounds to show here!");
		expect(screen.getByText("Add Round")).toBeInTheDocument();
	});

	it("calls getRounds on mount", async () => {
		render(<RoundScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Time to go tee it up and add some rounds to show here!");
		expect(mockGetRounds).toHaveBeenCalled();
	});

	it("navigates to AddRound when Add Round button pressed in empty state", async () => {
		mockGetRounds.mockResolvedValue([]);
		render(<RoundScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Add Round");
		fireEvent.click(screen.getByText("Add Round"));
		expect(mockNavigation.navigate).toHaveBeenCalledWith("AddRound");
	});
});
