import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import {
	signOut,
	getAuth,
	sendEmailVerification,
	verifyBeforeUpdateEmail,
	updatePassword,
	deleteUser,
} from "firebase/auth";
import { ToggleButton, Button, Text, useTheme, Icon } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeContext } from "../utils/ThemeProvider";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { useReauthentication } from "../hooks/useReauthentication";
import { setUnits, getUnits } from "../utils/DataController";

export default function SettingsScreen({ navigation }) {
	const auth = getAuth();
	const { openReauth, ReauthModal } = useReauthentication();

	const [visible, setVisible] = useState(false);
	const [modalType, setModalType] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordMismatch, setPasswordMismatch] = useState(false);
	const [error, setError] = useState("");
	const [unitSystem, setUnitSystem] = useState(() => getUnits() || "metric");
	const [tempUnit, setTempUnit] = useState(() => getUnits() || "celsius");
	const [windUnit, setWindUnit] = useState(() => getUnits() || "kilometers");
	const [rainUnit, setRainUnit] = useState(() => getUnits() || "millimeters");

	const { themeMode, toggleTheme } = useThemeContext();
	const theme = useTheme();

	useEffect(() => {
		// Initialize unit settings from stored values
		const loadUnitSettings = async () => {
			try {
				const unitValues = await getUnits();
				if (!unitValues || unitValues.length < 3) return;

				// Set individual unit values with defaults if values are undefined
				const [tempValue = "celsius", windValue = "kilometers", rainValue = "millimeters"] = unitValues;

				setTempUnit(tempValue);
				setWindUnit(windValue);
				setRainUnit(rainValue);

				// Determine unit system based on the combination
				if (tempValue === "celsius" && windValue === "kilometers" && rainValue === "millimeters") {
					setUnitSystem("metric");
				} else if (tempValue === "fahrenheit" && windValue === "miles" && rainValue === "inches") {
					setUnitSystem("imperial");
				} else {
					setUnitSystem("custom");
				}
			} catch (error) {
				console.error("Error loading unit settings:", error);
				// Set defaults if there's an error
				setTempUnit("celsius");
				setWindUnit("kilometers");
				setRainUnit("millimeters");
				setUnitSystem("metric");
			}
		};

		loadUnitSettings();
	}, []);

	const signOutUser = async () => {
		try {
			await signOut(auth);
			navigation.reset({
				index: 0,
				routes: [{ name: "Auth" }],
			});
		} catch (error) {
			console.error(error);
		}
	};

	const setModalVisible = async (type) => {
		setModalType(type);
		setVisible(true);
	};

	// Separate functions for direct unit system changes to ensure proper DB updates
	const handleUnitSystemChange = async (value) => {
		if (!value) return; // Ignore null values

		console.log(`Changing unit system from ${unitSystem} to ${value}`);
		setUnitSystem(value);

		// Update DB directly with proper values based on the new system
		if (value === "imperial") {
			setTempUnit("fahrenheit");
			setWindUnit("miles");
			setRainUnit("inches");
			await setUnits("fahrenheit", "miles", "inches");
			console.log("Set imperial units directly");
		} else if (value === "metric") {
			setTempUnit("celsius");
			setWindUnit("kilometers");
			setRainUnit("millimeters");
			await setUnits("celsius", "kilometers", "millimeters");
			console.log("Set metric units directly");
		}
		// Custom system uses the existing individual unit values
	};

	// Individual unit change handlers
	const handleTempUnitChange = async (value) => {
		if (!value) return; // Ignore null values
		console.log(`Changing temp unit from ${tempUnit} to ${value}`);
		setTempUnit(value);
		if (unitSystem === "custom") {
			await setUnits(value, windUnit, rainUnit);
			console.log(`Updated temp unit in DB: ${value}`);
		}
	};

	const handleWindUnitChange = async (value) => {
		if (!value) return; // Ignore null values
		console.log(`Changing wind unit from ${windUnit} to ${value}`);
		setWindUnit(value);
		if (unitSystem === "custom") {
			await setUnits(tempUnit, value, rainUnit);
			console.log(`Updated wind unit in DB: ${value}`);
		}
	};

	const handleRainUnitChange = async (value) => {
		if (!value) return; // Ignore null values
		console.log(`Changing rain unit from ${rainUnit} to ${value}`);
		setRainUnit(value);
		if (unitSystem === "custom") {
			await setUnits(tempUnit, windUnit, value);
			console.log(`Updated rain unit in DB: ${value}`);
		}
	};

	const handleUpdateEmail = async () => {
		try {
			setVisible(false);
			await openReauth(); // Wait for successful reauthentication
			setVisible(true);
			if (email === "") {
				setError("Email cannot be empty");
				return;
			}
			if (email === auth.currentUser.email) {
				setError("New email cannot be the same as the current email");
				return;
			}
			await verifyBeforeUpdateEmail(auth.currentUser, email);
			setVisible(false);
			alert("Email updated successfully!");
		} catch (error) {
			alert("Failed to update email: " + error.message);
		}
	};

	const handlePasswordUpdate = async () => {
		try {
			setVisible(false);
			await openReauth(); // Wait for successful reauthentication
			setVisible(true);
			if (password !== confirmPassword) {
				setPasswordMismatch(true);
				return;
			}
			await updatePassword(auth.currentUser, password);
			setVisible(false);
			alert("Password updated successfully!");
		} catch (error) {
			alert("Failed to update password: " + error.message);
		}
	};

	const handleDeleteAccount = async () => {
		try {
			await openReauth(); // Wait for successful reauthentication
			await deleteUser(auth.currentUser);
			alert("Account deleted successfully!");
			navigation.reset({
				index: 0,
				routes: [{ name: "Auth" }],
			});
		} catch (error) {
			alert("Failed to delete account: " + error.message);
		}
	};

	const hideModal = () => {
		setVisible(false);
		setEmail("");
		setPassword("");
		setConfirmPassword("");
		setError("");
		setPasswordMismatch(false);
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<ReauthModal />
			<Modal
				visible={visible}
				onDismiss={() => hideModal()}
				title={
					modalType === "email"
						? "Change Email"
						: modalType === "password"
							? "Change Password"
							: "Delete Account"
				}>
				{modalType === "email" || modalType === "password" ? (
					<Text variant="bodyLarge">Enter your new {modalType === "email" ? "email" : "password"}.</Text>
				) : (
					<Text variant="bodyLarge" style={{ textAlign: "center" }}>
						You are about to delete your account. This action cannot be undone.
					</Text>
				)}
				{modalType !== "delete" && (
					<Input
						value={modalType === "email" ? email : password}
						type={modalType === "email" ? "email" : "password"}
						onChange={(text) => {
							if (modalType === "email") {
								setEmail(text);
							} else {
								setPassword(text);
							}
						}}
						error={error}>
						{modalType === "email" ? "New Email" : "New Password"}
					</Input>
				)}
				{modalType === "password" && (
					<Input
						value={confirmPassword}
						type="password"
						onChange={(text) => {
							setConfirmPassword(text);
							setPasswordMismatch(text !== password);
						}}
						error={passwordMismatch}>
						Confirm Password
					</Input>
				)}
				{error && (
					<Text
						style={{
							color: theme.colors.error,
							fontSize: 14,
							textAlign: "center",
						}}>
						{error}
					</Text>
				)}
				<Button
					mode="contained"
					labelStyle={{
						color: modalType === "delete" ? theme.colors.onError : theme.colors.onPrimary,
					}}
					buttonColor={modalType === "delete" ? theme.colors.error : theme.colors.primary}
					onPress={
						modalType === "email"
							? handleUpdateEmail
							: modalType === "password"
								? handlePasswordUpdate
								: handleDeleteAccount
					}>
					{modalType === "delete" ? "Delete Account" : "Update"}
				</Button>
				{modalType === "delete" && (
					<Button
						buttonColor={theme.colors.secondary}
						labelStyle={{
							color: theme.colors.onSecondary,
						}}
						mode={"contained"}
						onPress={() => hideModal()}>
						Cancel
					</Button>
				)}
			</Modal>
			<ScrollView
				contentContainerStyle={{
					padding: 15,
					gap: 20,
				}}>
				<View
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 15,
					}}>
					<Text variant="headlineSmall">Customization</Text>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
					}}>
					<Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
						Color Scheme
					</Text>
					<ToggleButton.Row
						onValueChange={(value) => {
							if (value) {
								toggleTheme(value);
							}
						}}
						value={themeMode}
						style={{
							width: "60%",
							alignSelf: "center",
							flexDirection: "row",
							borderRadius: 10,
							borderWidth: 0,
							marginTop: 5,
						}}>
						<ToggleButton
							icon={() => (
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										gap: 10,
									}}>
									<Ionicons name="sunny" size={24} />
									<Text>Light</Text>
								</View>
							)}
							label="Light"
							status={themeMode === "light" ? "checked" : "unchecked"}
							value="light"
							style={{ width: "50%" }}
						/>
						<ToggleButton
							icon={() => (
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										gap: 10,
									}}>
									<Ionicons name="moon" size={24} color="black" />
									<Text>Dark</Text>
								</View>
							)}
							label="Dark"
							status={themeMode === "dark" ? "checked" : "unchecked"}
							value="dark"
							style={{ width: "50%" }}
						/>
					</ToggleButton.Row>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						marginTop: 20,
					}}>
					<Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
						Units
					</Text>
					<ToggleButton.Row
						onValueChange={(value) => {
							if (value) {
								handleUnitSystemChange(value);
							}
						}}
						value={unitSystem}
						style={{
							alignSelf: "center",
							width: "80%",
							flexDirection: "row",
							borderRadius: 10,
							borderWidth: 0,
							marginTop: 5,
						}}>
						<ToggleButton
							icon={() => <Text>Imperial</Text>}
							label="Imperial"
							status={unitSystem === "imperial" ? "checked" : "unchecked"}
							value="imperial"
							style={{ width: "33.3%" }}
						/>
						<ToggleButton
							icon={() => <Text>Metric</Text>}
							label="Metric"
							status={unitSystem === "metric" ? "checked" : "unchecked"}
							value="metric"
							style={{ width: "33.3%" }}
						/>
						<ToggleButton
							icon={() => <Text>Custom</Text>}
							label="Custom"
							status={unitSystem === "custom" ? "checked" : "unchecked"}
							value="custom"
							style={{ width: "33.3%" }}
						/>
					</ToggleButton.Row>
				</View>
				{unitSystem === "custom" && (
					<>
						<View
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							<Text variant="bodyLarge">Temperature</Text>
							<ToggleButton.Row
								onValueChange={(value) => {
									if (value) {
										handleTempUnitChange(value);
									}
								}}
								value={tempUnit}
								style={{
									alignSelf: "center",
									width: "60%",
									flexDirection: "row",
									borderRadius: 10,
									borderWidth: 0,
									marginTop: 5,
								}}>
								<ToggleButton
									icon={() => <Icon source="temperature-celsius" size={20} />}
									label="Celsius"
									status={tempUnit === "celsius" ? "checked" : "unchecked"}
									value="celsius"
									style={{ width: "50%" }}
									disabled={unitSystem === "imperial" || unitSystem === "metric"}
								/>
								<ToggleButton
									icon={() => <Icon source="temperature-fahrenheit" size={20} />}
									label="Fahrenheit"
									status={tempUnit === "fahrenheit" ? "checked" : "unchecked"}
									value="fahrenheit"
									style={{ width: "50%" }}
									disabled={unitSystem === "imperial" || unitSystem === "metric"}
								/>
							</ToggleButton.Row>
						</View>
						<View
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							<Text variant="bodyLarge">Wind</Text>
							<ToggleButton.Row
								onValueChange={(value) => {
									if (value) {
										handleWindUnitChange(value);
									}
								}}
								value={windUnit}
								style={{
									alignSelf: "center",
									width: "60%",
									flexDirection: "row",
									borderRadius: 10,
									borderWidth: 0,
									marginTop: 5,
								}}>
								<ToggleButton
									icon={() => <Text style={{ fontWeight: "bold" }}>km/h</Text>}
									label="km/h"
									status={windUnit === "kilometers" ? "checked" : "unchecked"}
									value="kilometers"
									style={{ width: "50%" }}
									disabled={unitSystem === "imperial" || unitSystem === "metric"}
								/>
								<ToggleButton
									icon={() => <Text style={{ fontWeight: "bold" }}>mph</Text>}
									label="mph"
									status={windUnit === "miles" ? "checked" : "unchecked"}
									value="miles"
									style={{ width: "50%" }}
									disabled={unitSystem === "imperial" || unitSystem === "metric"}
								/>
							</ToggleButton.Row>
						</View>
						<View
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							<Text variant="bodyLarge">Precipitation</Text>
							<ToggleButton.Row
								onValueChange={(value) => {
									if (value) {
										handleRainUnitChange(value);
									}
								}}
								value={rainUnit}
								style={{
									alignSelf: "center",
									width: "60%",
									flexDirection: "row",
									borderRadius: 10,
									borderWidth: 0,
									marginTop: 5,
								}}>
								<ToggleButton
									icon={() => <Text style={{ fontWeight: "bold" }}>mm</Text>}
									label="mm"
									status={rainUnit === "millimeters" ? "checked" : "unchecked"}
									value="millimeters"
									style={{ width: "50%" }}
									disabled={unitSystem === "imperial" || unitSystem === "metric"}
								/>
								<ToggleButton
									icon={() => <Text style={{ fontWeight: "bold" }}>in</Text>}
									label="in"
									status={rainUnit === "inches" ? "checked" : "unchecked"}
									value="inches"
									style={{ width: "50%" }}
									disabled={unitSystem === "imperial" || unitSystem === "metric"}
								/>
							</ToggleButton.Row>
						</View>
					</>
				)}
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						marginTop: 20,
					}}>
					<Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
						Email
					</Text>
					<Text variant="bodyMedium">{auth.currentUser?.email}</Text>
					<MaterialIcons
						disabled={!auth.currentUser?.emailVerified}
						name="edit"
						size={20}
						onPress={() => setModalVisible("email")}
						color={
							auth.currentUser?.emailVerified ? theme.colors.onSecondary : theme.colors.onSurfaceDisabled
						}
						style={{
							backgroundColor: auth.currentUser?.emailVerified
								? theme.colors.secondary
								: theme.colors.surfaceDisabled,
							borderRadius: 50,
							padding: 3,
						}}
					/>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-around",
						alignItems: "center",
					}}>
					<Text
						variant="bodyMedium"
						style={{
							fontWeight: "bold",
							color: auth.currentUser?.emailVerified ? theme.colors.primary : theme.colors.error,
						}}>
						{auth.currentUser?.emailVerified ? "Verified" : "Not Verified"}
					</Text>
					<Button
						contentStyle={{
							backgroundColor: theme.colors.secondary,
						}}
						labelStyle={{
							color: theme.colors.onSecondary,
							fontSize: 12,
						}}
						onPress={() => {
							sendEmailVerification(auth.currentUser)
								.then(() => {
									alert("Verification email sent!");
								})
								.catch((error) => {
									alert("Error sending verification email: " + error);
								});
						}}
						compact
						mode={"contained"}>
						Resend Verification
					</Button>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						marginTop: 20,
					}}>
					<Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
						Password
					</Text>
					<Button
						contentStyle={{ backgroundColor: theme.colors.secondary }}
						labelStyle={{ color: theme.colors.onSecondary }}
						onPress={() => setModalVisible("password")}
						mode={"contained"}>
						Change Password
					</Button>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						marginTop: 20,
					}}>
					<Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
						Delete Account
					</Text>
					<Button
						labelStyle={{ color: theme.colors.onError }}
						onPress={() => setModalVisible("delete")}
						mode={"contained"}
						buttonColor={theme.colors.error}>
						Delete Account
					</Button>
				</View>
				<View style={{ width: "40%", alignSelf: "center", marginVertical: 20 }}>
					<Button
						contentStyle={{ padding: 4 }}
						labelStyle={{ fontSize: 16, fontWeight: 600, color: theme.colors.onError }}
						onPress={() => signOutUser()}
						mode={"contained"}
						buttonColor={theme.colors.error}>
						Log Out
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
