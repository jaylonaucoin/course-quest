import React from "react";
import { Modal, Portal, Text, useTheme } from "react-native-paper";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

export default function CustomModal({ visible, onDismiss, title, children, dismissable = true }) {
	const theme = useTheme();

	return (
		<Portal>
			<Modal
				visible={visible}
				dismissable={dismissable}
				dismissableBackButton={false}
				onDismiss={onDismiss}
				contentContainerStyle={{
					backgroundColor: theme.colors.surfaceVariant,
					padding: 30,
					borderRadius: 20,
					margin: 10,
					width: "85%",
					height: "55%",
					alignSelf: "center",
					alignItems: "center",
					justifyContent: "center",
				}}>
				{/* Modal content */}
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<View
						style={{
							alignSelf: "center",
							alignItems: "center",
							justifyContent: "center",
							width: "100%",
							height: "100%",
						}}>
						<Text
							variant="headlineMedium"
							style={{
								fontWeight: "bold",
								alignSelf: "center",
								textAlign: "center",
								marginBottom: 10,
							}}>
							{title}
						</Text>
						{children}
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</Portal>
	);
}
