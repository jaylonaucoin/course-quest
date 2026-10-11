import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import AddRoundScreen from "./AddRoundScreen";

const mockNavigation = {
	navigate: jest.fn(),
};

const mockAddRound = jest.fn();
const mockPickImage = jest.fn();
const mockSearchGolfCourses = jest.fn();
const mockGetCourseDetails = jest.fn();
const mockGetWeatherData = jest.fn();

jest.mock("../utils/DataController", () => ({
	pickImage: (...args) => mockPickImage(...args),
	addRound: (...args) => mockAddRound(...args),
}));

jest.mock("../utils/APIController", () => ({
	searchGolfCourses: (...args) => mockSearchGolfCourses(...args),
	getCourseDetails: (...args) => mockGetCourseDetails(...args),
	getWeatherData: (...args) => mockGetWeatherData(...args),
}));

jest.mock("../utils/NetworkProvider", () => ({
	useNetwork: () => ({ isOnline: true }),
}));

jest.mock("../utils/ToastContext", () => ({
	useToast: () => ({
		showToast: jest.fn(),
		showError: jest.fn(),
	}),
}));

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("AddRoundScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetCourseDetails.mockResolvedValue({
			latitude: 36.57,
			longitude: -121.95,
			city: "Pebble Beach",
			province: "CA",
			country: "USA",
		});
		mockGetWeatherData.mockResolvedValue({
			temperature: 20,
			rain: 0,
			wind: 15,
			weatherCode: 0,
		});
		mockAddRound.mockResolvedValue(undefined);
		mockPickImage.mockResolvedValue(["file://photo.jpg"]);
	});

	it("renders Add Round title", () => {
		render(<AddRoundScreen navigation={mockNavigation} />, { wrapper });
		expect(screen.getAllByText("Add Round").length).toBeGreaterThan(0);
	});

	it("renders Add Round submit button", () => {
		render(<AddRoundScreen navigation={mockNavigation} />, { wrapper });
		const buttons = screen.getAllByRole("button");
		expect(buttons.some((b) => b.textContent?.includes("Add Round"))).toBe(true);
	});

	it("renders holes toggle with 18 holes, Front 9, Back 9", () => {
		render(<AddRoundScreen navigation={mockNavigation} />, { wrapper });
		expect(screen.getByText("18 holes")).toBeInTheDocument();
		expect(screen.getByText("Front 9")).toBeInTheDocument();
		expect(screen.getByText("Back 9")).toBeInTheDocument();
	});

	it("does not show offline banner when isOnline", () => {
		render(<AddRoundScreen navigation={mockNavigation} />, { wrapper });
		expect(screen.queryByText(/requires internet/i)).not.toBeInTheDocument();
	});
});
