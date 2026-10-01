import {
	getUser,
	setUser,
	getRounds,
	addRound,
	updateRound,
	deleteRound,
	getRound,
	setUnits,
	getUnits,
	clearCache,
	getCachedRounds,
	checkNetworkStatus,
} from "./DataController";
import { getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, doc, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { auth } from "../../__mocks__/firebaseConfig";

beforeEach(() => {
	jest.clearAllMocks();
	doc.mockReturnValue({ id: "mock-doc-ref", path: "users/test-uid" });
	collection.mockReturnValue({ id: "mock-collection-ref", path: "users/test-uid/rounds" });
	AsyncStorage.getItem.mockClear();
	AsyncStorage.setItem.mockClear();
	AsyncStorage.multiRemove.mockClear();
	NetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
	auth.currentUser = { uid: "test-uid", email: "test@example.com" };
	global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) });
});

describe("getUser", () => {
	it("returns cached user when cache hit and not force refresh", async () => {
		const cachedUser = { uid: "test-uid", email: "test@example.com", firstName: "Test" };
		AsyncStorage.getItem.mockResolvedValue(
			JSON.stringify({
				...cachedUser,
				uid: "test-uid",
			}),
		);

		const result = await getUser(false);
		expect(result).toEqual(expect.objectContaining({ uid: "test-uid", firstName: "Test" }));
		expect(AsyncStorage.getItem).toHaveBeenCalledWith("cached_user");
	});

	it("fetches from Firestore when online and force refresh", async () => {
		const userData = { firstName: "John", lastName: "Doe", homeCourse: "Pebble Beach" };
		getDoc.mockResolvedValue({
			exists: () => true,
			data: () => userData,
		});

		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getUser(true);
		expect(result).toMatchObject({
			uid: "test-uid",
			email: "test@example.com",
			...userData,
		});
		expect(AsyncStorage.setItem).toHaveBeenCalled();
	});

	it("returns null when user doc does not exist", async () => {
		getDoc.mockResolvedValue({ exists: () => false });
		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getUser(true);
		expect(result).toBeNull();
	});

	it("returns cached user on Firestore error when cache matches", async () => {
		getDoc.mockRejectedValue(new Error("Network error"));
		const cachedUser = { uid: "test-uid", email: "test@example.com" };
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedUser));

		const result = await getUser(true);
		expect(result).toEqual(cachedUser);
	});

	it("returns null on error when cache empty or mismatch", async () => {
		getDoc.mockRejectedValue(new Error("Network error"));
		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getUser(true);
		expect(result).toBeNull();
	});
});

describe("setUser", () => {
	it("writes correct doc structure to Firestore", async () => {
		setDoc.mockResolvedValue(undefined);

		await setUser(
			"uid-1",
			"user@test.com",
			"John",
			"Doe",
			"Pebble Beach",
			"Pebble Beach",
			"California",
			"USA",
		);

		expect(setDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				uid: "uid-1",
				email: "user@test.com",
				firstName: "John",
				lastName: "Doe",
				homeCourse: "Pebble Beach",
				city: "Pebble Beach",
				province: "California",
				country: "USA",
				units: ["celsius", "kilometers", "millimeters"],
				profilePicture: null,
				bio: null,
			}),
		);
	});
});

describe("getRounds", () => {
	it("returns cached rounds when available and not force refresh", async () => {
		const cachedRounds = [
			{ id: "1", course: "Course A", score: 72, date: { _isTimestamp: true, _seconds: 1000000, _nanoseconds: 0 } },
		];
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedRounds));

		const result = await getRounds("date-desc", false);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ course: "Course A", score: 72 });
	});

	it("fetches from Firestore when online and force refresh", async () => {
		getDocs.mockResolvedValue({
			docs: [
				{
					id: "r1",
					data: () => ({ course: "Pebble Beach", score: 75, date: new Date() }),
				},
			],
		});
		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getRounds("date-desc", true);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ id: "r1", course: "Pebble Beach", score: 75 });
		expect(AsyncStorage.setItem).toHaveBeenCalledWith("cached_rounds", expect.any(String));
	});

	it("sorts by score asc correctly", async () => {
		const cachedRounds = [
			{ id: "1", score: 80, date: new Date("2024-01-01") },
			{ id: "2", score: 72, date: new Date("2024-01-02") },
		];
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedRounds));

		const result = await getRounds("score-asc", false);
		expect(result[0].score).toBe(72);
		expect(result[1].score).toBe(80);
	});

	it("sorts by score desc correctly", async () => {
		const cachedRounds = [
			{ id: "1", score: 72, date: new Date("2024-01-01") },
			{ id: "2", score: 80, date: new Date("2024-01-02") },
		];
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedRounds));

		const result = await getRounds("score-desc", false);
		expect(result[0].score).toBe(80);
		expect(result[1].score).toBe(72);
	});

	it("returns empty array on error when no cache", async () => {
		getDocs.mockRejectedValue(new Error("Network error"));
		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getRounds("date-desc", true);
		expect(result).toEqual([]);
	});
});

