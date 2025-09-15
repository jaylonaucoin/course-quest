import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { getUnits } from "../utils/DataController";
import { useState, useEffect, useCallback } from "react";
import {
	convertTemperature,
	convertWindSpeed,
	convertPrecipitation,
	formatValueWithPrecision,
} from "../utils/UnitConverter";

export default function WeatherIcon({ type, weatherCode = -1, value }) {
	const theme = useTheme();
	const [tempUnit, setTempUnit] = useState("");
	const [windUnit, setWindUnit] = useState("");
	const [rainUnit, setRainUnit] = useState("");
	const [displayValue, setDisplayValue] = useState(value || 0);

	// Define handleUnitChange with useCallback to prevent re-creation on each render
	const handleUnitChange = useCallback(
		(units) => {
			if (!units) return;

			const [temp, wind, rain] = units;

			// Set unit display texts
			setTempUnit(temp === "celsius" ? "°C" : "°F");
			setWindUnit(wind === "kilometers" ? "km/h" : "mph");
			setRainUnit(rain === "millimeters" ? "mm" : "in");

			// Ensure value is a valid number
			const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

			// Convert values based on unit type
			if (type === "temperature") {
				const converted =
					temp === "fahrenheit" ? convertTemperature(safeValue, "celsius", "fahrenheit") : safeValue;
				setDisplayValue(formatValueWithPrecision(converted, "temperature"));
			} else if (type === "wind") {
				const converted = wind === "miles" ? convertWindSpeed(safeValue, "kilometers", "miles") : safeValue;
				setDisplayValue(formatValueWithPrecision(converted, "wind"));
			} else if (type === "rain") {
				const converted =
					rain === "inches" ? convertPrecipitation(safeValue, "millimeters", "inches") : safeValue;
				setDisplayValue(formatValueWithPrecision(converted, "precipitation"));
			}
		},
		[value, type],
	);

	useEffect(() => {
		// Force component re-render when value or type changes
		setDisplayValue(null); // Reset to trigger refresh

		// Re-fetch units
		getUnits().then((units) => {
			if (!units) return;

			handleUnitChange(units);
		});
	}, [value, type, handleUnitChange]);

	const getWeatherIcon = () => {
		switch (weatherCode) {
			case 0: // Clear sky
				return "sunny";
			case 1: // Partly cloudy
				return "partly-sunny";
			case 2: // Cloudy
			case 3:
			case 45: // Fog or mist
			case 48:
				return "cloud";
			case 51: // Light drizzle
			case 53:
			case 55:
				return "rainy";
			case 56: // Freezing drizzle
			case 57:
				return "snow";
			case 61: // Light rain
			case 63:
			case 65:
				return "rainy";
			case 66: // Freezing rain
			case 67:
				return "snow";
			case 71: // Light snow
			case 73:
			case 75:
				return "snow";
			case 77: // Snow grains
				return "snow";
			case 80: // Showers
			case 81:
			case 82:
				return "rainy";
			case 85: // Snow showers
			case 86:
				return "snow";
			case 95: // Thunderstorms
				return "thunderstorm";
			case 96: // Thunderstorms with hail
			case 99:
				return "thunderstorm";
			default:
				return "partly-sunny"; // Default unknown weather
		}
	};
	return (
		<View
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-around",
				padding: 5,
			}}>
			{type === "wind" ? (
				<FontAwesome5 name="wind" size={26} color={theme.colors.onSurfaceVariant} />
			) : type === "rain" ? (
				<FontAwesome6 name="droplet" size={26} color={theme.colors.onSurfaceVariant} />
			) : (
				<Ionicons name={getWeatherIcon()} size={26} color={theme.colors.onSurfaceVariant} />
			)}
			<Text variant="labelMedium">
				<Text variant="labelMedium" style={{ fontWeight: "bold" }}>
					{displayValue}{" "}
				</Text>
				{type === "wind" ? windUnit : type === "rain" ? rainUnit : tempUnit}
			</Text>
		</View>
	);
}
