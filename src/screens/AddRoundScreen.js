import * as React from "react";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Input from "../components/Input";
import { Text, Button, useTheme, IconButton, Portal, Modal, ActivityIndicator } from "react-native-paper";
import { pickImage, addRound, updateRound, uploadImages } from "../utils/DataController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import img from "../../assets/img.jpg";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import { getCourseDetails, getWeatherData, searchGolfCourses } from "../utils/APIController";

export default function AddRoundScreen({ navigation }) {
	const theme = useTheme();

	const [course, setCourse] = useState("");
	const [date, setDate] = useState(new Date());
	const [score, setScore] = useState(0);
	const [temp, setTemp] = useState(0);
	const [rain, setRain] = useState(0);
	const [wind, setWind] = useState(0);
	const [weatherCode, setWeatherCode] = useState(0);
	const [notes, setNotes] = useState("");
	const [images, setImages] = useState([]);
	const [tees, setTees] = useState("");
	const [lat, setLat] = useState(0);
	const [lon, setLon] = useState(0);
	const [loading, setLoading] = useState(false);
	const [showCourseOptions, setShowCourseOptions] = useState(false);
	const [courseData, setCourseData] = useState(null);
	const [courseResults, setCourseResults] = useState([]);

	const courseRef = useRef(null);
	const dateRef = useRef(null);
	const scoreRef = useRef(null);
	const notesRef = useRef(null);
	const teesRef = useRef(null);

	const setPictures = async () => {
		try {
			const result = await pickImage();
			console.log("Image picker result:", result);
			if (result && result.length > 0) {
				setImages(result);
			} else {
				console.log("No images selected or picker was cancelled");
			}
		} catch (error) {
			console.error("Error setting round pictures:", error);
		}
	};

	const handleCourseChange = (text) => {
		setCourse(text);
		console.log("Course search query:", text);
		if (text.length >= 3) {
			searchGolfCourses(text, setCourseResults, setShowCourseOptions);
		} else {
			setCourseResults([]);
			setShowCourseOptions(false);
		}
	};

	const selectCourse = async (courseData) => {
		console.log("Selected course data:", courseData);
		setCourse(courseData.text.text.split(",")[0]);
		setShowCourseOptions(false);
		// Store course data for later use when saving
		setCourseData(courseData);

		if (dateRef.current) {
			dateRef.current.focus();
		}
	};

	const addDBRound = async () => {
		try {
			// Check for required fields and show error messages if missing as well as focus on the missing field
			if (!course) {
				alert("Please enter a course name");
				courseRef.current.focus();
				return;
			}
			if (!date) {
				alert("Please select a date");
				dateRef.current.focus();
				return;
			}
			if (!score) {
				alert("Please enter your score");
				scoreRef.current.focus();
				return;
			}
			if (!tees) {
				alert("Please specify which tees you played from");
				teesRef.current.focus();
				return;
			}
			setLoading(true);

			// Get course details from Google Places API
			if (!courseData || !courseData.placeId) {
				console.error("Missing course data or place ID");
				alert("Error: Could not get course details. Please try selecting a course again.");
				setLoading(false);
				return;
			}

			console.log("Getting course details for placeId:", courseData.placeId);
			const details = await getCourseDetails(courseData.placeId);
			console.log("Course details result:", details);

			if (details) {
				// Format date as YYYY-MM-DD for weather API
				const formattedDate = date.toISOString().split("T")[0];

				// Save the lat/lon values from detailed course info
				setLat(details.latitude);
				setLon(details.longitude);

				// Get weather data for the selected course and date
				console.log("Getting weather data for location:", details.latitude, details.longitude, formattedDate);
				const weather = await getWeatherData(details.latitude, details.longitude, formattedDate);
				console.log("Weather data result:", weather);

				// Set state for display purposes
				setTemp(weather.temperature);
				setRain(weather.rain);
				setWind(weather.wind);
				setWeatherCode(weather.weatherCode);

				// Use direct values from details object rather than state which might not be updated yet
				const latToUse = details.latitude;
				const lonToUse = details.longitude;

				console.log("Adding round with data:", {
					course,
					date,
					score,
					temp: weather.temperature,
					rain: weather.rain,
					wind: weather.wind,
					weatherCode: weather.weatherCode,
					notes,
					images: null,
					tees,
					lat: latToUse,
					lon: lonToUse,
				});

				const roundId = await addRound(
					course,
					date,
					score,
					weather.temperature,
					weather.rain,
					weather.wind,
					weather.weatherCode,
					notes,
					null, // Pass null initially for images
					tees,
					latToUse,
					lonToUse,
				);

				if (images && images.length > 0) {
					console.log("Uploading images:", images);
					const urls = await uploadImages(images, "rounds", roundId);
					console.log("Uploaded image URLs:", urls);

					if (urls && urls.length > 0) {
						await updateRound(
							roundId,
							course,
							date,
							score,
							weather.temperature,
							weather.rain,
							weather.wind,
							weather.weatherCode,
							notes,
							urls, // Pass the array of URLs here
							tees,
							latToUse,
							lonToUse,
						);
					}
				}
				setLoading(false);
				navigation.navigate("Home");
			} else {
				// Fallback if no details available
				console.log("No course details available. Using fallback values.");
				alert("Could not fetch course details. Using default values.");

				const roundId = await addRound(
					course,
					date,
					score,
					temp,
					rain,
					wind,
					weatherCode,
					notes,
					null, // Pass null initially for images
					tees,
					lat,
					lon,
				);

				if (images && images.length > 0) {
					console.log("Uploading images with fallback:", images);
					const urls = await uploadImages(images, "rounds", roundId);
					console.log("Uploaded image URLs with fallback:", urls);

					if (urls && urls.length > 0) {
						await updateRound(
							roundId,
							course,
							date,
							score,
							temp,
							rain,
							wind,
							weatherCode,
							notes,
							urls, // Pass the array of URLs here
							tees,
							lat,
							lon,
						);
					}
				}
				setLoading(false);
				navigation.navigate("Home");
			}
		} catch (error) {
			console.error("Error adding round:", error);
			alert("Error adding round: " + error.message);
			setLoading(false);
		}
	};

	return (
		<KeyboardAwareScrollView
			style={{ backgroundColor: theme.colors.surface }}
			contentContainerStyle={{
				justifyContent: "center",
				alignItems: "center",
				alignContent: "space-around",
				flexGrow: 1,
				backgroundColor: theme.colors.surface,
			}}>
			<Portal>
				<Modal
					visible={loading}
					dismissable={false}
					dismissableBackButton={false}
					contentContainerStyle={{
						backgroundColor: theme.colors.surfaceVariant,
						paddingHorizontal: 30,
						paddingBottom: 45,
						paddingTop: 38,
						borderRadius: 10,
						margin: 20,
						width: "85%",
						alignSelf: "center",
						gap: 75,
						justifyContent: "center",
						alignItems: "center",
					}}>
					<Text variant="headlineSmall">Adding your round ...</Text>
					<ActivityIndicator size={100} color={theme.colors.primary} />
					<Text variant="titleSmall">This won't take long...</Text>
				</Modal>
			</Portal>
			<View
				style={{
					width: "100%",
					alignContent: "center",
					alignItems: "center",
					justifyContent: "center",
					margin: 15,
				}}>
				<View
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 15,
					}}>
					<Text variant="headlineSmall">Add Round</Text>
				</View>
				<Input
					onChange={handleCourseChange}
					type="search"
					value={course}
					inputRef={courseRef}
					nextRef={dateRef}
					searchType="course"
					searchResults={courseResults}
					showSearchResults={showCourseOptions}
					onSearchResultSelect={selectCourse}>
					Course
				</Input>
				<Input
					onChange={(event, selectedDate) => setDate(selectedDate)}
					type="date"
					value={date}
					inputRef={dateRef}
					nextRef={scoreRef}>
					Date
				</Input>
				<Input onChange={setScore} type="number" value={score} inputRef={scoreRef} nextRef={notesRef}>
					Score
				</Input>
				<Input onChange={setNotes} value={notes} inputRef={notesRef} nextRef={teesRef}>
					Notes
				</Input>
				<Input onChange={setTees} value={tees} inputRef={teesRef}>
					Tees
				</Input>
				<View
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						width: "80%",
						height: "auto",
						marginVertical: 10,
					}}>
					<Carousel
						width={320}
						height={200}
						style={{
							backgroundColor: theme.colors.surfaceVariant,
							borderRadius: 15,
						}}
						loop={false}
						snapEnabled={true}
						pagingEnabled={true}
						scrollAnimationDuration={250}
						data={images.length > 0 ? images : ["placeholder"]}
						renderItem={({ item }) => (
							<Pressable onPress={setPictures}>
								{item === "placeholder" ? (
									<View
										style={{
											height: "100%",
											justifyContent: "center",
											alignItems: "center",
										}}>
										<Text>Tap to add photos</Text>
									</View>
								) : (
									<Image
										placeholder={img}
										style={{ height: "100%" }}
										source={item}
										contentFit="contain"
									/>
								)}
							</Pressable>
						)}
					/>
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
				</View>
				<Button mode="contained" style={{ marginTop: 15 }} onPress={addDBRound}>
					Add Round
				</Button>
			</View>
		</KeyboardAwareScrollView>
	);
}
