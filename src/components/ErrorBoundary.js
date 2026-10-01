import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, Button, useTheme } from "react-native-paper";

export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught error:", error, errorInfo);
	}

	handleRetry = () => {
		this.setState({ hasError: false });
	};

	render() {
		if (this.state.hasError) {
			return <ErrorFallback onRetry={this.handleRetry} />;
		}
		return this.props.children;
	}
}

function ErrorFallback({ onRetry }) {
	const theme = useTheme();
	return (
		<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
			<Surface style={styles.surface} elevation={1}>
				<Text variant="headlineSmall" style={styles.title}>
					Something went wrong
				</Text>
				<Text variant="bodyMedium" style={styles.message}>
					An unexpected error occurred. Tap Retry to try again.
				</Text>
				<Button mode="contained" onPress={onRetry} style={styles.button}>
					Retry
				</Button>
			</Surface>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	surface: {
		padding: 24,
		borderRadius: 12,
		maxWidth: 320,
		alignItems: "center",
	},
	title: {
		marginBottom: 12,
		textAlign: "center",
	},
	message: {
		marginBottom: 24,
		textAlign: "center",
		opacity: 0.8,
	},
	button: {
		minWidth: 120,
	},
});
