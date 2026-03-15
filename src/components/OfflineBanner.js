import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { Text, Icon, useTheme } from "react-native-paper";
import { useNetwork } from "../utils/NetworkProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OfflineBanner() {
	const { showOfflineBanner, isOnline } = useNetwork();
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const slideAnim = useRef(new Animated.Value(-60)).current;

	useEffect(() => {
		if (showOfflineBanner) {
			// Slide in
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 50,
				friction: 8,
			}).start();
		} else {
			// Slide out
			Animated.timing(slideAnim, {
				toValue: -60,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}, [showOfflineBanner, slideAnim]);

	// Don't render anything if online and banner is hidden
	if (!showOfflineBanner && isOnline) {
		return null;
	}

	return (
		<Animated.View
			style={[
				styles.container,
				{
					backgroundColor: theme.colors.errorContainer,
					paddingTop: insets.top > 0 ? insets.top : 8,
					transform: [{ translateY: slideAnim }],
				},
			]}>
			<View style={styles.content}>
				<Icon source="wifi-off" size={20} color={theme.colors.onErrorContainer} />
				<Text style={[styles.text, { color: theme.colors.onErrorContainer }]}>
					You're offline. Some features may be unavailable.
				</Text>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
		paddingBottom: 8,
		paddingHorizontal: 16,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	text: {
		fontSize: 13,
		fontWeight: "500",
	},
});
