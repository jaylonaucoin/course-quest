import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider as PaperProvider } from "react-native-paper";
import ConfirmDialog from "./ConfirmDialog";

function wrapper({ children }) {
	return <PaperProvider>{children}</PaperProvider>;
}

describe("ConfirmDialog", () => {
	it("renders title and message", () => {
		const { getByText } = render(
			<ConfirmDialog
				visible
				onDismiss={jest.fn()}
				onConfirm={jest.fn()}
				title="Delete Round"
				message="Are you sure?"
			/>,
			{ wrapper },
		);
		expect(getByText("Delete Round")).toBeInTheDocument();
		expect(getByText("Are you sure?")).toBeInTheDocument();
	});

	it("calls onConfirm when Confirm button pressed", () => {
		const onConfirm = jest.fn();
		const { getAllByText } = render(
			<ConfirmDialog
				visible
				onDismiss={jest.fn()}
				onConfirm={onConfirm}
				title="Delete"
				message="Sure?"
				confirmLabel="Delete"
			/>,
			{ wrapper },
		);
		const deleteElements = getAllByText("Delete");
		const confirmButton = deleteElements.find((el) => el.tagName === "BUTTON" || el.closest("button"));
		fireEvent.click(confirmButton || deleteElements[deleteElements.length - 1]);
		expect(onConfirm).toHaveBeenCalled();
	});

	it("calls onDismiss when Cancel button pressed", () => {
		const onDismiss = jest.fn();
		const { getByText } = render(
			<ConfirmDialog
				visible
				onDismiss={onDismiss}
				onConfirm={jest.fn()}
				title="Delete"
				message="Sure?"
			/>,
			{ wrapper },
		);
		fireEvent.click(getByText("Cancel"));
		expect(onDismiss).toHaveBeenCalled();
	});
});
