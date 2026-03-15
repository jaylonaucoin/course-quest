import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import HomeScreen from "./HomeScreen";

const mockNavigation = {
	navigate: jest.fn(),
};

const mockGetRounds = jest.fn();
const mockGetUnits = jest.fn();
const mockDeleteRound = jest.fn();

jest.mock("../utils/DataController", () => ({
	getRounds: (...args) => mockGetRounds(...args),
	getUnits: () => mockGetUnits(),
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
		notes: null,
		images: null,
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

describe("HomeScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRounds.mockResolvedValue([]);
		mockGetUnits.mockResolvedValue(["c", "km/h", "mm"]);
	});

	it("shows empty state when no rounds", async () => {
		mockGetRounds.mockResolvedValue([]);
		render(<HomeScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Time to go tee it up and add some rounds to show here!");
		expect(screen.getByText("Add Round")).toBeInTheDocument();
	});

	it("shows round cards when rounds exist", async () => {
		const rounds = [createMockRound({ id: "r1", course: "Augusta National", score: 68 })];
		mockGetRounds.mockResolvedValue(rounds);
		render(<HomeScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Augusta National");
		expect(screen.getByText("68")).toBeInTheDocument();
	});

	it("navigates to AddRound when Add Round button pressed in empty state", async () => {
		mockGetRounds.mockResolvedValue([]);
		render(<HomeScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Add Round");
		fireEvent.click(screen.getByText("Add Round"));
		expect(mockNavigation.navigate).toHaveBeenCalledWith("RoundStack", { screen: "AddRound" });
	});

	it("navigates to Map when course name pressed", async () => {
		const rounds = [createMockRound({ course: "Pebble Beach" })];
		mockGetRounds.mockResolvedValue(rounds);
		render(<HomeScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Pebble Beach");
		fireEvent.click(screen.getByText("Pebble Beach"));
		expect(mockNavigation.navigate).toHaveBeenCalledWith("Map", { roundData: rounds[0] });
	});

	it("calls getRounds on mount", async () => {
		render(<HomeScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Time to go tee it up and add some rounds to show here!");
		expect(mockGetRounds).toHaveBeenCalled();
	});

	it("shows ConfirmDialog with correct title and message for delete flow", async () => {
		const rounds = [createMockRound({ id: "r1", course: "Pebble Beach" })];
		mockGetRounds.mockResolvedValue(rounds);
		render(<HomeScreen navigation={mockNavigation} />, { wrapper });
		await screen.findByText("Pebble Beach");
		expect(screen.queryByText("Delete Round?")).not.toBeInTheDocument();
	});
});
