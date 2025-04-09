import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from "react-native";

const ImageGrid = ({ images, limit = 5, onImagePress }) => {
	const screenWidth = Dimensions.get("window").width - 30; // Account for container margins
	const screenHeight = 200; // Fixed height as in HomeScreen

	// Calculate how many images to actually display
	const totalImages = images.length;
	const hasOverflow = totalImages > limit;
	const displayCount = hasOverflow ? limit : totalImages;
	const extraImages = totalImages - limit;

	// Function to handle image press
	const handleImagePress = (index) => {
		// If clicking the last image with overlay, use the index of first hidden image
		if (hasOverflow && index === displayCount - 1) {
			onImagePress(limit - 1);
		} else {
			onImagePress(index);
		}
	};

	// Different layout styles based on number of images
	const renderImageGrid = () => {
		// For single image - take full space
		if (totalImages === 1) {
			return (
				<TouchableOpacity
					style={[styles.singleImage, { width: screenWidth, height: screenHeight }]}
					onPress={() => handleImagePress(0)}>
					<Image source={{ uri: images[0] }} style={styles.fullImage} />
				</TouchableOpacity>
			);
		}

		// For two images - stack side by side
		else if (totalImages === 2) {
			return (
				<View style={styles.rowContainer}>
					<TouchableOpacity
						style={[styles.halfImage, { width: screenWidth / 2 - 2, height: screenHeight }]}
						onPress={() => handleImagePress(0)}>
						<Image source={{ uri: images[0] }} style={styles.fullImage} />
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.halfImage, { width: screenWidth / 2 - 2, height: screenHeight }]}
						onPress={() => handleImagePress(1)}>
						<Image source={{ uri: images[1] }} style={styles.fullImage} />
					</TouchableOpacity>
				</View>
			);
		}

		// For three images - one big on left, two stacked on right
		else if (totalImages === 3) {
			return (
				<View style={styles.rowContainer}>
					<TouchableOpacity
						style={[styles.leftImage, { width: screenWidth / 2 - 2, height: screenHeight }]}
						onPress={() => handleImagePress(0)}>
						<Image source={{ uri: images[0] }} style={styles.fullImage} />
					</TouchableOpacity>
					<View style={styles.rightColumn}>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(1)}>
							<Image source={{ uri: images[1] }} style={styles.fullImage} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(2)}>
							<Image source={{ uri: images[2] }} style={styles.fullImage} />
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		// For four images - 2x2 grid
		else if (totalImages === 4) {
			return (
				<View style={styles.gridContainer}>
					<View style={styles.rowContainer}>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(0)}>
							<Image source={{ uri: images[0] }} style={styles.fullImage} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(1)}>
							<Image source={{ uri: images[1] }} style={styles.fullImage} />
						</TouchableOpacity>
					</View>
					<View style={styles.rowContainer}>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(2)}>
							<Image source={{ uri: images[2] }} style={styles.fullImage} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(3)}>
							<Image source={{ uri: images[3] }} style={styles.fullImage} />
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		// For 5+ images - first big, then 2x2 grid with last possibly having overlay
		else {
			const displayImages = images.slice(0, displayCount);

			return (
				<View style={styles.gridContainer}>
					<View style={styles.rowContainer}>
						<TouchableOpacity
							style={[styles.leftImage, { width: screenWidth / 2 - 2, height: screenHeight }]}
							onPress={() => handleImagePress(0)}>
							<Image source={{ uri: displayImages[0] }} style={styles.fullImage} />
						</TouchableOpacity>
						<View style={styles.rightColumn}>
							<TouchableOpacity
								style={[
									styles.smallImage,
									{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
								]}
								onPress={() => handleImagePress(1)}>
								<Image source={{ uri: displayImages[1] }} style={styles.fullImage} />
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.smallImage,
									{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
								]}
								onPress={() => handleImagePress(2)}>
								<Image source={{ uri: displayImages[2] }} style={styles.fullImage} />
							</TouchableOpacity>
						</View>
					</View>
					<View style={styles.rowContainer}>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(3)}>
							<Image source={{ uri: displayImages[3] }} style={styles.fullImage} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.smallImage,
								{ width: screenWidth / 2 - 2, height: screenHeight / 2 - 2 },
							]}
							onPress={() => handleImagePress(4)}>
							<Image source={{ uri: displayImages[4] }} style={styles.fullImage} />
							{hasOverflow && (
								<View style={styles.overlay}>
									<Text style={styles.overlayText}>+{extraImages}</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
				</View>
			);
		}
	};

	return <View style={styles.container}>{renderImageGrid()}</View>;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 5,
	},
	gridContainer: {
		flex: 1,
		flexDirection: "column",
	},
	rowContainer: {
		flexDirection: "row",
		flex: 1,
	},
	rightColumn: {
		flexDirection: "column",
		flex: 1,
	},
	singleImage: {
		marginBottom: 4,
		borderRadius: 8,
		overflow: "hidden",
	},
	halfImage: {
		marginHorizontal: 2,
		marginBottom: 4,
		borderRadius: 8,
		overflow: "hidden",
	},
	leftImage: {
		marginRight: 2,
		marginBottom: 4,
		borderRadius: 8,
		overflow: "hidden",
	},
	smallImage: {
		margin: 2,
		borderRadius: 8,
		overflow: "hidden",
		position: "relative",
	},
	fullImage: {
		width: "100%",
		height: "100%",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	overlayText: {
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
	},
});

export default ImageGrid;
