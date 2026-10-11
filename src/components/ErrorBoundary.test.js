import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import ErrorBoundary from "./ErrorBoundary";

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

const ThrowError = () => {
	throw new Error("Test error");
};

describe("ErrorBoundary", () => {
	beforeEach(() => {
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

	it("renders children normally", () => {
		const { getByText } = render(
			<ErrorBoundary>
				<p>Child content</p>
			</ErrorBoundary>,
			{ wrapper },
		);
		expect(getByText("Child content")).toBeInTheDocument();
	});

	it("catches error and renders fallback UI", () => {
		const { getByText } = render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
			{ wrapper },
		);
		expect(getByText("Something went wrong")).toBeInTheDocument();
		expect(getByText(/unexpected error occurred/)).toBeInTheDocument();
	});

	it("Retry button resets the boundary", () => {
		const { getByText } = render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
			{ wrapper },
		);
		const retryButton = getByText("Retry");
		fireEvent.click(retryButton);
		expect(getByText("Retry")).toBeInTheDocument();
	});
});
