import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import CustomModal from "./Modal";

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("Modal", () => {
	it("renders children when visible", () => {
		const { getByText } = render(
			<CustomModal visible title="Test Modal" onDismiss={jest.fn()}>
				<p>Modal content</p>
			</CustomModal>,
			{ wrapper },
		);
		expect(getByText("Test Modal")).toBeInTheDocument();
		expect(getByText("Modal content")).toBeInTheDocument();
	});

	it("does not render when not visible", () => {
		const { queryByText } = render(
			<CustomModal visible={false} title="Hidden" onDismiss={jest.fn()}>
				<p>Hidden content</p>
			</CustomModal>,
			{ wrapper },
		);
		expect(queryByText("Hidden")).not.toBeInTheDocument();
		expect(queryByText("Hidden content")).not.toBeInTheDocument();
	});

	it("calls onDismiss when backdrop is pressed", () => {
		const onDismiss = jest.fn();
		const { getByLabelText } = render(
			<CustomModal visible title="Dismiss Test" onDismiss={onDismiss}>
				<p>Content</p>
			</CustomModal>,
			{ wrapper },
		);
		const closeButton = getByLabelText("Close modal");
		fireEvent.click(closeButton);
		expect(onDismiss).toHaveBeenCalled();
	});
});
