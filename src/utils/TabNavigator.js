import React from "react";
import { CommonActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { BottomNavigation } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import SettingsScreen from "../screens/SettingsScreen.js";
import MapScreen from "../screens/MapScreen.js";
import RoundScreen from "../screens/RoundScreen.js";
import HomeScreen from "../screens/HomeScreen.js";

import Header from "../components/Header";
import AddRoundScreen from "../screens/AddRoundScreen";
import AccountScreen from "../screens/AccountScreen";
import EditRoundScreen from "../screens/EditRoundScreen";
import EditAccountScreen from "../screens/EditAccountScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function TabNavigator() {
	return (
		<Tab.Navigator
			initialRouteName="Home"
			id="bottomTab"
			screenOptions={{
				unmountOnBlur: true,
				animationEnabled: false,
				header: ({ navigation }) => {
					return (
						<Header
							navigation={navigation}
							title={
								navigation.getState().routes[navigation.getState().index]
									.name
							}
						/>
					);
				},
			}}
			tabBar={({ navigation, state, descriptors }) => (
				<BottomNavigation.Bar
					navigationState={state}
					onTabPress={({ route, preventDefault }) => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (event.defaultPrevented) {
							preventDefault();
						} else {
							navigation.dispatch({
								...CommonActions.navigate(route.name, route.params),
								target: state.key,
							});
						}
					}}
					renderIcon={({ route, focused, color }) => {
						const { options } = descriptors[route.key];
						if (options.tabBarIcon) {
							return options.tabBarIcon({ focused, color, size: 22 });
						}

						return null;
					}}
					getLabelText={({ route }) => {
						const { options } = descriptors[route.key];
						return options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
								? options.title
								: route.title;
					}}
				/>
			)}>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{
					tabBarLabel: "Home",
					tabBarIcon: ({ color, size }) => {
						return <Ionicons name="home-sharp" size={size} color={color} />;
					},
				}}
			/>
			<Tab.Screen
				name="RoundStack"
				component={RoundStackNavigator}
				listeners={({ navigation }) => ({
					tabPress: (e) => {
						e.preventDefault();
						navigation.navigate("RoundStack", { screen: "Rounds" });
					},
				})}
				options={{
					headerShown: false,
					tabBarLabel: "Rounds",
					tabBarIcon: ({ color, size }) => {
						return <Ionicons name="golf" size={size} color={color} />;
					},
					title: "Rounds",
				}}
			/>
			<Tab.Screen
				name="Map"
				component={MapScreen}
				options={{
					tabBarLabel: "Map",
					tabBarIcon: ({ color, size }) => {
						return <Ionicons name="map" size={size} color={color} />;
					},
				}}
			/>
			<Tab.Screen
				name="SettingsStack"
				component={SettingsStackNavigator}
				listeners={({ navigation }) => ({
					tabPress: (e) => {
						e.preventDefault(); // Prevent default behavior
						navigation.navigate("SettingsStack", { screen: "Settings" });
					},
				})}
				options={{
					headerShown: false,
					initialRouteName: "Settings",
					tabBarLabel: "Settings",
					tabBarIcon: ({ color, size }) => {
						return <Ionicons name="settings" size={size} color={color} />;
					},
				}}
			/>
		</Tab.Navigator>
	);
}

const RoundStackNavigator = () => {
	return (
		<Stack.Navigator
			id="RoundStack"
			initialRouteName="Rounds"
			screenOptions={{
				animation: "none",
				animationEnabled: false,
			}}>
			<Stack.Screen
				name="Rounds"
				component={RoundScreen}
				options={{
					animation: "none",
					header: ({ navigation }) => (
						<Header navigation={navigation} title="Rounds" />
					),
				}}
			/>
			<Stack.Screen
				name="AddRound"
				component={AddRoundScreen}
				options={{
					animation: "none",
					header: ({ navigation }) => (
						<Header navigation={navigation} title="Add Round" />
					),
				}}
			/>
			<Stack.Screen
				name="EditRound"
				component={EditRoundScreen}
				options={{
					animation: "none",
					header: ({ navigation }) => (
						<Header navigation={navigation} title="Edit Round" />
					),
				}}
			/>
		</Stack.Navigator>
	);
};

const SettingsStackNavigator = () => {
	return (
		<Stack.Navigator
			id="SettingsStack"
			initialRouteName="Settings"
			screenOptions={{
				animation: "none",
				animationEnabled: false,
			}}>
			<Stack.Screen
				name="Settings"
				component={SettingsScreen}
				options={{
					animation: "none",
					header: ({ navigation }) => (
						<Header navigation={navigation} title="Settings" />
					),
				}}
			/>
			<Stack.Screen
				name="Account"
				component={AccountScreen}
				options={{
					animation: "none",
					header: ({ navigation }) => (
						<Header navigation={navigation} title="Account" />
					),
				}}
			/>
			<Stack.Screen
				name="EditAccount"
				component={EditAccountScreen}
				options={{
					animation: "none",
					header: ({ navigation }) => (
						<Header navigation={navigation} title="Edit Account" />
					),
				}}
			/>
		</Stack.Navigator>
	);
};
