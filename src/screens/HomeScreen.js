import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { Card, Text, Avatar, IconButton, useTheme, Menu, Divider, Icon, Button } from "react-native-paper";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { deleteRound, getRounds } from "../utils/DataController";
import { useScrollToTop } from "@react-navigation/native";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";

export default function HomeScreen({ navigation }) {
	const [refreshing, setRefreshing] = useState(false);
	const theme = useTheme();
	const [rounds, setRounds] = useState([]);
	const [menuStates, setMenuStates] = useState({});
	// eslint-disable-next-line no-unused-vars
	const [imageViewVisible, setImageViewVisible] = useState(false);
	// eslint-disable-next-line no-unused-vars
	const [imageIndex, setImageIndex] = useState(0);

	const scrollRef = useRef(null);
	useScrollToTop(scrollRef);

	const toggleMenu = (id) => {
		setMenuStates((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const deleteDBRound = async (id) => {
		toggleMenu(id);
		await deleteRound(id);
		await getRounds().then((rounds) => {
			setRounds(rounds);
		});
	};

	// Function to fetch rounds from the database
	const fetchRounds = async () => {
		setRefreshing(true);
		try {
			const data = await getRounds();
			setRounds(data);
		} catch (error) {
			console.error("Error fetching rounds:", error);
		} finally {
			setRefreshing(false);
		}
	};

	const goToEditRoundScreen = (round) => {
		toggleMenu(round.id);
		navigation.navigate("RoundStack", {
			screen: "EditRound",
			params: { roundData: round },
		});
	};

	useEffect(() => {
		getRounds().then((rounds) => {
			setRounds(rounds);
		});
	}, []);

	const renderImageViewer = (index) => {
		setImageIndex(index);
		setImageViewVisible(true);
	};

	return (
		<View style={{ backgroundColor: theme.colors.surface, height: "100%" }}>
			{!rounds || rounds.length === 0 ? (
				<View
					style={{
						alignItems: "center",
						justifyContent: "center",
						gap: 50,
						height: "100%",
					}}>
					<Text variant="titleLarge" style={{ marginHorizontal: 10 }}>
						Time to go tee it up and add some rounds to show here!
					</Text>
					<Icon source="golf" size={100} color={theme.colors.onSurfaceVariant} />
					<Button
						mode="contained"
						style={{ marginTop: 20 }}
						onPress={() => navigation.navigate("RoundStack", { screen: "AddRound" })}>
						Add Round
					</Button>
				</View>
			) : (
				<FlatList
					ref={scrollRef}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={fetchRounds} // Call the function directly
							colors={[theme.colors.primary]}
							tintColor={theme.colors.primary}
						/>
					}
					style={{ padding: 5, height: "100%" }}
					data={rounds}
					renderItem={({ item }) => (
						<Card
							style={{
								display: "flex",
								margin: 5,
								paddingVertical: 5,
								backgroundColor: theme.colors.elevation.level2,
							}}>
							<Card.Title
								title={item.course}
								subtitle={item.date.toDate().toLocaleDateString(undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
								left={() => (
									<Avatar.Text
										labelStyle={{
											fontSize: 17,
											fontWeight: "bold",
											color: theme.colors.onPrimary,
										}}
										style={{ borderRadius: 12 }}
										size={55}
										label={item.score}
									/>
								)}
								leftStyle={{ marginRight: 30 }}
								right={() => (
									<Menu
										visible={menuStates[item.id]}
										onDismiss={() => toggleMenu(item.id)}
										style={{ marginTop: 55, marginRight: 40 }}
										anchor={
											<IconButton
												icon="dots-vertical"
												mode={menuStates[item.id] && "contained-tonal"}
												onPress={() => toggleMenu(item.id)}
											/>
										}>
										<Menu.Item onPress={() => goToEditRoundScreen(item)} title="Edit" />
										<Divider />
										<Menu.Item
											onPress={() => deleteDBRound(item.id)}
											title="Delete"
											titleStyle={{ color: theme.colors.error }}
										/>
									</Menu>
								)}
								titleVariant="titleMedium"
							/>
							{item.images && (
								<View>
									<Carousel
										width={372}
										height={250}
										style={{
											backgroundColor: theme.colors.background,
											marginTop: 5,
										}}
										loop={false}
										snapEnabled={true}
										pagingEnabled={true}
										scrollAnimationDuration={250}
										data={item.images}
										renderItem={({ item }) => (
											<Pressable onPress={() => renderImageViewer(item.id)}>
												<Image
													style={{ height: "100%" }}
													source={item}
													contentFit="cover"
												/>
											</Pressable>
										)}
									/>
								</View>
							)}
							<Card.Content style={{ paddingVertical: 10 }}>
								<Text variant="bodySmall">{item.notes}</Text>
							</Card.Content>
							<View
								style={{
									display: "flex",
									height: 75,
									flexDirection: "row",
									justifyContent: "space-around",
									paddingBottom: 6,
									paddingRight: 10,
								}}>
								<View
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-around",
										padding: 5,
									}}>
									<FontAwesome5
										name="temperature-high"
										size={26}
										color={theme.colors.onSurfaceVariant}
									/>
									<Text variant="labelMedium">{item.temp}&deg;C</Text>
								</View>
								<View
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-around",
										padding: 5,
									}}>
									<FontAwesome5
										name="wind"
										size={26}
										color={theme.colors.onSurfaceVariant}
									/>
									<Text variant="labelMedium">{item.wind}km/h</Text>
								</View>
								<View
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-around",
										padding: 5,
									}}>
									<FontAwesome5
										name="cloud-rain"
										size={26}
										color={theme.colors.onSurfaceVariant}
									/>
									<Text variant="labelMedium">{item.rain}mm</Text>
								</View>
							</View>
						</Card>
					)}
					keyExtractor={(item) => item.id}
				/>
			)}
		</View>
	);
}
