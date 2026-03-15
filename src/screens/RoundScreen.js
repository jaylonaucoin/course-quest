import React, { useEffect, useRef, useState, useCallback } from "react";
import { FlatList, View, RefreshControl } from "react-native";
import { Card, Text, Avatar, IconButton, useTheme, Menu, Divider, Icon, Button, RadioButton } from "react-native-paper";
import { deleteRound, getRounds } from "../utils/DataController";
import { useScrollToTop, useFocusEffect } from "@react-navigation/native";
import WeatherIcon from "../components/WeatherIcon";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../utils/ToastContext";
import { handleError } from "../utils/errorHandler";

export default function RoundScreen({ navigation }) {
	const theme = useTheme();
	const { showError } = useToast();
	const [refreshing, setRefreshing] = useState(false);
	const [rounds, setRounds] = useState([]);
	const [menuStates, setMenuStates] = useState({});
	const [sortMenuVisible, setSortMenuVisible] = useState(false);
	const [sort, setSort] = useState("date-desc");
	const [deleteConfirmRound, setDeleteConfirmRound] = useState(null);

	const scrollRef = useRef(null);
	useScrollToTop(scrollRef);

	const toggleMenu = (id) => {
		setMenuStates((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const handleDeleteConfirm = async () => {
		if (!deleteConfirmRound) return;
		const id = deleteConfirmRound.id;
		setDeleteConfirmRound(null);
		await deleteRound(id);
		const updatedRounds = await getRounds(sort);
		setRounds(updatedRounds);
	};

	const changeSort = async (value) => {
		setSortMenuVisible(false);
		setSort(value);
		const sortedRounds = await getRounds(value);
		setRounds(sortedRounds);
	};

	// Function to fetch rounds from the database
	const fetchRounds = useCallback(async () => {
		setRefreshing(true);
		try {
			const data = await getRounds(sort);
			setRounds(data);
		} catch (error) {
			handleError(error, "Failed to load rounds. Pull down to try again.", showError);
		} finally {
			setRefreshing(false);
		}
	}, [sort, showError]);

	// Initial load on mount
	useEffect(() => {
		fetchRounds();
	}, [fetchRounds]);

	// Add useFocusEffect to refresh data when the screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			fetchRounds();
			return () => {
				// Cleanup if needed
			};
		}, [fetchRounds]),
	);

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
					<Button mode="contained" style={{ marginTop: 20 }} onPress={() => navigation.navigate("AddRound")}>
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
										key={menuStates[item.id]}
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
											onPress={() => {
												toggleMenu(item.id);
												setDeleteConfirmRound(item);
											}}
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
								<WeatherIcon type="temperature" weatherCode={item.weatherCode} value={item.temp} />
								<WeatherIcon type="wind" weatherCode={item.weatherCode} value={item.wind} />
								<WeatherIcon type="rain" weatherCode={item.weatherCode} value={item.rain} />
							</View>
						</Card>
					)}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={true}
				/>
			)}
			<ConfirmDialog
				visible={!!deleteConfirmRound}
				onDismiss={() => setDeleteConfirmRound(null)}
				onConfirm={handleDeleteConfirm}
				title="Delete Round?"
				message="This cannot be undone."
				confirmLabel="Delete"
				destructive
			/>
		</View>
	);
}
