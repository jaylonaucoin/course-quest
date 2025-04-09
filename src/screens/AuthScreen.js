import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { View } from "react-native";
import React, { useRef, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import Input from "../components/Input";
import Modal from "../components/Modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SegmentedButtons, Button, HelperText, useTheme, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "../utils/DataController";
import { searchGolfCourses } from "../utils/APIController";

export default function AuthScreen({ navigation }) {
	const theme = useTheme();

	const [activeView, setActiveView] = useState("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [registerFirstName, setRegisterFirstName] = useState("");
	const [registerLastName, setRegisterLastName] = useState("");
	const [homeCourse, setHomeCourse] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordMismatch, setPasswordMismatch] = useState(false);
	const [error, setError] = useState("");
	const [resetPassword, setResetPassword] = useState(false);
	const [resetPasswordEmail, setResetPasswordEmail] = useState("");
	const [courseResults, setCourseResults] = useState([]);
	const [showCourseOptions, setShowCourseOptions] = useState(false);

	const firstNameRef = useRef(null);
	const lastNameRef = useRef(null);
	const emailRef = useRef(null);
	const passwordRef = useRef(null);
	const confirmPasswordRef = useRef(null);
	const homeCourseRef = useRef(null);

	const handleCourseChange = (text) => {
		setHomeCourse(text);
		searchGolfCourses(text, setCourseResults, setShowCourseOptions);
	};

	const selectCourse = (courseData) => {
		setHomeCourse(courseData.text.text.split(",")[0]);
		setShowCourseOptions(false);
	};

	const checkPassword = (newConfirmPassword) => {
		setConfirmPassword(newConfirmPassword);
		if (newConfirmPassword === "" || password === "") {
			setPasswordMismatch(false);
		} else {
			setPasswordMismatch(password !== newConfirmPassword);
		}
	};

	const sendResetPassword = async () => {
		try {
			await sendPasswordResetEmail(auth, resetPasswordEmail);
			alert("Password reset email sent!");
			setResetPassword(false);
		} catch (error) {
			setError("Error sending password reset email: " + error.message);
		}
	};

	const signUpUser = async () => {
		if (password !== confirmPassword) {
			confirmPasswordRef.current.focus();
			return;
		}
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			await sendEmailVerification(userCredential.user);
			await setUser(userCredential.user.uid, email, registerFirstName, registerLastName, homeCourse);
			await login(email, password, navigation);
		} catch (error) {
			if (error.code === "auth/email-already-in-use") {
				setError("Email already in use! Please try another.");
			} else if (error.code === "auth/invalid-email") {
				setError("Invalid email address! Please try again.");
			} else if (error.code === "auth/weak-password") {
				setError("Weak password! Please try again.");
			} else if (error.code === "auth/password-does-not-meet-requirements") {
				const regex = /\[(.*?)]/;
				const matches = error.message.match(regex);
				const criteriaString = matches ? matches[1] : "";

				// Split the criteria into an array
				const criteriaArray = criteriaString.split(", ");

				// Join the criteria with newline characters
				const formattedCriteria = criteriaArray.join("\n");
				setError(formattedCriteria);
			} else {
				setError(error + "Error signing up! Please try again.");
			}
		}
	};

	const login = async () => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			const userDoc = await getDoc(doc(db, "users", user.uid));
			const userData = userDoc.data();

			// Store user data in AsyncStorage
			await AsyncStorage.setItem(
				"user",
				JSON.stringify({
					uid: user.uid,
					email: user.email,
					firstName: userData.firstName,
					lastName: userData.lastName,
					profilePicture: userData.profilePicture,
					bio: userData.bio,
					homeCourse: userData.homeCourse,
					rounds: userData.rounds,
				}),
			);

			navigation.replace("Main");
		} catch (error) {
			if (error.code === "auth/user-not-found") {
				setError("Account does not exist! Please register.");
			} else if (error.code === "auth/invalid-credential") {
				setError("Incorrect password! Please try again.");
			} else {
				setError("Error signing in! Please try again.");
			}
		}
	};

	return (
		<KeyboardAwareScrollView
			contentContainerStyle={{ flexGrow: 1, backgroundColor: theme.colors.surface }}
			enableAutomaticScroll={true}
			extraScrollHeight={25}
			enableOnAndroid={true}
			keyboardShouldPersistTaps="handled">
			<Modal visible={resetPassword} onDismiss={() => setResetPassword(false)} title="Reset Password">
				<Input
					type="email"
					onChange={setResetPasswordEmail}
					value={resetPasswordEmail}
					autofill="email">
					Email
				</Input>
				<View
					style={{
						justifyContent: "space-between",
						gap: 20,
						width: "100%",
					}}>
					<Button
						contentStyle={{ padding: 4 }}
						labelStyle={{ fontSize: 16, fontWeight: 600 }}
						onPress={sendResetPassword}
						mode={"contained"}>
						Reset Password
					</Button>
					<Button
						buttonColor={theme.colors.secondary}
						contentStyle={{ padding: 4 }}
						labelStyle={{
							fontSize: 16,
							fontWeight: 600,
							color: theme.colors.onSecondary,
						}}
						onPress={() => setResetPassword(false)}
						mode={"contained"}>
						Cancel
					</Button>
				</View>
			</Modal>
			<View className="items-center justify-center flex-1 p-4">
				<Text variant="displaySmall" style={{ fontWeight: "bold" }}>
					{activeView === "login" ? "Sign In" : "Register"}
				</Text>
				<View className="flex-row justify-center m-6 align-middle max-w-96">
					<SegmentedButtons
						style={{ flex: 1, alignItems: "center" }}
						theme={{ colors: { secondaryContainer: theme.colors.primary } }}
						value={activeView}
						onValueChange={setActiveView}
						buttons={[
							{
								value: "login",
								label: "Login",
								onPress: () => setActiveView("login"),
								checkedColor: theme.colors.onPrimary,
								uncheckedColor: theme.colors.primary,
								style: { borderColor: theme.colors.primary },
							},
							{
								value: "register",
								label: "Register",
								onPress: () => setActiveView("register"),
								checkedColor: theme.colors.onPrimary,
								uncheckedColor: theme.colors.primary,
								style: { borderColor: theme.colors.primary },
							},
						]}
					/>
				</View>
				{error !== "" && (
					<HelperText
						style={{
							alignSelf: "center",
							fontWeight: "bold",
							color: "darkred",
						}}
						type={"error"}>
						{error}
					</HelperText>
				)}
				{activeView === "login" ? (
					<View className="w-full">
						<Input
							type="email"
							onChange={setEmail}
							value={email}
							autofill="email"
							inputRef={emailRef}
							nextRef={passwordRef}>
							Email
						</Input>
						<Input
							type="password"
							onChange={setPassword}
							value={password}
							autofill="password"
							inputRef={passwordRef}
							submitForm={() => login(email, password, navigation)}>
							Password
						</Input>
						<Button
							mode="text"
							rippleColor={theme.colors.elevation.level0}
							labelStyle={{ textDecorationLine: "underline" }}
							onPress={() => setResetPassword(true)}>
							Forgot your password?
						</Button>
					</View>
				) : (
					<View className="w-full">
						<Input
							onChange={setRegisterFirstName}
							value={registerFirstName}
							autofill="given-name"
							inputRef={firstNameRef}
							nextRef={lastNameRef}>
							First Name
						</Input>
						<Input
							onChange={setRegisterLastName}
							value={registerLastName}
							autofill="family-name"
							inputRef={lastNameRef}
							nextRef={emailRef}>
							Last Name
						</Input>
						<Input
							type="email"
							onChange={setEmail}
							value={email}
							autofill="email"
							inputRef={emailRef}
							nextRef={passwordRef}>
							Email
						</Input>
						<Input
							type="password"
							onChange={setPassword}
							value={password}
							autofill="new-password"
							inputRef={passwordRef}
							nextRef={confirmPasswordRef}>
							Password
						</Input>
						<Input
							type="password"
							onChange={(text) => checkPassword(text)}
							value={confirmPassword}
							autofill="new-password"
							inputRef={confirmPasswordRef}
							nextRef={homeCourseRef}>
							Confirm Password
						</Input>
						{passwordMismatch && (
							<HelperText
								style={{
									marginLeft: 20,
									fontWeight: "bold",
									color: "darkred",
								}}
								type={"error"}>
								Passwords do not match!
							</HelperText>
						)}
						<Input
							onChange={handleCourseChange}
							type="search"
							value={homeCourse}
							inputRef={homeCourseRef}
							searchType="course"
							searchResults={courseResults}
							showSearchResults={showCourseOptions}
							onSearchResultSelect={selectCourse}>
							Home Course
						</Input>
					</View>
				)}
				<View style={{ width: "40%", alignSelf: "center", marginTop: 12 }}>
					<Button
						contentStyle={{ padding: 4 }}
						labelStyle={{ fontSize: 16, fontWeight: 600 }}
						onPress={activeView === "login" ? () => login() : () => signUpUser()}
						mode={"contained"}>
						{activeView === "login" ? "Sign In" : "Register"}
					</Button>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}
