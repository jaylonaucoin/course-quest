import "react-native-get-random-values";
import "./global.css";
import { useEffect } from "react";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { requestRecordingPermissionsAsync } from "expo-audio";
import AuthScreen from "./src/screens/AuthScreen";
import TabNavigator from "./src/utils/TabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRegistry } from "react-native";
import appConfig from "./app.json";

const appName = appConfig.expo.name;

const _NativeStack = createNativeStackNavigator();

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
			await requestRecordingPermissionsAsync();
		})();
	}, []);

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<ThemeProvider>
					<NativeStack.Navigator id="stack-navigator">
						<NativeStack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
						<NativeStack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
					</NativeStack.Navigator>
				</ThemeProvider>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

AppRegistry.registerComponent(appName, () => App);
