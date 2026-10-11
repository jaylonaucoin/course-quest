module.exports = {
	rootDir: "..",
	testMatch: ["<rootDir>/e2e/**/*.e2e.js"],
	testTimeout: 120000,
	setupFilesAfterEnv: ["<rootDir>/e2e/init.js"],
	reporters: ["detox/runners/jest/reporter"],
	verbose: true,
};
