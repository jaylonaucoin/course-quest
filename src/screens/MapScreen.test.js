import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import MapScreen from "./MapScreen";

const mockGetRounds = jest.fn();
const mockGetUnits = jest.fn();

jest.mock("../utils/DataController", () => ({
	getRounds: (...args) => mockGetRounds(...args),
	getUnits: () => mockGetUnits(),
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

describe("MapScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRounds.mockResolvedValue([]);
		mockGetUnits.mockResolvedValue(["c", "km/h", "mm"]);
	});

	it("calls getRounds on mount", async () => {
		const mockRoute = { params: {} };
		render(<MapScreen route={mockRoute} />, { wrapper });
		expect(mockGetRounds).toHaveBeenCalled();
	});
});
