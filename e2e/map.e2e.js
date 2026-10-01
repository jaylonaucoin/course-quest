describe("Map E2E", () => {
	beforeAll(async () => {
		await device.launchApp({ newInstance: true });
	});

	it("should show map tab", async () => {
		await element(by.id("email-input")).typeText("test@example.com");
		await element(by.id("password-input")).typeText("password123");
		await element(by.text("Sign In")).tap();
		await element(by.id("map-tab")).tap();
		await expect(element(by.id("map-view"))).toBeVisible();
	});

	it("should show round markers when rounds exist", async () => {
		await element(by.id("map-tab")).tap();
		await waitFor(element(by.id("map-marker"))).toBeVisible().withTimeout(5000);
	});
});
