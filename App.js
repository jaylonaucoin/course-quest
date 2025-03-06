import "./global.css"
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import AuthScreen from "./src/screens/AuthScreen";
import TabNavigator from "./src/components/TabNavigator";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {AppRegistry} from "react-native";
import appConfig from './app.json';
import { ThemeProvider } from "./src/components/ThemeProvider";

const appName = appConfig.expo.name;

const Stack = createStackNavigator();

export default function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      // Request Location Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);

      // Request Camera Permission
      await Camera.requestCameraPermissionsAsync();

      // Request Microphone Permission
      await Audio.requestPermissionsAsync();
    })();
  }, []);

  return (
        <ThemeProvider>
            <Stack.Navigator id="stack-navigator">
              <Stack.Screen name="Auth" component={AuthScreen} options={{headerShown: false}}/>
              <Stack.Screen name="Main" component={TabNavigator} options={{headerShown: false}} />
            </Stack.Navigator>
        </ThemeProvider>
  );
}

AppRegistry.registerComponent(appName, () => App);
