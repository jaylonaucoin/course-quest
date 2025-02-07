import React from "react";
import { View, StyleSheet } from "react-native";
import MapView from "react-native-maps";

export default function MapScreen( navigation ) {
    return (
        <View style={styles.container}>
            <MapView style={styles.map} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
});
