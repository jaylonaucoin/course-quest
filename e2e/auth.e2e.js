describe("Auth E2E", () => {
	beforeAll(async () => {
		await device.launchApp({ newInstance: true });
	});

	it("should show auth screen on launch", async () => {
		await expect(element(by.text("Login"))).toBeVisible();
	});

	it("should toggle between Login and Register views", async () => {
		await element(by.text("Register")).tap();
		await expect(element(by.text("Sign Up"))).toBeVisible();
		await element(by.text("Login")).tap();
		await expect(element(by.text("Sign In"))).toBeVisible();
	});

	it("should complete full registration flow", async () => {
		await element(by.text("Register")).tap();
		await element(by.id("email-input")).typeText("newuser@example.com");
		await element(by.id("password-input")).typeText("password123");
		await element(by.text("Sign Up")).tap();
		await expect(element(by.text("Add Round"))).toBeVisible();
	});

	it("should login and logout cycle", async () => {
		await element(by.id("email-input")).typeText("test@example.com");
		await element(by.id("password-input")).typeText("password123");
		await element(by.text("Sign In")).tap();
		await element(by.id("settings-tab")).tap();
		await element(by.text("Sign Out")).tap();
		await expect(element(by.text("Login"))).toBeVisible();
	});

	it("should show password reset flow", async () => {
		await element(by.text("Forgot Password?")).tap();
		await element(by.id("email-input")).typeText("user@example.com");
		await element(by.text("Send Reset Link")).tap();
	});
});
