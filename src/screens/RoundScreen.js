import React, { useEffect, useRef, useState } from "react";
import { FlatList, View, RefreshControl } from "react-native";
import {
	Card,
	Text,
	Avatar,
	IconButton,
	useTheme,
	Menu,
	Divider,
	Icon,
	Button,
	RadioButton,
} from "react-native-paper";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { deleteRound, getRounds } from "../utils/DataController";
import { useScrollToTop } from "@react-navigation/native";

export default function RoundScreen({ navigation }) {
	const theme = useTheme();
	const [refreshing, setRefreshing] = useState(false);
	const [rounds, setRounds] = useState([]);
	const [menuStates, setMenuStates] = useState({});
	const [sortMenuVisible, setSortMenuVisible] = useState(false);
	const [sort, setSort] = useState("date-desc");

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

	const changeSort = async (value) => {
		setSortMenuVisible(false);
		setSort(value);
		const sortedRounds = await getRounds(value);
		setRounds(sortedRounds);
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

	useEffect(() => {
		getRounds().then((rounds) => {
			setRounds(rounds);
		});
	}, []);

	const goToEditRoundScreen = (round) => {
		toggleMenu(round.id);
		navigation.navigate("EditRound", { roundData: round });
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
						onPress={() => navigation.navigate("AddRound")}>
						Add Round
					</Button>
				</View>
			) : (
				<FlatList
					ref={scrollRef}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={fetchRounds}
							colors={[theme.colors.primary]}
							tintColor={theme.colors.primary}
						/>
					}
					style={{ height: "100%", padding: 5 }}
					data={rounds}
					ListHeaderComponent={() => (
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							<Text variant="titleLarge" style={{ margin: 10 }}>
								Recent Rounds
							</Text>
							<Menu
								visible={sortMenuVisible}
								anchor={
									<Button
										onPress={() => setSortMenuVisible(true)}
										icon="sort"
										contentStyle={{ flexDirection: "row-reverse" }}
										children="Sort"
									/>
								}
								onDismiss={() => setSortMenuVisible(false)}
								style={{ marginTop: 45, marginRight: 50 }}>
								<RadioButton.Group onValueChange={(value) => changeSort(value)} value={sort}>
									<RadioButton.Item label="Date (desc)" value="date-desc" />
									<RadioButton.Item label="Date (asc)" value="date-asc" />
									<RadioButton.Item label="Score (desc)" value="score-desc" />
									<RadioButton.Item label="Score (asc)" value="score-asc" />
								</RadioButton.Group>
							</Menu>
						</View>
					)}
					renderItem={({ item }) => (
						<Card
							style={{
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
							<View
								style={{
									display: "flex",
									height: "75",
									flexDirection: "row",
									justifyContent: "space-around",
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
					showsVerticalScrollIndicator={true}
				/>
			)}
		</View>
	);
}
