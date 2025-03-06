import React from 'react';
import {View} from 'react-native';
import MapView from "react-native-maps";
import {useTheme} from "react-native-paper";

export default function MapScreen({ navigation }) {
    const theme = useTheme();
    const themeStyle = theme.dark ? 'dark' : 'light';
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <MapView style={{width: '100%', height: '100%'}} userInterfaceStyle={themeStyle} showsCompass={true} />
        </View>
    );
}