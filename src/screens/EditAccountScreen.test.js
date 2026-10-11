import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import EditAccountScreen from "./EditAccountScreen";

const mockGetUser = jest.fn();
const mockSetProfileInfo = jest.fn();
const mockPickImage = jest.fn();
const mockSearchGolfCourses = jest.fn();
const mockGetCourseDetails = jest.fn();

jest.mock("../utils/DataController", () => ({
	getUser: () => mockGetUser(),
	setProfileInfo: (...args) => mockSetProfileInfo(...args),
	pickImage: (...args) => mockPickImage(...args),
}));

jest.mock("../utils/APIController", () => ({
	searchGolfCourses: (...args) => mockSearchGolfCourses(...args),
	getCourseDetails: (...args) => mockGetCourseDetails(...args),
}));

jest.mock("../utils/ToastContext", () => ({
	useToast: () => ({ showToast: jest.fn(), showError: jest.fn() }),
}));

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("EditAccountScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetUser.mockResolvedValue({
			firstName: "John",
			lastName: "Doe",
			homeCourse: "Pebble Beach",
			bio: "",
			profilePicture: null,
			city: "Pebble Beach",
			province: "CA",
			country: "USA",
		});
	});

	it("renders Save Changes button", async () => {
		render(<EditAccountScreen />, { wrapper });
		await screen.findByText("Save Changes");
		expect(screen.getByText("Save Changes")).toBeInTheDocument();
	});

	it("calls getUser on mount", async () => {
		render(<EditAccountScreen />, { wrapper });
		await screen.findByText("Save Changes");
		expect(mockGetUser).toHaveBeenCalled();
	});
});
