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
import NetInfo from "@react-native-community/netinfo";

// Cache keys for AsyncStorage
const CACHE_KEYS = {
	USER: "cached_user",
	ROUNDS: "cached_rounds",
	UNITS: "cached_units",
};

// Helper to check network connectivity
async function isOnline() {
	try {
		const state = await NetInfo.fetch();
		return state.isConnected && state.isInternetReachable !== false;
	} catch {
		return true; // Assume online if check fails
	}
}

// Helper to serialize Firestore Timestamps for caching
function serializeForCache(data) {
	if (!data) return data;
	if (Array.isArray(data)) {
		return data.map(serializeForCache);
	}
	if (typeof data === "object") {
		// Check if it's a Firestore Timestamp (has toDate method)
		if (data.toDate && typeof data.toDate === "function") {
			return { _isTimestamp: true, _seconds: data.seconds, _nanoseconds: data.nanoseconds };
		}
		// Recursively serialize object properties
		const serialized = {};
		for (const key in data) {
			serialized[key] = serializeForCache(data[key]);
		}
		return serialized;
	}
	return data;
}

// Helper to deserialize cached data back to usable format
function deserializeFromCache(data) {
	if (!data) return data;
	if (Array.isArray(data)) {
		return data.map(deserializeFromCache);
	}
	if (typeof data === "object") {
		// Check if it's a serialized Timestamp
		if (data._isTimestamp) {
			// Return an object that mimics Firestore Timestamp
			return {
				seconds: data._seconds,
				nanoseconds: data._nanoseconds,
				toDate: function () {
					return new Date(data._seconds * 1000 + data._nanoseconds / 1000000);
				},
			};
		}
		// Recursively deserialize object properties
		const deserialized = {};
		for (const key in data) {
			deserialized[key] = deserializeFromCache(data[key]);
		}
		return deserialized;
	}
	return data;
}

// Helper to get cached data
async function getCachedData(key) {
	try {
		const cached = await AsyncStorage.getItem(key);
		if (!cached) return null;
		const parsed = JSON.parse(cached);
		return deserializeFromCache(parsed);
	} catch (error) {
		console.error(`Error reading cache for ${key}:`, error);
		return null;
	}
}

// Helper to set cached data
async function setCachedData(key, data) {
	try {
		const serialized = serializeForCache(data);
		await AsyncStorage.setItem(key, JSON.stringify(serialized));
	} catch (error) {
		console.error(`Error writing cache for ${key}:`, error);
	}
}

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
			// Add both timestamp and a random string to ensure uniqueness
			const uniqueId = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 10);
			path = path + "/" + roundId + "/" + uniqueId;
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
			return uploadImage(image, path, roundId);
		});

		const results = await Promise.all(uploadPromises);
		return results.filter((url) => url !== null);
	} catch (error) {
		console.error("Error uploading images:", error);
		return [];
	}
}

export async function getUser(forceRefresh = false) {
	try {
		// Try cache first for immediate response (unless force refresh)
		if (!forceRefresh) {
			const cachedUser = await getCachedData(CACHE_KEYS.USER);
			if (cachedUser && cachedUser.uid === auth.currentUser?.uid) {
				// Return cached data immediately, then sync in background
				syncUserInBackground();
				return cachedUser;
			}
		}

		// Fetch from Firestore (works offline with persistence enabled)
		const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
		const userData = userDoc.exists()
			? {
					uid: auth.currentUser.uid,
					email: auth.currentUser.email,
					...userDoc.data(),
				}
			: null;

		// Cache the result
		if (userData) {
			await setCachedData(CACHE_KEYS.USER, userData);
		}

		return userData;
	} catch (error) {
		console.error("Error fetching user:", error);
		// Return cached data as fallback on error
		const cachedUser = await getCachedData(CACHE_KEYS.USER);
		if (cachedUser && cachedUser.uid === auth.currentUser?.uid) {
			return cachedUser;
		}
		return null;
	}
}

// Background sync for user data
async function syncUserInBackground() {
	try {
		const online = await isOnline();
		if (!online) return;

		const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
		if (userDoc.exists()) {
			const userData = {
				uid: auth.currentUser.uid,
				email: auth.currentUser.email,
				...userDoc.data(),
			};
			await setCachedData(CACHE_KEYS.USER, userData);
		}
	} catch (error) {
		// Silent fail for background sync
		console.debug("Background user sync failed:", error);
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
			units: ["celsius", "kilometers", "millimeters"],
			profilePicture: null,
			bio: null,
		});
	} catch (error) {
		console.error("Error setting user:", error);
	}
}

export async function getRounds(q = "date-desc", forceRefresh = false) {
	const field = q.split("-")[0];
	const direction = q.split("-")[1];

	try {
		// Try cache first for immediate response (unless force refresh)
		if (!forceRefresh) {
			const cachedRounds = await getCachedData(CACHE_KEYS.ROUNDS);
			if (cachedRounds && Array.isArray(cachedRounds) && cachedRounds.length > 0) {
				// Return cached data immediately, then sync in background
				syncRoundsInBackground(field, direction);
				// Sort cached rounds according to requested order
				return sortRounds(cachedRounds, field, direction);
			}
		}

		// Fetch from Firestore (works offline with persistence enabled)
		const snapshot = await getDocs(
			query(collection(db, "users", auth.currentUser.uid, "rounds"), orderBy(field, direction)),
		);
		const rounds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

		// Cache the result
		await setCachedData(CACHE_KEYS.ROUNDS, rounds);

		return rounds;
	} catch (error) {
		console.error("Error fetching rounds:", error);
		// Return cached data as fallback on error
		const cachedRounds = await getCachedData(CACHE_KEYS.ROUNDS);
		if (cachedRounds && Array.isArray(cachedRounds)) {
			return sortRounds(cachedRounds, field, direction);
		}
		return [];
	}
}

