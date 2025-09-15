import React, { useState, useRef, useEffect } from "react";
import { Pressable, View } from "react-native";
import { useTheme, Button, Avatar, Icon, IconButton } from "react-native-paper";
import Input from "../components/Input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getUser, pickImage, setProfileInfo } from "../utils/DataController";
import { searchGolfCourses, getCourseDetails } from "../utils/APIController";

export default function EditAccountScreen() {
	const theme = useTheme();
	const [firstName, setFirstName] = useState();
	const [lastName, setLastName] = useState();
	const [homeCourse, setHomeCourse] = useState();
	const [bio, setBio] = useState();
	const [profilePicture, setProfilePicture] = useState();
	const [courseResults, setCourseResults] = useState([]);
	const [showCourseOptions, setShowCourseOptions] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saved, setSaved] = useState(false);
	const [city, setCity] = useState();
	const [province, setProvince] = useState();
	const [country, setCountry] = useState();

	const firstNameRef = useRef(null);
	const lastNameRef = useRef(null);
	const homeCourseRef = useRef(null);
	const bioRef = useRef(null);

	useEffect(() => {
		getUser().then((user) => {
			setFirstName(user.firstName);
			setLastName(user.lastName);
			setHomeCourse(user.homeCourse);
			setBio(user.bio);
			setProfilePicture(user.profilePicture);
			setCity(user.city);
			setProvince(user.province);
			setCountry(user.country);
		});
	}, []);

	const handleFirstNameChange = (text) => {
		setFirstName(text);
		setSaved(false);
	};

	const handleLastNameChange = (text) => {
		setLastName(text);
		setSaved(false);
	};

	const handleBioChange = (text) => {
		setBio(text);
		setSaved(false);
	};

	const handleCourseChange = (text) => {
		setHomeCourse(text);
		setSaved(false);
		searchGolfCourses(text, setCourseResults, setShowCourseOptions);
	};

	const selectCourse = async (courseData) => {
		setHomeCourse(courseData.text.text.split(",")[0]);
		await getCourseDetails(courseData.placeId).then((courseDetails) => {
			setCity(courseDetails.city);
			setProvince(courseDetails.province);
			setCountry(courseDetails.country);
		});
		setSaved(false);
		setShowCourseOptions(false);
	};

	const setPicture = async () => {
		try {
			const url = await pickImage(true);
			setProfilePicture(url);
			setSaved(false);
		} catch (error) {
			console.error("Error setting profile picture:", error);
		}
	};

	return (
		<KeyboardAwareScrollView
			extraScrollHeight={100}
			contentContainerStyle={{
				justifyContent: "center",
				alignItems: "center",
				alignContent: "space-around",
				flexGrow: 1,
				backgroundColor: theme.colors.surface,
			}}>
			<View
				style={{
					width: "100%",
					alignContent: "center",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<Pressable style={{ marginBottom: 10, width: 125, height: 100 }} onPress={setPicture}>
					{profilePicture ? (
						<Avatar.Image size={100} source={{ uri: profilePicture }} />
					) : (
						<Avatar.Image
							size={100}
							style={{
								marginHorizontal: 10,
								justifyContent: "center",
								alignContent: "center",
								alignItems: "center",
							}}
							source={() => <Icon source="account" color={theme.colors.onPrimary} size={80} />}
						/>
					)}
					<IconButton
						icon="camera"
						iconColor={theme.colors.inverseSurface}
						size={20}
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							backgroundColor: theme.colors.inversePrimary,
							borderRadius: 100,
						}}
					/>
				</Pressable>
				<Input
					onChange={handleFirstNameChange}
					value={firstName}
					autofill="given-name"
					inputRef={firstNameRef}
					nextRef={lastNameRef}>
					First Name
				</Input>
				<Input
					onChange={handleLastNameChange}
					value={lastName}
					autofill="family-name"
					inputRef={lastNameRef}
					nextRef={homeCourseRef}>
					Last Name
				</Input>
				<Input
					onChange={handleCourseChange}
					type="search"
					value={homeCourse}
					inputRef={homeCourseRef}
					nextRef={bioRef}
					searchType="course"
					searchResults={courseResults}
					showSearchResults={showCourseOptions}
					onSearchResultSelect={selectCourse}>
					Home Course
				</Input>
				<Input onChange={handleBioChange} value={bio} autofill="organization-title" inputRef={bioRef}>
					Bio
				</Input>
				<Button
					mode="contained"
					icon={saved ? "content-save" : "content-save-outline"}
					style={{ marginTop: 20 }}
					onPress={async () => {
						setLoading(true);
						await setProfileInfo(firstName, lastName, homeCourse, bio, city, province, country);
						setLoading(false);
						setSaved(true);
					}}
					loading={loading}>
					Save Changes
				</Button>
			</View>
		</KeyboardAwareScrollView>
	);
}
