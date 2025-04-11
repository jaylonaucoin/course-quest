/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, Callout } from "react-native-maps";
import { useTheme, Surface, Tooltip } from "react-native-paper";
import { getRounds } from "../utils/DataController";
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function MapScreen() {
	const theme = useTheme();
	const themeStyle = theme.dark ? "dark" : "light";
	const [markers, setMarkers] = useState([]);
	const [initialRegion, setInitialRegion] = useState({
		latitude: 25,
		longitude: -100,
		latitudeDelta: 100,
		longitudeDelta: 100,
	});

	const getCenter = (markers) => {
		if (!markers || markers.length === 0) {
			return {
				latitude: 25,
				longitude: -100,
				latitudeDelta: 100,
				longitudeDelta: 100,
			};
		}

		// Calculate center
		const sum = markers.reduce(
			(acc, marker) => ({
				latitude: acc.latitude + marker.latitude,
				longitude: acc.longitude + marker.longitude,
			}),
			{ latitude: 0, longitude: 0 },
		);
		const center = {
			latitude: sum.latitude / markers.length,
			longitude: sum.longitude / markers.length,
		};

		// Calculate spread
		const latitudes = markers.map((m) => m.latitude);
		const longitudes = markers.map((m) => m.longitude);
		const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
		const lonSpread = Math.max(...longitudes) - Math.min(...longitudes);

		// Add padding to the spread
		const padding = 0.2; // 20% padding
		const latDelta = Math.max(latSpread * (1 + padding), 1);
		const lonDelta = Math.max(lonSpread * (1 + padding), 1);

		return {
			...center,
			latitudeDelta: latDelta,
			longitudeDelta: lonDelta,
		};
	};

	const loadRounds = async () => {
		try {
			const rounds = await getRounds();
			if (!rounds || rounds.length === 0) {
				return;
			}

			const newMarkers = rounds.map((round) => ({
				latitude: Number(round.lat),
				longitude: Number(round.lon),
				title: round.course,
				description: round.score.toString(),
				date: round.date ? round.date.toDate().toLocaleDateString() : "No date",
				score: round.score,
				temp: round.temp,
				wind: round.wind,
				rain: round.rain,
				image: round.images && round.images.length > 0 ? round.images[0] : null,
			}));

			setMarkers(newMarkers);
			const region = getCenter(newMarkers);
			setInitialRegion(region);
		} catch (error) {
			console.error("Error loading rounds:", error);
		}
	};

	// Initial load on mount
	useEffect(() => {
		loadRounds();
	}, []);

	// Refresh data when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			loadRounds();
			return () => {
				// Cleanup if needed
			};
		}, []),
	);

	const styles = StyleSheet.create({
		tooltipWrapper: {
			alignItems: "center",
			marginBottom: 30,
		},
		tooltipContainer: {
			padding: 10,
			borderRadius: 6,
			minWidth: 150,
			maxWidth: 180,
		},
		trianglePointer: {
			width: 0,
			height: 0,
			backgroundColor: "transparent",
			borderStyle: "solid",
			borderLeftWidth: 8,
			borderRightWidth: 8,
			borderTopWidth: 10,
			borderLeftColor: "transparent",
			borderRightColor: "transparent",
			borderTopColor: theme.colors.elevation.level2,
			alignSelf: "center",
			marginTop: -1,
		},
		title: {
			fontWeight: "bold",
			fontSize: 14,
			marginBottom: 4,
			textAlign: "center",
			color: theme.colors.onSurface,
		},
		infoRow: {
			flexDirection: "row",
			alignItems: "center",
			marginVertical: 2,
			gap: 6,
		},
		infoText: {
			fontSize: 12,
			color: theme.colors.onSurfaceVariant,
		},
		image: {
			width: 180,
			height: 120,
			borderRadius: 6,
			marginTop: 10,
			alignSelf: "center",
		},
	});

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<MapView
				style={{ width: "100%", height: "100%" }}
				userInterfaceStyle={themeStyle}
				showsCompass={true}
				region={initialRegion}>
				{markers.map((marker, index) => (
					<Marker
						key={index}
						coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
						title={marker.title}
						description={marker.description}
						pinColor={theme.colors.primary}>
						<Callout tooltip={true}>
							<Tooltip>
								<View style={styles.tooltipWrapper}>
									<Surface elevation={4} style={styles.tooltipContainer}>
										<Text style={styles.title}>{marker.title}</Text>
										<View style={styles.infoRow}>
											<FontAwesome5 name="calendar-day" size={12} color={theme.colors.primary} />
											<Text style={styles.infoText}>
												{new Date(marker.date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5 name="medal" size={12} color={theme.colors.primary} />
											<Text style={styles.infoText}>{marker.score}</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5
												name="temperature-high"
												size={12}
												color={theme.colors.primary}
											/>
											<Text style={styles.infoText}>{marker.temp} °C</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5 name="wind" size={12} color={theme.colors.primary} />
											<Text style={styles.infoText}>{marker.wind} km/h</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5 name="tint" size={12} color={theme.colors.primary} />
											<Text style={styles.infoText}>{marker.rain} mm</Text>
										</View>
									</Surface>
									<View style={styles.trianglePointer} />
								</View>
							</Tooltip>
						</Callout>
					</Marker>
				))}
			</MapView>
		</View>
	);
}
