describe("Rounds E2E", () => {
	beforeAll(async () => {
		await device.launchApp({ newInstance: true });
	});

	it("should log a round after login", async () => {
		await element(by.id("email-input")).typeText("test@example.com");
		await element(by.id("password-input")).typeText("password123");
		await element(by.text("Sign In")).tap();
		await element(by.text("Add Round")).tap();
		await element(by.id("course-input")).typeText("Pebble Beach");
		await element(by.text("Save")).tap();
		await expect(element(by.text("Pebble Beach"))).toBeVisible();
	});

	it("should edit a round", async () => {
		await element(by.id("round-menu")).atIndex(0).tap();
		await element(by.text("Edit")).tap();
		await element(by.id("score-input")).clearText();
		await element(by.id("score-input")).typeText("74");
		await element(by.text("Save")).tap();
		await expect(element(by.text("74"))).toBeVisible();
	});

	it("should delete a round", async () => {
		await element(by.id("round-menu")).atIndex(0).tap();
		await element(by.text("Delete")).tap();
		await element(by.text("Confirm")).tap();
	});
});
