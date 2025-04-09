import React, { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Card, Text, Avatar, IconButton, useTheme, Menu, Divider, Icon, Button } from "react-native-paper";
import { deleteRound, getRounds } from "../utils/DataController";
import { useScrollToTop } from "@react-navigation/native";
import { ImageGallery } from "@georstat/react-native-image-gallery";
import ImageGrid from "../components/ImageGrid";
import WeatherIcon from "../components/WeatherIcon";
export default function HomeScreen({ navigation }) {
	const [refreshing, setRefreshing] = useState(false);
	const theme = useTheme();
	const [rounds, setRounds] = useState([]);
	const [menuStates, setMenuStates] = useState({});
	const [imageGalleryVisible, setImageGalleryVisible] = useState(false);
	const [imageIndex, setImageIndex] = useState(0);
	const [currentImages, setCurrentImages] = useState([]);

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

	const renderImageViewer = (index, images) => {
		// Convert image URLs to the format expected by ImageGallery
		const galleryImages = images.map((url, i) => ({
			id: i,
			url: url,
		}));

		setCurrentImages(galleryImages);
		setImageIndex(index);
		setImageGalleryVisible(true);
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
							{item.images && item.images[0] && (
								<View style={{ height: 200 }}>
									<ImageGrid
										images={item.images}
										onImagePress={(index) => renderImageViewer(index, item.images)}
									/>
									<ImageGallery
										isOpen={imageGalleryVisible}
										close={() => setImageGalleryVisible(false)}
										images={currentImages}
										initialIndex={imageIndex}
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
								<WeatherIcon type="temperature" weatherCode={item.weatherCode} value={item.temp} />
								<WeatherIcon type="wind" weatherCode={item.weatherCode} value={item.wind} />
								<WeatherIcon type="rain" weatherCode={item.weatherCode} value={item.rain} />
							</View>
						</Card>
					)}
					keyExtractor={(item) => item.id}
				/>
			)}
		</View>
	);
}
