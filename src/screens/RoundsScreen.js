import React, { useRef, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { Camera } from "expo-camera";

export default function RoundsScreen() {
    const cameraRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);

    React.useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current) {
            let photo = await cameraRef.current.takePictureAsync();
            console.log(photo);
        }
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <Camera ref={cameraRef} style={styles.camera} />
            <Button title="Take Picture" onPress={takePicture} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
});
