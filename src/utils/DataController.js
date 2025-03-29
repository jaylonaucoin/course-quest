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
			mediaTypes: ["images"],
			quality: 1,
			allowsMultipleSelection: !upload,
			orderedSelection: true,
			aspect: [16, 9],
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
		const urls = [];

		for (const image of images) {
			const url = await uploadImage(image, path, roundId);
			urls.push(url);
		}

		return urls;
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

export async function setUser(uid, email, firstName, lastName, homeCourse) {
	try {
		await setDoc(doc(db, "users", uid), {
			uid: uid,
			email: email,
			firstName: firstName,
			lastName: lastName,
			homeCourse: homeCourse,
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

export async function setProfileInfo(firstName, lastName, homeCourse, bio) {
	try {
		await updateDoc(doc(db, "users", auth.currentUser.uid), {
			firstName: firstName,
			lastName: lastName,
			homeCourse: homeCourse,
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

export async function addRound(course, date, score, temp, rain, wind, notes, images, tees) {
	try {
		const roundRef = await addDoc(collection(db, "users", auth.currentUser.uid, "rounds"), {
			course: course,
			date: date,
			score: Number(score),
			temp: Number(temp),
			rain: Number(rain),
			wind: Number(wind),
			notes: notes,
			images: [images],
			tees: tees,
		});
		await setAsyncUserAndRounds();
		return roundRef.id;
	} catch (error) {
		console.error("Error setting rounds:", error);
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
				console.log(`Deleted image: ${image.name}`);
			} catch (imageError) {
				console.error(`Error deleting image ${image.name}:`, imageError);
			}
		}
	} catch (error) {
		console.error("Error deleting images:", error);
	}
}

export async function updateRound(id, course, date, score, temp, rain, wind, notes, image, tees) {
	try {
		console.log("Updating round:", id);
		await updateDoc(doc(db, "users", auth.currentUser.uid, "rounds", id), {
			course: course,
			date: date,
			score: score,
			temp: temp,
			rain: rain,
			wind: wind,
			notes: notes,
			images: image,
			tees: tees,
		});
		console.log("Round updated:", id);
		await setAsyncUserAndRounds();
		console.log("User and rounds updated");
	} catch (error) {
		console.error("Error updating round:", error);
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
	} catch (error) {
		return false;
	}
}
