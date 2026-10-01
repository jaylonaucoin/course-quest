import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar } from "react-native-paper";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
	const [visible, setVisible] = useState(false);
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);

	const showToast = useCallback((msg, type = "default") => {
		setMessage(msg);
		setIsError(type === "error");
		setVisible(true);
	}, []);

	const showError = useCallback(
		(msg) => {
			showToast(msg, "error");
		},
		[showToast],
	);

	const onDismiss = useCallback(() => {
		setVisible(false);
	}, []);

	return (
		<ToastContext.Provider value={{ showToast, showError }}>
			{children}
			<Snackbar
				visible={visible}
				onDismiss={onDismiss}
				duration={3000}
				style={isError ? { backgroundColor: "#B61A1A" } : undefined}
				action={{
					label: "Dismiss",
					onPress: onDismiss,
				}}>
				{message}
			</Snackbar>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within ToastProvider");
	}
	return context;
};
