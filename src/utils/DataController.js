import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../../firebaseConfig";
import { getDownloadURL, ref, uploadBytes, deleteObject, listAll } from "firebase/storage";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	updateDoc,
	addDoc,
	deleteDoc,
	query,
	orderBy,
	setDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EmailAuthProvider } from "firebase/auth";

// Function to pick an image, with optional auto-upload
export async function pickImage(upload = false) {
	try {
		// Request permission
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			alert("Permission to access media library is required!");
			return null;
		}

		// Open image picker
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images", "videos"],
			quality: 0.8, // Using 0.8 for better performance while maintaining quality
			allowsMultipleSelection: true,
			orderedSelection: true,
			aspect: [16, 9],
			selectionLimit: 10, // Limiting to 10 images max for better performance
		});

		if (result.canceled || !result.assets?.length) return null;

		// Upload if requested
		if (upload) {
			return await uploadImage(result.assets[0].uri);
		}

		// Return image URIs if not uploading
		return result.assets.map((asset) => asset.uri);
	} catch (error) {
		console.error("Error picking image:", error);
		return null;
	}
}

// Function to upload an image to Firebase Storage
export async function uploadImage(uri, path = "profilePicture", roundId = null) {
	try {
		if (!uri) return null;
		if (roundId) {
			path = path + "/" + roundId + "/" + Date.now().toString();
		}

		// Fetch image blob
		const response = await fetch(uri);
		if (!response.ok) {
			console.error("Failed to fetch image data.");
			return null;
		}
		const blob = await response.blob();

		// Upload image to Firebase Storage
		const imageRef = ref(storage, `images/${auth.currentUser.uid}/${path}`);
		await uploadBytes(imageRef, blob);
		const url = await getDownloadURL(imageRef);

		// Store URL in Firestore
		if (path === "profilePicture") {
			await updateDoc(doc(db, "users", auth.currentUser.uid), {
				profilePicture: url,
			});
		} else if (roundId) {
			const roundDocRef = doc(db, "users", auth.currentUser.uid, "rounds", roundId);
			const roundDoc = await getDoc(roundDocRef);

			if (roundDoc.exists()) {
				const roundData = roundDoc.data();
				await updateDoc(roundDocRef, {
					images: [...(roundData.images || []), url],
				});
			}
		}

		return url;
	} catch (error) {
		console.error("Error uploading image:", error);
		return null;
	}
}

// Function to upload multiple images as children of a single parent in Firebase Storage
export async function uploadImages(images, path, roundId) {
	try {
		if (!images || !images.length) return [];

		// Process images concurrently for better performance
		const uploadPromises = images.map((image) => {
			// Skip already uploaded images (they start with https://)
			if (image.startsWith("https://")) {
				return Promise.resolve(image);
			}
			return uploadImage(image, path, roundId);
		});

		const results = await Promise.all(uploadPromises);
		return results.filter((url) => url !== null);
	} catch (error) {
		console.error("Error uploading images:", error);
		return [];
	}
}

export async function getUser() {
	try {
		const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
		return userDoc.exists()
			? {
					uid: auth.currentUser.uid,
					email: auth.currentUser.email,
					...userDoc.data(),
				}
			: null;
	} catch (error) {
		console.error("Error fetching user:", error);
	}
}

export async function setUser(uid, email, firstName, lastName, homeCourse, city, province, country) {
	try {
		await setDoc(doc(db, "users", uid), {
			uid: uid,
			email: email,
			firstName: firstName,
			lastName: lastName,
			homeCourse: homeCourse,
			city: city,
			province: province,
			country: country,
			profilePicture: null,
			bio: null,
		});
	} catch (error) {
		console.error("Error setting user:", error);
	}
}

export async function getRounds(q = "date-desc") {
	const field = q.split("-")[0];
	const direction = q.split("-")[1];
	try {
		const snapshot = await getDocs(
			query(collection(db, "users", auth.currentUser.uid, "rounds"), orderBy(field, direction)),
		);
		return Object.values(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
	} catch (error) {
		console.error("Error fetching rounds:", error);
	}
}

export async function setProfileInfo(firstName, lastName, homeCourse, bio, city, province, country) {
	try {
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			firstName: firstName,
			lastName: lastName,
			homeCourse: homeCourse,
			city: city,
			province: province,
			country: country,
			bio: bio,
		});
		await setAsyncUserAndRounds();
	} catch (error) {
		console.error("Error saving changes:", error);
	}
}

export async function setAsyncUserAndRounds() {
	try {
		const user = await getUser();
		const rounds = await getRounds();
		await AsyncStorage.setItem("user", JSON.stringify({ ...user, rounds }));
	} catch (error) {
		console.error("Error setting user:", error);
	}
}

