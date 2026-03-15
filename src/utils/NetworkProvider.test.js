import React from "react";
import { render, screen } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "./NetworkProvider";

const netinfo = require("@react-native-community/netinfo");

function TestConsumer() {
	const { isOnline, showOfflineBanner } = useNetwork();
	return (
		<>
			<span data-testid="is-online">{String(isOnline)}</span>
			<span data-testid="show-banner">{String(showOfflineBanner)}</span>
		</>
	);
}

describe("NetworkProvider", () => {
	beforeEach(() => {
		netinfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
		netinfo.addEventListener.mockImplementation((callback) => {
			callback({ isConnected: true, isInternetReachable: true });
			return () => {};
		});
	});

	it("provides isOnline from NetInfo", async () => {
		render(
			<NetworkProvider>
				<TestConsumer />
			</NetworkProvider>
		);
		await screen.findByTestId("is-online");
		expect(screen.getByTestId("is-online").textContent).toBe("true");
	});

	it("sets showOfflineBanner when offline", async () => {
		netinfo.fetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
		netinfo.addEventListener.mockImplementation((callback) => {
			callback({ isConnected: false, isInternetReachable: false });
			return () => {};
		});
		render(
			<NetworkProvider>
				<TestConsumer />
			</NetworkProvider>
		);
		await screen.findByTestId("show-banner");
		expect(screen.getByTestId("show-banner").textContent).toBe("true");
	});
});
