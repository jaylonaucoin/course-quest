describe("Offline E2E", () => {
	beforeAll(async () => {
		await device.launchApp({ newInstance: true });
	});

	it("should show OfflineBanner when network disabled", async () => {
		await device.disableSynchronization();
		await element(by.id("email-input")).typeText("test@example.com");
		await element(by.id("password-input")).typeText("password123");
		await element(by.text("Sign In")).tap();
		await device.setURLBlacklist([".*"]);
		await element(by.id("home-tab")).tap();
		await expect(element(by.text(/offline|no connection/i))).toBeVisible();
		await device.setURLBlacklist([]);
		await device.enableSynchronization();
	});

	it("should display cached data when offline", async () => {
		await device.launchApp({ newInstance: false });
	});
});