export async function addRound(
	course,
	date,
	score,
	temp,
	rain,
	wind,
	weatherCode,
	notes,
	images,
	tees,
	lat,
	lon,
	holes,
) {
	try {
		// Process images first if provided
		let processedImages = [];
		if (images && images.length > 0) {
			processedImages = await uploadImages(images, "rounds", null);
		}

		// Create the round document
		const roundRef = await addDoc(collection(db, "users", auth.currentUser.uid, "rounds"), {
			course: course,
			date: date,
			score: Number(score),
			temp: Number(temp),
			rain: Number(rain),
			wind: Number(wind),
			weatherCode: Number(weatherCode),
			notes: notes,
			images: processedImages,
			tees: tees,
			lat: Number(lat),
			lon: Number(lon),
			holes: holes,
		});

		// If we processed images, update the storage paths with the new round ID
		if (processedImages.length > 0) {
			processedImages = await uploadImages(images, "rounds", roundRef.id);
			await updateDoc(doc(db, "users", auth.currentUser.uid, "rounds", roundRef.id), {
				images: processedImages,
			});
		}

		await setAsyncUserAndRounds();
		return roundRef.id;
	} catch (error) {
		console.error("Error setting rounds:", error);
		throw error; // Re-throw to allow proper error handling
	}
}

export async function deleteRound(id) {
	try {
		// Delete round document from Firestore
		await deleteDoc(doc(db, "users", auth.currentUser.uid, "rounds", id));
		await setAsyncUserAndRounds(); // Refresh user and rounds data
		await deleteRoundImages(id); // Delete images related to this round
	} catch (error) {
		console.error("Error deleting round:", error);
	}
}

export async function deleteRoundImages(id) {
	try {
		const imagesRef = ref(storage, `images/${auth.currentUser.uid}/rounds/${id}`);
		const images = await listAll(imagesRef);

		// Delete all images related to this round
		for (const image of images.items) {
			try {
				await deleteObject(image); // Ensure each deletion is awaited
			} catch (imageError) {
				console.error(`Error deleting image ${image.name}:`, imageError);
			}
		}
	} catch (error) {
		console.error("Error deleting images:", error);
	}
}

export async function updateRound(
	id,
	course,
	date,
	score,
	temp,
	rain,
	wind,
	weatherCode,
	notes,
	images,
	tees,
	lat,
	lon,
	holes,
) {
	try {
		// Ensure all images are uploaded (handles both new and existing images)
		let processedImages = images;
		if (images && images.length > 0) {
			processedImages = await uploadImages(images, "rounds", id);
		}

		await updateDoc(doc(db, "users", auth.currentUser.uid, "rounds", id), {
			course: course,
			date: date,
			score: Number(score),
			temp: Number(temp),
			rain: Number(rain),
			wind: Number(wind),
			weatherCode: Number(weatherCode),
			notes: notes,
			images: processedImages,
			tees: tees,
			lat: Number(lat),
			lon: Number(lon),
			holes: holes || "18",
		});

		await setAsyncUserAndRounds();
	} catch (error) {
		console.error("Error updating round:", error);
		throw error; // Re-throw to allow proper error handling
	}
}

export async function getRound(id) {
	try {
		const roundDoc = await getDoc(doc(db, "users", auth.currentUser.uid, "rounds", id));
		return roundDoc.exists() ? { id: roundDoc.id, ...roundDoc.data() } : null;
	} catch (error) {
		console.error("Error fetching round:", error);
	}
}

export async function reauthenticate(currentPassword) {
	const user = auth.currentUser;
	const credential = EmailAuthProvider.credential(user.email, currentPassword);
	try {
		await user.reauthenticateWithCredential(credential);
		return true;
	} catch {
		return false;
	}
}

// New function to remove a specific image from Firebase Storage
export async function removeImage(imageUrl, roundId) {
	try {
		if (!imageUrl || !imageUrl.startsWith("https://")) return false;

		// Extract the storage path from the URL
		const pathRegex = new RegExp(`images/${auth.currentUser.uid}/.+`);
		const match = imageUrl.match(pathRegex);

		if (!match) {
			console.error("Could not parse image path from URL:", imageUrl);
			return false;
		}

		try {
			// Try to delete from storage
			const imageRef = ref(storage, match[0]);
			await deleteObject(imageRef);

			// Update the round document if roundId is provided
			if (roundId) {
				const roundRef = doc(db, "users", auth.currentUser.uid, "rounds", roundId);
				const roundDoc = await getDoc(roundRef);

				if (roundDoc.exists()) {
					const roundData = roundDoc.data();
					const updatedImages = (roundData.images || []).filter((url) => url !== imageUrl);

					await updateDoc(roundRef, {
						images: updatedImages,
					});

					return true;
				}
			}

			return true;
		} catch (error) {
			console.error("Error removing image:", error);
			return false;
		}
	} catch (error) {
		console.error("Error removing image:", error);
		return false;
	}
}
