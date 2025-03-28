import React from "react";
import { View } from "react-native";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { ToggleButton, Button, Text, useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeContext } from "../components/ThemeProvider";

export default function SettingsScreen({ navigation }) {
	const { themeMode, toggleTheme } = useThemeContext();
	const theme = useTheme();

	const signOutUser = async () => {
		try {
			await signOut(auth);
			navigation.reset({
				index: 0,
				routes: [{ name: "Auth" }],
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<View
			style={{
				padding: 15,
				height: "100%",
				backgroundColor: theme.colors.surface,
			}}>
			<View
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 15,
				}}>
				<Text variant="headlineSmall">Customization</Text>
			</View>
			<View
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				}}>
				<Text variant="bodyLarge">Color Scheme</Text>
				<ToggleButton.Row
					onValueChange={(value) => toggleTheme(value)}
					value={themeMode}
					style={{
						width: "60%",
						alignSelf: "center",
						flexDirection: "row",
						borderRadius: 10,
						borderWidth: 0,
						marginTop: 5,
					}}>
					<ToggleButton
						icon={() => (
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 10,
								}}>
								<Ionicons name="sunny" size={24} />
								<Text>Light</Text>
							</View>
						)}
						label="Light"
						status={themeMode === "light" ? "checked" : "unchecked"}
						value="light"
						style={{ width: "50%" }}
					/>
					<ToggleButton
						icon={() => (
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 10,
								}}>
								<Ionicons name="moon" size={24} color="black" />
								<Text>Dark</Text>
							</View>
						)}
						label="Dark"
						status={themeMode === "dark" ? "checked" : "unchecked"}
						value="dark"
						style={{ width: "50%" }}
					/>
				</ToggleButton.Row>
			</View>
			<View style={{ width: "40%", alignSelf: "center", marginTop: 50 }}>
				<Button
					contentStyle={{ padding: 4 }}
					labelStyle={{ fontSize: 16, fontWeight: 600 }}
					onPress={() => signOutUser()}
					mode={"contained"}
					buttonColor={theme.colors.error}>
					Log Out
				</Button>
			</View>
		</View>
	);
}
