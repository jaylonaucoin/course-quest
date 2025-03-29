import React, { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Appbar, Button, IconButton, useTheme, Text, Avatar, Icon } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import favicon from "../../assets/favicon.png";
import { getUser } from "../utils/DataController";

export default function Header() {
	const theme = useTheme();
	const navigation = useNavigation();
	const route = useRoute();
	const [user, setUser] = useState({});

	const goToAccountScreen = () => {
		if (route.name === "SettingsStack" || route.name === "Settings") {
			navigation.navigate("Account");
		} else {
			navigation.reset({
				index: 0,
				routes: [{ name: "SettingsStack", params: { screen: "Account" } }],
			});
		}
	};

	const goToAddRoundScreen = () => {
		if (route.name === "RoundStack" || route.name === "Rounds") {
			navigation.navigate("AddRound");
		} else {
			navigation.reset({
				index: 0,
				routes: [{ name: "RoundStack", params: { screen: "AddRound" } }],
			});
		}
	};

	useEffect(() => {
		getUser().then((user) => {
			setUser(user);
		});
	}, []);

	return (
		<Appbar.Header mode="center-aligned" elevated={true}>
			<View
				style={{
					width: "45%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "flex-start",
					paddingLeft: 10,
					alignItems: "center",
					alignContent: "center",
					alignSelf: "center",
				}}>
				<Button
					mode={"contained"}
					compact={true}
					contentStyle={{ width: 100, height: 35 }}
					onPress={goToAddRoundScreen}>
					<View
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							paddingRight: 7,
						}}>
						<IconButton
							icon="plus"
							size={16}
							iconColor={theme.colors.onPrimary}
							style={{ margin: -5 }}
						/>
						<Text
							style={{
								color: theme.colors.onPrimary,
								fontSize: 10,
								fontWeight: "bold",
							}}>
							Add Round
						</Text>
					</View>
				</Button>
			</View>
			<View
				style={{
					width: "10%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
				}}>
				<Button onPress={() => navigation.navigate("Home")}>
					<Image source={favicon} style={{ alignSelf: "center", width: 60, height: 60 }} />
				</Button>
			</View>
			<Pressable
				style={{
					width: "45%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "flex-end",
					alignItems: "center",
					alignContent: "center",
					alignSelf: "center",
				}}
				onPress={goToAccountScreen}>
				{user.profilePicture ? (
					<Avatar.Image
						size={35}
						style={{
							marginHorizontal: 10,
							justifyContent: "center",
							alignContent: "center",
							alignItems: "center",
						}}
						source={{ uri: user.profilePicture }}
					/>
				) : (
					<Avatar.Image
						size={35}
						style={{
							marginHorizontal: 10,
							justifyContent: "center",
							alignContent: "center",
							alignItems: "center",
						}}
						source={() => <Icon source="account" color={theme.colors.onPrimary} size={25} />}
					/>
				)}
			</Pressable>
		</Appbar.Header>
	);
}