// Helper to sort rounds locally
function sortRounds(rounds, field, direction) {
	return [...rounds].sort((a, b) => {
		let aVal = a[field];
		let bVal = b[field];

		// Handle Firestore Timestamp objects
		if (aVal?.toDate) aVal = aVal.toDate();
		if (bVal?.toDate) bVal = bVal.toDate();

		// Handle date comparison
		if (aVal instanceof Date && bVal instanceof Date) {
			return direction === "asc" ? aVal - bVal : bVal - aVal;
		}

		// Handle numeric comparison
		if (typeof aVal === "number" && typeof bVal === "number") {
			return direction === "asc" ? aVal - bVal : bVal - aVal;
		}

		// Handle string comparison
		if (typeof aVal === "string" && typeof bVal === "string") {
			return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
		}

		return 0;
	});
}

// Background sync for rounds data
async function syncRoundsInBackground(field = "date", direction = "desc") {
	try {
		const online = await isOnline();
		if (!online) return;

		const snapshot = await getDocs(
			query(collection(db, "users", auth.currentUser.uid, "rounds"), orderBy(field, direction)),
		);
		const rounds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		await setCachedData(CACHE_KEYS.ROUNDS, rounds);
	} catch (error) {
		// Silent fail for background sync
		console.debug("Background rounds sync failed:", error);
	}
}

// Get cached rounds only (for offline use)
export async function getCachedRounds(q = "date-desc") {
	const field = q.split("-")[0];
	const direction = q.split("-")[1];
	const cachedRounds = await getCachedData(CACHE_KEYS.ROUNDS);
	if (cachedRounds && Array.isArray(cachedRounds)) {
		return sortRounds(cachedRounds, field, direction);
	}
	return [];
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
		const user = await getUser(true); // Force refresh
		const rounds = await getRounds("date-desc", true); // Force refresh
		// Update both old cache key (for backwards compatibility) and new cache keys
		await AsyncStorage.setItem("user", JSON.stringify({ ...user, rounds }));
		await setCachedData(CACHE_KEYS.USER, user);
		await setCachedData(CACHE_KEYS.ROUNDS, rounds);
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
			images: [],
			tees: tees,
			lat: Number(lat),
			lon: Number(lon),
			holes: holes || "18 holes",
		});

		// If we processed images, update the storage paths with the new round ID
		await uploadImages(images, "rounds", roundRef.id)
			.then(async (processedImages) => {
				await updateDoc(doc(db, "users", auth.currentUser.uid, "rounds", roundRef.id), {
					images: processedImages,
				});
			})
			.catch((error) => {
				console.error("Error uploading images:", error);
			});

		await setAsyncUserAndRounds();
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
			holes: holes || "18 holes",
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

export async function setUnits(temp, wind, rain) {
	try {
		const units = [temp, wind, rain];
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			units: units,
		});
		// Update cache immediately
		await setCachedData(CACHE_KEYS.UNITS, units);
		await setAsyncUserAndRounds();
	} catch (error) {
		console.error("Error setting units:", error);
		throw error; // Re-throw so caller knows it failed
	}
}

export async function getUnits() {
	const defaultUnits = ["celsius", "kilometers", "millimeters"];

	try {
		// Try cache first for immediate response
		const cachedUnits = await getCachedData(CACHE_KEYS.UNITS);
		if (cachedUnits && Array.isArray(cachedUnits) && cachedUnits.length === 3) {
			// Sync in background and return cached
			syncUnitsInBackground();
			return cachedUnits;
		}

		const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

		// Check if user document exists and has units property
		if (userDoc.exists()) {
			const userData = userDoc.data();

			// If units property exists, cache and return it
			if (userData.units) {
				await setCachedData(CACHE_KEYS.UNITS, userData.units);
				return userData.units;
			}

			// If units property doesn't exist, create it with default values
			await updateDoc(doc(db, "users", auth.currentUser.uid), {
				units: defaultUnits,
			});
			await setCachedData(CACHE_KEYS.UNITS, defaultUnits);
			return defaultUnits;
		}

		// Default values if user document doesn't exist
		return defaultUnits;
	} catch (error) {
		console.error("Error getting units:", error);
		// Return cached units or default values on error
		const cachedUnits = await getCachedData(CACHE_KEYS.UNITS);
		if (cachedUnits && Array.isArray(cachedUnits) && cachedUnits.length === 3) {
			return cachedUnits;
		}
		return defaultUnits;
	}
}

// Background sync for units
async function syncUnitsInBackground() {
	try {
		const online = await isOnline();
		if (!online) return;

		const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
		if (userDoc.exists()) {
			const userData = userDoc.data();
			if (userData.units) {
				await setCachedData(CACHE_KEYS.UNITS, userData.units);
			}
		}
	} catch (error) {
		// Silent fail for background sync
		console.debug("Background units sync failed:", error);
	}
}

// Clear all cached data (useful for logout)
export async function clearCache() {
	try {
		await AsyncStorage.multiRemove([CACHE_KEYS.USER, CACHE_KEYS.ROUNDS, CACHE_KEYS.UNITS, "user"]);
	} catch (error) {
		console.error("Error clearing cache:", error);
	}
}

// Export isOnline for use in screens that need network check
export { isOnline as checkNetworkStatus };
