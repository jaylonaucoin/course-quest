import React, { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, View, Dimensions, TouchableOpacity, Image, Pressable } from "react-native";
import { Card, Text, Avatar, IconButton, useTheme, Menu, Divider, Icon, Button } from "react-native-paper";
import { deleteRound, getRounds, getUnits } from "../utils/DataController";
import { useScrollToTop, useFocusEffect } from "@react-navigation/native";
import ImageView from "react-native-image-viewing";
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
	const [units, setUnits] = useState(null);

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

			// Also fetch current units
			const currentUnits = await getUnits();
			setUnits(currentUnits);
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

	const goToMapScreen = (round) => {
		navigation.navigate("Map", { roundData: round });
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
		}, []),
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
								title={
									<Pressable onPress={() => goToMapScreen(item)}>
										<Text variant="bodyLarge" style={{ fontWeight: "700" }}>
											{item.course}
										</Text>
									</Pressable>
								}
								subtitle={
									item.date.toDate().toLocaleDateString(undefined, {
										year: "numeric",
										month: "long",
										day: "numeric",
									}) +
									"  |  " +
									item.holes
								}
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
								<View
									style={{
										height: item.images.length > 1 ? 335 : 210,
										paddingHorizontal: 5,
										paddingVertical: 10,
									}}>
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
										<View style={{ flexDirection: "row", height: 125, gap: 5 }}>
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
								<WeatherIcon
									key={`temp-${units ? units[0] : "default"}-${item.id}`}
									type="temperature"
									weatherCode={item.weatherCode}
									value={item.temp}
								/>
								<WeatherIcon
									key={`wind-${units ? units[1] : "default"}-${item.id}`}
									type="wind"
									weatherCode={item.weatherCode}
									value={item.wind}
								/>
								<WeatherIcon
									key={`rain-${units ? units[2] : "default"}-${item.id}`}
									type="rain"
									weatherCode={item.weatherCode}
									value={item.rain}
								/>
							</View>
						</Card>
					)}
					keyExtractor={(item) => item.id}
				/>
			)}
				<ImageView
					images={currentRoundImages.map(uri => ({ uri }))}
					imageIndex={selectedImageIndex}
					visible={isGalleryVisible}
					onRequestClose={() => setIsGalleryVisible(false)}
					onImageIndexChange={(index) => setSelectedImageIndex(index)}
					swipeToCloseEnabled={true}
					doubleTapToZoomEnabled={true}
					presentationStyle="overFullScreen"
				/>
		</View>
	);
}
