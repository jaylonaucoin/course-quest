import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useThemeContext } from "./ThemeProvider";

jest.mock("react-native", () => ({
	...jest.requireActual("react-native"),
	StatusBar: () => null,
	useColorScheme: () => "light",
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn().mockResolvedValue(null),
	setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-navigation/native", () => ({
	NavigationContainer: ({ children }) => children,
}));

function TestConsumer() {
	const { themeMode, toggleTheme } = useThemeContext();
	return (
		<>
			<span data-testid="theme-mode">{themeMode}</span>
			<button onClick={() => toggleTheme("dark")}>Toggle Dark</button>
			<button onClick={() => toggleTheme("light")}>Toggle Light</button>
		</>
	);
}

function wrapper({ children }) {
	return (
		<ThemeProvider>
			{children}
		</ThemeProvider>
	);
}

describe("ThemeProvider", () => {
	it("provides default theme from system preference", async () => {
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>
		);
		await screen.findByTestId("theme-mode");
		expect(screen.getByTestId("theme-mode").textContent).toMatch(/light|dark/);
	});

	it("exposes toggleTheme function", async () => {
		render(
			<ThemeProvider>
				<TestConsumer />
			</ThemeProvider>
		);
		expect(screen.getByText("Toggle Dark")).toBeInTheDocument();
		expect(screen.getByText("Toggle Light")).toBeInTheDocument();
	});
});
