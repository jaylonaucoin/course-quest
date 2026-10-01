export function handleError(error, userMessage = "Something went wrong", showToast) {
	console.error(error);
	if (showToast) {
		showToast(userMessage, "error");
	}
}
