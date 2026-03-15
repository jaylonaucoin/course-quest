const mockAuth = {
	currentUser: { uid: "test-uid", email: "test@example.com" },
	signInWithEmailAndPassword: jest.fn(),
	createUserWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
	sendPasswordResetEmail: jest.fn(),
	signInWithCredential: jest.fn(),
	onAuthStateChanged: jest.fn((callback) => {
		callback(mockAuth.currentUser);
		return () => {};
	}),
};

const mockDb = {};
const mockStorage = {};

export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;
