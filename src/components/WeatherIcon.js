import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";

export default function WeatherIcon({ type, weatherCode = -1, value }) {
	const theme = useTheme();

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
					{value}
				</Text>
				{type === "wind" ? " km/h" : type === "rain" ? " mm" : " °C"}
			</Text>
		</View>
	);
}
