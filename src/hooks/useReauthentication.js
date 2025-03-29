import React, { useState } from "react";
import { Text, Button, useTheme } from "react-native-paper";
import Input from "../components/Input"; // Your custom input component
import Modal from "../components/Modal"; // Your custom modal component
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export function useReauthentication() {
	const [visible, setVisible] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [error, setError] = useState("");
	const [resolver, setResolver] = useState(null);

	const theme = useTheme();

	// This function is called to open the modal and returns a promise.
	const openReauth = () => {
		setVisible(true);
		return new Promise((resolve, reject) => {
			setResolver({ resolve, reject });
		});
	};

	// Called when the user confirms their current password.
	const handleConfirm = async () => {
		const auth = getAuth();
		const user = auth.currentUser;
		if (!user) {
			setError("No user logged in.");
			resolver.reject(new Error("No user logged in."));
			return;
		}
		const credential = EmailAuthProvider.credential(user.email, currentPassword);
		try {
			await reauthenticateWithCredential(user, credential);
			resolver.resolve(); // Resolve the promise to signal success.
			closeModal();
		} catch (err) {
			setError(err.message);
			resolver.reject(err); // Reject the promise if reauthentication fails.
		}
	};

	const closeModal = () => {
		setVisible(false);
		setCurrentPassword("");
		setError("");
	};

	// The modal component to render
	const ReauthModal = () => (
		<Modal title="Reauthenticate" visible={visible} onDismiss={closeModal}>
			{error ? <Text style={{ color: "red" }}>{error}</Text> : null}
			<Input
				value={currentPassword}
				type="password"
				autofill="password"
				onChange={(text) => setCurrentPassword(text)}>
				Current Password
			</Input>
			<Button
				mode="contained"
				buttonColor={theme.colors.primary}
				contentStyle={{ padding: 4 }}
				labelStyle={{
					fontSize: 16,
					fontWeight: 600,
					color: theme.colors.onPrimary,
				}}
				onPress={handleConfirm}>
				Confirm
			</Button>
		</Modal>
	);

	return { openReauth, ReauthModal };
}
