describe("Settings E2E", () => {
	beforeAll(async () => {
		await device.launchApp({ newInstance: true });
	});

	it("should toggle theme", async () => {
		await element(by.id("email-input")).typeText("test@example.com");
		await element(by.id("password-input")).typeText("password123");
		await element(by.text("Sign In")).tap();
		await element(by.id("settings-tab")).tap();
		await element(by.id("theme-toggle")).tap();
	});

	it("should change units", async () => {
		await element(by.id("settings-tab")).tap();
		await element(by.text("Imperial")).tap();
		await expect(element(by.text("°F"))).toBeVisible();
	});

	it("should sign out", async () => {
		await element(by.text("Sign Out")).tap();
		await expect(element(by.text("Login"))).toBeVisible();
	});
});
