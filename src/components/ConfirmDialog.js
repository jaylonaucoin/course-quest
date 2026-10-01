import React from "react";
import { Dialog, Text, Button, useTheme, Portal } from "react-native-paper";

export default function ConfirmDialog({
	visible,
	onDismiss,
	onConfirm,
	title,
	message,
	confirmLabel = "Confirm",
	destructive = false,
}) {
	const theme = useTheme();
	return (
		<Portal>
			<Dialog visible={visible} onDismiss={onDismiss}>
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Content>
					<Text variant="bodyMedium">{message}</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={onDismiss}>Cancel</Button>
					<Button
						mode="contained"
						onPress={onConfirm}
						buttonColor={destructive ? theme.colors.error : undefined}
						textColor={destructive ? theme.colors.onError : undefined}>
						{confirmLabel}
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}
