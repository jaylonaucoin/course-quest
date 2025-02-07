import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import TabNavigator from "./src/components/navigation/TabNavigator";

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
      <TabNavigator />
  );
}
