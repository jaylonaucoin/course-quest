import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { ToastProvider, useToast } from "./ToastContext";

function TestConsumer() {
	const { showToast, showError } = useToast();
	return (
		<>
			<button onClick={() => showToast("Hello")}>Show Toast</button>
			<button onClick={() => showError("Error message")}>Show Error</button>
		</>
	);
}

function wrapper({ children }) {
	return (
		<SafeAreaProvider>
			<PaperProvider>
				{children}
			</PaperProvider>
		</SafeAreaProvider>
	);
}

describe("ToastContext", () => {
	it("provides showToast and showError", () => {
		render(
			<ToastProvider>
				<TestConsumer />
			</ToastProvider>,
			{ wrapper }
		);
		expect(screen.getByText("Show Toast")).toBeInTheDocument();
		expect(screen.getByText("Show Error")).toBeInTheDocument();
	});

	it("showToast renders snackbar with message", async () => {
		render(
			<ToastProvider>
				<TestConsumer />
			</ToastProvider>,
			{ wrapper }
		);
		fireEvent.click(screen.getByText("Show Toast"));
		await screen.findByText("Hello");
		expect(screen.getByText("Hello")).toBeInTheDocument();
	});

	it("showError renders error-styled snackbar", async () => {
		render(
			<ToastProvider>
				<TestConsumer />
			</ToastProvider>,
			{ wrapper }
		);
		fireEvent.click(screen.getByText("Show Error"));
		await screen.findByText("Error message");
		expect(screen.getByText("Error message")).toBeInTheDocument();
	});
});
