import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import EditRoundScreen from "./EditRoundScreen";

const mockRoundData = {
	id: "r1",
	course: "Pebble Beach",
	score: 72,
	holes: "18 holes",
	date: { toDate: () => new Date("2024-01-15") },
	notes: "Great round",
	tees: "Blue",
	images: [],
	lat: 36.57,
	lon: -121.95,
	temp: 20,
	rain: 0,
	wind: 15,
	weatherCode: 0,
};

const mockRoute = {
	params: { roundData: mockRoundData },
};

const mockGetRound = jest.fn();
const mockUpdateRound = jest.fn();
const mockPickImage = jest.fn();
const mockRemoveImage = jest.fn();

jest.mock("../utils/DataController", () => ({
	getRound: (...args) => mockGetRound(...args),
	updateRound: (...args) => mockUpdateRound(...args),
	pickImage: (...args) => mockPickImage(...args),
	removeImage: (...args) => mockRemoveImage(...args),
}));

jest.mock("../utils/APIController", () => ({
	searchGolfCourses: jest.fn(),
	getCourseDetails: jest.fn().mockResolvedValue({ latitude: 36.57, longitude: -121.95 }),
	getWeatherData: jest.fn().mockResolvedValue({ temperature: 20, rain: 0, wind: 15, weatherCode: 0 }),
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

jest.mock("@react-navigation/native", () => ({
	...jest.requireActual("@react-navigation/native"),
	useNavigation: () => ({ navigate: jest.fn() }),
}));

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("EditRoundScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRound.mockResolvedValue(mockRoundData);
	});

	it("renders Edit Round title", async () => {
		render(<EditRoundScreen route={mockRoute} />, { wrapper });
		await screen.findByText("Edit Round");
		expect(screen.getByText("Edit Round")).toBeInTheDocument();
	});

	it("calls getRound with round id on mount", async () => {
		render(<EditRoundScreen route={mockRoute} />, { wrapper });
		await screen.findByText("Edit Round");
		expect(mockGetRound).toHaveBeenCalledWith("r1");
	});

	it("renders Update Round button", async () => {
		render(<EditRoundScreen route={mockRoute} />, { wrapper });
		await screen.findByText("Update Round");
		expect(screen.getByText("Update Round")).toBeInTheDocument();
	});
});
