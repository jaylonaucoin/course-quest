/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Surface, Tooltip } from "react-native-paper";
import { getRounds, getUnits } from "../utils/DataController";
import { convertTemperature, convertWindSpeed, convertPrecipitation } from "../utils/UnitConverter";
import { useToast } from "../utils/ToastContext";
import { handleError } from "../utils/errorHandler";
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MapView, { Marker, Callout } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";

export default function MapScreen({ route }) {
	const theme = useTheme();
	const { showError } = useToast();
	const themeStyle = theme.dark ? "dark" : "light";
	const [markers, setMarkers] = useState([]);
	const [units, setUnits] = useState(["celsius", "kilometers", "millimeters"]);

	// Custom map style to hide road and river labels
	const customMapStyle = [
		{
			featureType: "road",
			elementType: "labels.text",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "water",
			elementType: "labels.text",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "transit",
			elementType: "labels.text",
			stylers: [{ visibility: "off" }],
		},
	];
	const [initialRegion, setInitialRegion] = useState({
		latitude: 25,
		longitude: -100,
		latitudeDelta: 100,
		longitudeDelta: 100,
	});
	const mapRef = React.useRef(null);
	const [mapError, setMapError] = useState(false);

	const { roundData } = route.params || {};

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

	// Add this function to force map update - now properly scoped inside the component
	const fitToMarkersWithDelay = () => {
		// Small delay to ensure map is fully loaded
		// eslint-disable-next-line no-undef
		setTimeout(() => {
			if (mapRef.current && markers.length > 0) {
				const region = getCenter(markers);

				// Set region directly
				try {
					mapRef.current.animateToRegion(region, 500);
				} catch (error) {
					console.error("Error animating to region:", error);
				}
			}
		}, 300);
	};

	const loadRounds = async () => {
		try {
			const [rounds, userUnits] = await Promise.all([
				getRounds(),
				getUnits().catch(() => ["celsius", "kilometers", "millimeters"]),
			]);
			if (userUnits && userUnits.length >= 3) {
				setUnits(userUnits);
			}

			if (!rounds || rounds.length === 0) {
				return;
			}

			const newMarkers = rounds.map((round) => ({
				latitude: Number(round.lat),
				longitude: Number(round.lon),
				title: round.course,
				description: round.score.toString(),
				date: round.date ? round.date.toDate() : "No date",
				score: round.score,
				temp: round.temp,
				wind: round.wind,
				rain: round.rain,
				image: round.images && round.images.length > 0 ? round.images[0] : null,
			}));

			// Set markers
			setMarkers(newMarkers);

			// Calculate target region
			let targetRegion;
			// If roundData is provided, focus on its marker
			if (roundData && roundData.lat && roundData.lon) {
				targetRegion = {
					latitude: Number(roundData.lat),
					longitude: Number(roundData.lon),
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				};
			} else {
				targetRegion = getCenter(newMarkers);
			}

			// Set initial region
			setInitialRegion(targetRegion);

			// Also try to set region directly if map is ready
			if (mapRef.current) {
				try {
					mapRef.current.animateToRegion(targetRegion, 500);
				} catch (error) {
					console.error("Error setting region:", error);
				}
			}
		} catch (error) {
			handleError(error, "Failed to load map data. Pull down to try again.", showError);
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

	const getUnitLabels = () => ({
		temp: units[0] === "fahrenheit" ? "°F" : "°C",
		wind: units[1] === "miles" ? "mph" : "km/h",
		precip: units[2] === "inches" ? "in" : "mm",
	});

	const renderMarkerInfo = (marker) => {
		const labels = getUnitLabels();
		const tempUnit = units[0] ?? "celsius";
		const windUnit = units[1] ?? "kilometers";
		const precipUnit = units[2] ?? "millimeters";
		const displayTemp = marker.temp != null ? convertTemperature(marker.temp, "celsius", tempUnit) : "-";
		const displayWind = marker.wind != null ? convertWindSpeed(marker.wind, "kilometers", windUnit) : "-";
		const displayRain = marker.rain != null ? convertPrecipitation(marker.rain, "millimeters", precipUnit) : "-";
		return (
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
						<FontAwesome5 name="temperature-high" size={12} color={theme.colors.primary} />
						<Text style={styles.infoText}>
							{typeof displayTemp === "number" ? Math.round(displayTemp) : displayTemp} {labels.temp}
						</Text>
					</View>
					<View style={styles.infoRow}>
						<FontAwesome5 name="wind" size={12} color={theme.colors.primary} />
						<Text style={styles.infoText}>
							{typeof displayWind === "number" ? displayWind.toFixed(1) : displayWind} {labels.wind}
						</Text>
					</View>
					<View style={styles.infoRow}>
						<FontAwesome5 name="tint" size={12} color={theme.colors.primary} />
						<Text style={styles.infoText}>
							{typeof displayRain === "number" ? displayRain.toFixed(2) : displayRain} {labels.precip}
						</Text>
					</View>
				</Surface>
				<View style={styles.trianglePointer} />
			</View>
		);
	};

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			{mapError ? (
				<View style={{ padding: 20, alignItems: "center" }}>
					<Text style={{ color: theme.colors.error, marginBottom: 10 }}>
						There was an error loading the map.
					</Text>
					<Surface style={{ padding: 10, borderRadius: 8 }}>
						<Text onPress={() => setMapError(false)} style={{ color: theme.colors.primary }}>
							Tap to retry
						</Text>
					</Surface>
				</View>
			) : (
				<ClusteredMapView
					ref={mapRef}
					style={{ width: "100%", height: "100%" }}
					userInterfaceStyle={themeStyle}
					customMapStyle={customMapStyle}
					mapType="mutedStandard"
					tracksViewChanges={true}
					clusterColor={theme.colors.primary}
					clusterTextColor={theme.colors.onPrimary}
					initialRegion={initialRegion}
					clusteringEnabled={true}
					onMapReady={() => {
						fitToMarkersWithDelay();
					}}
					onError={(error) => {
						setMapError(true);
					}}>
					{markers.map((marker) => (
						<Marker
							key={`${marker.title}-${marker.date}`}
							coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
							title={marker.title}
							description={marker.description}
							pinColor={theme.colors.primary}>
							<Callout tooltip={true}>
								<Tooltip>{renderMarkerInfo(marker)}</Tooltip>
							</Callout>
						</Marker>
					))}
				</ClusteredMapView>
			)}
		</View>
	);
}
