import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
	const [isConnected, setIsConnected] = useState(true);
	const [isInternetReachable, setIsInternetReachable] = useState(true);
	const [connectionType, setConnectionType] = useState(null);
	const [showOfflineBanner, setShowOfflineBanner] = useState(false);

	useEffect(() => {
		// Subscribe to network state updates
		const unsubscribe = NetInfo.addEventListener((state) => {
			const connected = state.isConnected;
			const reachable = state.isInternetReachable;

			setIsConnected(connected);
			setIsInternetReachable(reachable);
			setConnectionType(state.type);

			// Show offline banner when disconnected or internet not reachable
			// Use a slight delay to avoid flickering on brief disconnections
			if (!connected || reachable === false) {
				setShowOfflineBanner(true);
			} else if (connected && reachable !== false) {
				// Hide banner after a short delay to confirm connection is stable
				setTimeout(() => {
					setShowOfflineBanner(false);
				}, 1000);
			}
		});

		// Fetch initial network state
		NetInfo.fetch().then((state) => {
			setIsConnected(state.isConnected);
			setIsInternetReachable(state.isInternetReachable);
			setConnectionType(state.type);
			setShowOfflineBanner(!state.isConnected || state.isInternetReachable === false);
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	// Function to manually check network status
	const checkConnection = useCallback(async () => {
		const state = await NetInfo.fetch();
		setIsConnected(state.isConnected);
		setIsInternetReachable(state.isInternetReachable);
		setConnectionType(state.type);
		return state.isConnected && state.isInternetReachable !== false;
	}, []);

	// Determine if the app is effectively online (connected and internet reachable)
	const isOnline = isConnected && isInternetReachable !== false;

	return (
		<NetworkContext.Provider
			value={{
				isConnected,
				isInternetReachable,
				isOnline,
				connectionType,
				showOfflineBanner,
				checkConnection,
			}}>
			{children}
		</NetworkContext.Provider>
	);
};

export const useNetwork = () => {
	const context = useContext(NetworkContext);
	if (!context) {
		throw new Error("useNetwork must be used within a NetworkProvider");
	}
	return context;
};

export default NetworkProvider;