describe("addRound", () => {
	it("creates Firestore doc with correct fields", async () => {
		addDoc.mockResolvedValue({ id: "new-round-id" });
		updateDoc.mockResolvedValue(undefined);
		getDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });
		getDocs.mockResolvedValue({ docs: [] });
		AsyncStorage.setItem.mockResolvedValue(undefined);

		await addRound(
			"Pebble Beach",
			new Date("2024-06-15"),
			72,
			22,
			0,
			15,
			0,
			"Great round",
			[],
			"Blue",
			36.57,
			-121.95,
			"18 holes",
		);

		expect(addDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				course: "Pebble Beach",
				score: 72,
				temp: 22,
				rain: 0,
				wind: 15,
				weatherCode: 0,
				notes: "Great round",
				images: [],
				tees: "Blue",
				lat: 36.57,
				lon: -121.95,
				holes: "18 holes",
			}),
		);
	});

	it("uploads images and stores URLs", async () => {
		addDoc.mockResolvedValue({ id: "round-123" });
		updateDoc.mockResolvedValue(undefined);
		getDoc.mockResolvedValue({ exists: () => true, data: () => ({ images: [] }) });
		getDocs.mockResolvedValue({ docs: [] });

		const { getDownloadURL } = require("firebase/storage");
		getDownloadURL.mockResolvedValue("https://example.com/uploaded.jpg");

		await addRound(
			"Course",
			new Date(),
			72,
			20,
			0,
			10,
			0,
			"",
			["file:///photo.jpg"],
			"",
			0,
			0,
			"18 holes",
		);

		expect(updateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				images: expect.arrayContaining([expect.stringContaining("https://example.com/")]),
			}),
		);
	});
});

describe("updateRound", () => {
	it("updates existing doc with new data", async () => {
		updateDoc.mockResolvedValue(undefined);
		getDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });
		getDocs.mockResolvedValue({ docs: [] });

		await updateRound(
			"round-1",
			"New Course",
			new Date(),
			74,
			22,
			0,
			12,
			0,
			"Updated notes",
			[],
			"White",
			36.5,
			-122,
			"18 holes",
		);

		expect(updateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				course: "New Course",
				score: 74,
				notes: "Updated notes",
				tees: "White",
			}),
		);
	});
});

describe("deleteRound", () => {
	it("deletes doc and refreshes data", async () => {
		deleteDoc.mockResolvedValue(undefined);
		getDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });
		getDocs.mockResolvedValue({ docs: [] });
		const { listAll } = require("firebase/storage");
		listAll.mockResolvedValue({ items: [] });

		await deleteRound("round-1");

		expect(deleteDoc).toHaveBeenCalled();
		expect(AsyncStorage.setItem).toHaveBeenCalled();
	});
});

describe("setUnits", () => {
	it("writes units to Firestore and cache", async () => {
		updateDoc.mockResolvedValue(undefined);
		getDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });
		getDocs.mockResolvedValue({ docs: [] });

		await setUnits("fahrenheit", "miles", "inches");

		expect(updateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				units: ["fahrenheit", "miles", "inches"],
			}),
		);
		expect(AsyncStorage.setItem).toHaveBeenCalled();
	});
});

describe("getUnits", () => {
	it("returns cached units when available", async () => {
		const cached = ["fahrenheit", "miles", "inches"];
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cached));

		const result = await getUnits();
		expect(result).toEqual(cached);
	});

	it("returns default units when no cache and no user doc", async () => {
		getDoc.mockResolvedValue({ exists: () => false });
		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getUnits();
		expect(result).toEqual(["celsius", "kilometers", "millimeters"]);
	});

	it("returns cached units on error when cache valid", async () => {
		getDoc.mockRejectedValue(new Error("Network error"));
		AsyncStorage.getItem.mockResolvedValueOnce(null).mockResolvedValueOnce(
			JSON.stringify(["fahrenheit", "miles", "inches"]),
		);

		const result = await getUnits();
		expect(result).toEqual(["fahrenheit", "miles", "inches"]);
	});
});

describe("clearCache", () => {
	it("removes all AsyncStorage cache keys", async () => {
		AsyncStorage.multiRemove.mockResolvedValue(undefined);

		await clearCache();

		expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
			"cached_user",
			"cached_rounds",
			"cached_units",
			"user",
		]);
	});
});

describe("getCachedRounds", () => {
	it("returns sorted cached rounds", async () => {
		const cached = [
			{ id: "1", score: 80, date: new Date("2024-01-01") },
			{ id: "2", score: 72, date: new Date("2024-01-02") },
		];
		AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cached));

		const result = await getCachedRounds("score-asc");
		expect(result[0].score).toBe(72);
	});

	it("returns empty array when no cache", async () => {
		AsyncStorage.getItem.mockResolvedValue(null);

		const result = await getCachedRounds("date-desc");
		expect(result).toEqual([]);
	});
});

describe("serialize/deserialize Timestamp round-trip", () => {
	it("preserves Timestamp-like objects through cache", async () => {
		const serialized = JSON.stringify([
			{
				id: "1",
				date: { _isTimestamp: true, _seconds: 1718409600, _nanoseconds: 0 },
				score: 72,
			},
		]);
		AsyncStorage.getItem.mockResolvedValue(serialized);

		const result = await getCachedRounds("date-desc");
		expect(result).toHaveLength(1);
		expect(result[0].date).toBeDefined();
		expect(typeof result[0].date.toDate).toBe("function");
		expect(result[0].date.toDate()).toEqual(new Date(1718409600 * 1000));
	});
});

describe("checkNetworkStatus", () => {
	it("returns true when connected and reachable", async () => {
		NetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });

		const result = await checkNetworkStatus();
		expect(result).toBe(true);
	});

	it("returns false when disconnected", async () => {
		NetInfo.fetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });

		const result = await checkNetworkStatus();
		expect(result).toBe(false);
	});
});
