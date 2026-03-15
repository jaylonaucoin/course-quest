import "@testing-library/jest-dom";

jest.mock("firebase/firestore", () => ({
	collection: jest.fn(),
	doc: jest.fn(),
	getDoc: jest.fn(),
	getDocs: jest.fn(),
	setDoc: jest.fn(),
	addDoc: jest.fn(),
	updateDoc: jest.fn(),
	deleteDoc: jest.fn(),
	query: jest.fn(),
	orderBy: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
	getAuth: jest.fn(() => ({ currentUser: { uid: "test-uid", email: "test@example.com" } })),
	signInWithEmailAndPassword: jest.fn(),
	createUserWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
	sendPasswordResetEmail: jest.fn(),
	sendEmailVerification: jest.fn(),
	signInWithCredential: jest.fn(),
	reauthenticateWithCredential: jest.fn(),
	verifyBeforeUpdateEmail: jest.fn(),
	updatePassword: jest.fn(),
	updateProfile: jest.fn(),
	OAuthProvider: jest.fn(),
	EmailAuthProvider: {
		credential: jest.fn((email, password) => ({ providerId: "password", email, password })),
	},
}));

jest.mock("firebase/storage", () => ({
	ref: jest.fn(),
	uploadBytes: jest.fn(),
	getDownloadURL: jest.fn(() => Promise.resolve("https://example.com/photo.jpg")),
	deleteObject: jest.fn(),
	listAll: jest.fn(() => Promise.resolve({ items: [] })),
}));

jest.mock("@react-native-community/netinfo", () => ({
	fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
	addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock("react-native-maps", () => {
	const { View } = require("react-native");
	return {
		__esModule: true,
		default: View,
		Marker: View,
		Callout: View,
		PROVIDER_GOOGLE: "google",
	};
});

jest.mock("react-native-map-clustering", () => {
	const { View } = require("react-native");
	return {
		__esModule: true,
		default: View,
	};
});

jest.mock("expo-image-picker", () => ({
	requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
	launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: "file://photo.jpg" }] }),
	MediaTypeOptions: { Images: "Images" },
}));

jest.mock("@expo/vector-icons", () => {
	const React = require("react");
	const { View } = require("react-native");
	return {
		Ionicons: View,
		FontAwesome5: View,
		FontAwesome6: View,
		MaterialCommunityIcons: View,
	};
});

jest.mock("@react-native-community/datetimepicker");

jest.mock("expo-apple-authentication", () => ({
	AppleAuthentication: {
		signInAsync: jest.fn(),
		CredentialState: { AUTHORIZED: 1, REVOKED: 2 },
	},
	isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock("react-native-reanimated", () => {
	const View = require("react-native").View;
	return {
		__esModule: true,
		default: {
			createAnimatedComponent: (c) => c,
			View,
		},
		FadeIn: jest.fn(),
		FadeOut: jest.fn(),
		SlideInDown: jest.fn(),
		Layout: jest.fn(),
	};
});

jest.mock("react-native-image-viewing", () => {
	const { View } = require("react-native");
	return {
		__esModule: true,
		default: View,
	};
});
