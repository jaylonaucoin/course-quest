import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useTheme, Surface, Tooltip } from "react-native-paper";
import { getRounds } from "../utils/DataController";
import { useState, useEffect } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function MapScreen() {
	const theme = useTheme();
	const themeStyle = theme.dark ? "dark" : "light";
	const [markers, setMarkers] = useState([]);

	useEffect(() => {
		getRounds().then((rounds) => {
			setMarkers(
				rounds.map((round) => ({
					latitude: round.lat,
					longitude: round.lon,
					title: round.course,
					description: round.score.toString(),
					date: round.date ? round.date.toDate().toLocaleDateString() : "No date",
					score: round.score,
					temp: round.temp,
					wind: round.wind,
					rain: round.rain,
					image: round.images && round.images.length > 0 ? round.images[0] : null,
				})),
			);
		});
	}, []);

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
				showsCompass={true}>
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
											<FontAwesome5
												name="calendar-day"
												size={12}
												color={theme.colors.primary}
											/>
											<Text style={styles.infoText}>{marker.date}</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5
												name="trophy"
												size={12}
												color={theme.colors.primary}
											/>
											<Text style={styles.infoText}>{marker.score}</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5
												name="temperature-low"
												size={12}
												color={theme.colors.primary}
											/>
											<Text style={styles.infoText}>{marker.temp}°C</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5
												name="wind"
												size={12}
												color={theme.colors.primary}
											/>
											<Text style={styles.infoText}>{marker.wind} km/h</Text>
										</View>
										<View style={styles.infoRow}>
											<FontAwesome5
												name="tint"
												size={12}
												color={theme.colors.primary}
											/>
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
