const storage = new Map();

export default {
	getItem: jest.fn((key) => Promise.resolve(storage.get(key) ?? null)),
	setItem: jest.fn((key, value) => {
		storage.set(key, value);
		return Promise.resolve();
	}),
	removeItem: jest.fn((key) => {
		storage.delete(key);
		return Promise.resolve();
	}),
	multiRemove: jest.fn((keys) => {
		keys.forEach((k) => storage.delete(k));
		return Promise.resolve();
	}),
	clear: jest.fn(() => {
		storage.clear();
		return Promise.resolve();
	}),
	getAllKeys: jest.fn(() => Promise.resolve([...storage.keys()])),
};
