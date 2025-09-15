import React, { createContext, useContext, useEffect, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";

const dark = {
	dark: true,
	colors: {
		primary: "rgb(130, 218, 143)",
		onPrimary: "rgb(0, 57, 21)",
		primaryContainer: "rgb(0, 83, 33)",
		onPrimaryContainer: "rgb(158, 246, 169)",
		secondary: "rgb(184, 204, 182)",
		onSecondary: "rgb(36, 52, 37)",
		secondaryContainer: "rgb(58, 75, 58)",
		onSecondaryContainer: "rgb(212, 232, 209)",
		tertiary: "rgb(161, 206, 215)",
		onTertiary: "rgb(0, 54, 61)",
		tertiaryContainer: "rgb(31, 77, 84)",
		onTertiaryContainer: "rgb(189, 234, 243)",
		error: "rgb(255, 180, 171)",
		onError: "rgb(105, 0, 5)",
		errorContainer: "rgb(147, 0, 10)",
		onErrorContainer: "rgb(255, 180, 171)",
		background: "rgb(26, 28, 25)",
		onBackground: "rgb(226, 227, 221)",
		surface: "rgb(26, 28, 25)",
		onSurface: "rgb(226, 227, 221)",
		surfaceVariant: "rgb(65, 73, 65)",
		onSurfaceVariant: "rgb(193, 201, 190)",
		outline: "rgb(139, 147, 137)",
		outlineVariant: "rgb(65, 73, 65)",
		shadow: "rgb(0, 0, 0)",
		scrim: "rgb(0, 0, 0)",
		inverseSurface: "rgb(226, 227, 221)",
		inverseOnSurface: "rgb(46, 49, 46)",
		inversePrimary: "rgb(13, 109, 48)",
		elevation: {
			level0: "transparent",
			level1: "rgb(31, 38, 31)",
			level2: "rgb(34, 43, 34)",
			level3: "rgb(37, 49, 38)",
			level4: "rgb(39, 51, 39)",
			level5: "rgb(41, 55, 42)",
		},
		surfaceDisabled: "rgba(226, 227, 221, 0.12)",
		onSurfaceDisabled: "rgba(226, 227, 221, 0.38)",
		backdrop: "rgba(43, 50, 43, 0.4)",
	},
};

const light = {
	dark: false,
	colors: {
		primary: "rgb(13, 109, 48)",
		onPrimary: "rgb(255, 255, 255)",
		primaryContainer: "rgb(158, 246, 169)",
		onPrimaryContainer: "rgb(0, 33, 9)",
		secondary: "rgb(81, 99, 81)",
		onSecondary: "rgb(255, 255, 255)",
		secondaryContainer: "rgb(212, 232, 209)",
		onSecondaryContainer: "rgb(15, 31, 17)",
		tertiary: "rgb(57, 101, 109)",
		onTertiary: "rgb(255, 255, 255)",
		tertiaryContainer: "rgb(189, 234, 243)",
		onTertiaryContainer: "rgb(0, 31, 36)",
		error: "rgb(186, 26, 26)",
		onError: "rgb(255, 255, 255)",
		errorContainer: "rgb(255, 218, 214)",
		onErrorContainer: "rgb(65, 0, 2)",
		background: "rgb(252, 253, 247)",
		onBackground: "rgb(26, 28, 25)",
		surface: "rgb(252, 253, 247)",
		onSurface: "rgb(26, 28, 25)",
		surfaceVariant: "rgb(221, 229, 217)",
		onSurfaceVariant: "rgb(65, 73, 65)",
		outline: "rgb(114, 121, 112)",
		outlineVariant: "rgb(193, 201, 190)",
		shadow: "rgb(0, 0, 0)",
		scrim: "rgb(0, 0, 0)",
		inverseSurface: "rgb(46, 49, 46)",
		inverseOnSurface: "rgb(240, 241, 236)",
		inversePrimary: "rgb(130, 218, 143)",
		elevation: {
			level0: "transparent",
			level1: "rgb(240, 246, 237)",
			level2: "rgb(233, 242, 231)",
			level3: "rgb(226, 237, 225)",
			level4: "rgb(223, 236, 223)",
			level5: "rgb(219, 233, 219)",
		},
		surfaceDisabled: "rgba(26, 28, 25, 0.12)",
		onSurfaceDisabled: "rgba(26, 28, 25, 0.38)",
		backdrop: "rgba(43, 50, 43, 0.4)",
	},
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const systemTheme = useColorScheme(); // Get system theme (light/dark)
	const [themeMode, setThemeMode] = useState(systemTheme || "light"); // Default to system

	// Load saved theme from storage
	useEffect(() => {
		const loadTheme = async () => {
			const savedTheme = await AsyncStorage.getItem("theme");
			if (savedTheme) setThemeMode(savedTheme);
		};
		loadTheme();
	}, []);

	// Save theme to storage whenever it changes
	const toggleTheme = async (mode) => {
		setThemeMode(mode);
		await AsyncStorage.setItem("theme", mode);
	};

	// Define themes
	const theme = themeMode === "dark" ? dark : light;

	return (
		<ThemeContext.Provider value={{ themeMode, toggleTheme }}>
			<PaperProvider theme={theme}>
				<NavigationContainer>
					<StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />
					{children}
				</NavigationContainer>
			</PaperProvider>
		</ThemeContext.Provider>
	);
};

export const useThemeContext = () => useContext(ThemeContext);
