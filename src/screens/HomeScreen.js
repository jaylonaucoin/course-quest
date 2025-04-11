import React, { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, View, Dimensions, TouchableOpacity, Modal, Image } from "react-native";
import { Card, Text, Avatar, IconButton, useTheme, Menu, Divider, Icon, Button } from "react-native-paper";
import { deleteRound, getRounds } from "../utils/DataController";
import { useScrollToTop, useFocusEffect } from "@react-navigation/native";
import Gallery from "react-native-awesome-gallery";
import WeatherIcon from "../components/WeatherIcon";

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
	const [refreshing, setRefreshing] = useState(false);
	const theme = useTheme();
	const [rounds, setRounds] = useState([]);
	const [menuStates, setMenuStates] = useState({});
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [isGalleryVisible, setIsGalleryVisible] = useState(false);
	const [currentRoundImages, setCurrentRoundImages] = useState([]);

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

	// Refresh data on initial mount
	useEffect(() => {
		fetchRounds();
	}, []);

	// Add useFocusEffect to refresh data when the screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			fetchRounds();
			return () => {
				// Cleanup if needed
			};
		}, [])
	);

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
					renderItem={({ item, index }) => (
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
							{item.images && item.images[0] && (
								<View style={{ height: item.images.length > 1 ? 300 : 200, padding: 5 }}>
									{/* First large image */}
									<TouchableOpacity
										style={{
											width: "100%",
											height: 200,
											marginBottom: 5,
										}}
										onPress={() => {
											setCurrentRoundImages(item.images);
											setSelectedImageIndex(0);
											setIsGalleryVisible(true);
										}}>
										<Image
											source={{ uri: item.images[0] }}
											style={{
												width: "100%",
												height: "100%",
												borderRadius: 8,
											}}
											resizeMode="cover"
										/>
									</TouchableOpacity>

									{/* Bottom row of images */}
									{item.images.length > 1 && (
										<View style={{ flexDirection: "row", height: 90, gap: 5 }}>
											{/* Second image */}
											<TouchableOpacity
												style={{ flex: 1 }}
												onPress={() => {
													setCurrentRoundImages(item.images);
													setSelectedImageIndex(1);
													setIsGalleryVisible(true);
												}}>
												<Image
													source={{ uri: item.images[1] }}
													style={{
														width: "100%",
														height: "100%",
														borderRadius: 8,
													}}
													resizeMode="cover"
												/>
											</TouchableOpacity>

											{/* Third image */}
											{item.images.length > 2 && (
												<TouchableOpacity
													style={{ flex: 1 }}
													onPress={() => {
														setCurrentRoundImages(item.images);
														setSelectedImageIndex(2);
														setIsGalleryVisible(true);
													}}>
													<Image
														source={{ uri: item.images[2] }}
														style={{
															width: "100%",
															height: "100%",
															borderRadius: 8,
														}}
														resizeMode="cover"
													/>
												</TouchableOpacity>
											)}

											{/* Fourth image or overlay */}
											{item.images.length > 3 && (
												<TouchableOpacity
													style={{ flex: 1 }}
													onPress={() => {
														setCurrentRoundImages(item.images);
														setSelectedImageIndex(3);
														setIsGalleryVisible(true);
													}}>
													<Image
														source={{ uri: item.images[3] }}
														style={{
															width: "100%",
															height: "100%",
															borderRadius: 8,
														}}
														resizeMode="cover"
													/>
													{item.images.length > 4 && (
														<View
															style={{
																position: "absolute",
																top: 0,
																left: 0,
																right: 0,
																bottom: 0,
																backgroundColor: "rgba(0,0,0,0.5)",
																borderRadius: 8,
																justifyContent: "center",
																alignItems: "center",
															}}>
															<Text style={{ color: "white", fontSize: 24 }}>
																+{item.images.length - 4}
															</Text>
														</View>
													)}
												</TouchableOpacity>
											)}
										</View>
									)}
								</View>
							)}
							{item.notes && (
								<Card.Content style={{ paddingVertical: 15 }}>
									<Text variant="bodySmall">{item.notes}</Text>
								</Card.Content>
							)}
							<View
								style={{
									display: "flex",
									height: 75,
									flexDirection: "row",
									justifyContent: "space-around",
									paddingBottom: 6,
									paddingRight: 10,
								}}>
								<WeatherIcon type="temperature" weatherCode={item.weatherCode} value={item.temp} />
								<WeatherIcon type="wind" weatherCode={item.weatherCode} value={item.wind} />
								<WeatherIcon type="rain" weatherCode={item.weatherCode} value={item.rain} />
							</View>
						</Card>
					)}
					keyExtractor={(item) => item.id}
				/>
			)}
			<Modal
				visible={isGalleryVisible}
				transparent={true}
				onRequestClose={() => setIsGalleryVisible(false)}
				statusBarTranslucent>
				<View style={{ flex: 1, backgroundColor: "black" }}>
					<Gallery
						data={currentRoundImages}
						initialIndex={selectedImageIndex}
						onSwipeToClose={() => setIsGalleryVisible(false)}
						containerDimensions={{ width, height }}
						style={{ flex: 1 }}
						loop={false}
						onIndexChange={(index) => setSelectedImageIndex(index)}
						enableSwipeToClose={true}
						disableVerticalSwipe={false}
						disableSwipeUp={false}
					/>
					<IconButton
						icon="close"
						iconColor="white"
						size={30}
						style={{ position: "absolute", top: 40, right: 20, zIndex: 1 }}
						onPress={() => setIsGalleryVisible(false)}
					/>
				</View>
			</Modal>
		</View>
	);
}
