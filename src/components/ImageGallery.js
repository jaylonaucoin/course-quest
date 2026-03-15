import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { IconButton, useTheme, Text } from "react-native-paper";

/**
 * A reusable component for managing images in forms
 * @param {Object} props
 * - images: Array of image URIs
 * - onAddImages: Function to call when adding new images
 * - onRemoveImage: Function to call when removing an image (receives image URI)
 * - isEditable: Boolean to determine if images can be edited
 */
const ImageGallery = ({ images = [], onAddImages, onRemoveImage, isEditable = true }) => {
	const theme = useTheme();
	const [activeImageIndex, setActiveImageIndex] = React.useState(0);

	if (images.length === 0) {
		return (
			<TouchableOpacity
				style={[styles.emptyContainer, { borderColor: theme.colors.outlineVariant }]}
				onPress={onAddImages}
				disabled={!isEditable}>
				<IconButton icon="image-plus" size={40} iconColor={theme.colors.primary} />
				<Text style={{ color: theme.colors.primary }}>Add Photos</Text>
			</TouchableOpacity>
		);
	}

	const renderThumbnail = ({ item: image, index }) => (
		<TouchableOpacity
			key={index}
			onPress={() => setActiveImageIndex(index)}
			style={[
				styles.thumbnailTouch,
				activeImageIndex === index && {
					borderColor: theme.colors.primary,
					borderWidth: 2,
				},
			]}>
			<Image source={{ uri: image }} style={styles.thumbnail} resizeMode="cover" />
			{isEditable && (
				<IconButton
					icon="trash-can"
					size={16}
					iconColor={theme.colors.errorContainer}
					style={styles.removeButton}
					onPress={() => onRemoveImage(image, index)}
				/>
			)}
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* Main image display */}
			<TouchableOpacity style={styles.mainImageContainer}>
				<Image source={{ uri: images[activeImageIndex] }} style={styles.mainImage} resizeMode="cover" />
				{images.length > 1 && (
					<View style={[styles.imageCountBadge, { backgroundColor: theme.colors.inverseSurface }]}>
						<Text style={{ color: theme.colors.inverseOnSurface, fontSize: 12 }}>
							{activeImageIndex + 1}/{images.length}
						</Text>
					</View>
				)}
			</TouchableOpacity>

			{/* Thumbnails */}
			{images.length > 1 && (
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.thumbnailScroll}
					contentContainerStyle={styles.thumbnailContainer}
					data={images}
					renderItem={renderThumbnail}
					keyExtractor={(_, index) => index.toString()}
				/>
			)}

			{/* Add more images button */}
			{isEditable && (
				<TouchableOpacity
					style={[styles.addButton, { backgroundColor: theme.colors.primaryContainer }]}
					onPress={onAddImages}>
					<IconButton icon="image-plus" size={24} iconColor={theme.colors.onPrimaryContainer} />
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		marginVertical: 10,
		position: "relative",
	},
	emptyContainer: {
		width: "100%",
		height: 200,
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 10,
	},
	mainImageContainer: {
		width: "100%",
		height: 250,
		borderRadius: 8,
		overflow: "hidden",
	},
	mainImage: {
		width: "100%",
		height: "100%",
	},
	imageCountBadge: {
		position: "absolute",
		bottom: 10,
		right: 10,
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	thumbnailScroll: {
		marginTop: 10,
		height: 80,
	},
	thumbnailContainer: {
		paddingHorizontal: 2,
		gap: 8,
	},
	thumbnailTouch: {
		width: 70,
		height: 70,
		borderRadius: 6,
		overflow: "hidden",
		position: "relative",
	},
	thumbnail: {
		width: "100%",
		height: "100%",
	},
	removeButton: {
		position: "absolute",
		top: -5,
		right: -5,
		margin: 0,
	},
	addButton: {
		position: "absolute",
		bottom: 10,
		right: 10,
		borderRadius: 30,
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 2,
	},
});

export default ImageGallery;
