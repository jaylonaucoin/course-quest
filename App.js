import "react-native-get-random-values";
import "./global.css";
import { useEffect } from "react";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import AuthScreen from "./src/screens/AuthScreen";
import TabNavigator from "./src/utils/TabNavigator";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppRegistry } from "react-native";
import appConfig from "./app.json";
import { ThemeProvider } from "./src/utils/ThemeProvider";

const appName = appConfig.expo.name;

const Stack = createStackNavigator();

export default function App() {
	useEffect(() => {
		(async () => {
			// Request Location Permissions
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Location permission denied");
				return;
			}

			// Request Camera Permission
			await Camera.requestCameraPermissionsAsync();

			// Request Microphone Permission
			await Audio.requestPermissionsAsync();
		})();
	}, []);

	return (
		<ThemeProvider>
			<Stack.Navigator id="stack-navigator">
				<Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
				<Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
			</Stack.Navigator>
		</ThemeProvider>
	);
}

AppRegistry.registerComponent(appName, () => App);
