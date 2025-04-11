import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useTheme, Text, Button, Portal, Modal, ActivityIndicator } from "react-native-paper";
import Input from "../components/Input";
import { getRound, pickImage, updateRound, removeImage } from "../utils/DataController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import { searchGolfCourses, getCourseDetails, getWeatherData } from "../utils/APIController";
import ImageGallery from "../components/ImageGallery";

export default function EditRoundScreen({ route }) {
	const theme = useTheme();
	const navigation = useNavigation();

	const [id, setId] = useState(route.params.roundData.id);
	const [course, setCourse] = useState(route.params.roundData.course);
	const [lon, setLon] = useState(route.params.roundData.lon);
	const [lat, setLat] = useState(route.params.roundData.lat);
	const [date, setDate] = useState(new Date(route.params.roundData.date.toDate()));
	const [score, setScore] = useState(route.params.roundData.score);
	const [temp, setTemp] = useState(route.params.roundData.temp);
	const [rain, setRain] = useState(route.params.roundData.rain);
	const [wind, setWind] = useState(route.params.roundData.wind);
	const [weatherCode, setWeatherCode] = useState(route.params.roundData.weatherCode);
	const [notes, setNotes] = useState(route.params.roundData.notes);
	const [images, setImages] = useState(route.params.roundData.images || []);
	const [tees, setTees] = useState(route.params.roundData.tees);
	const [loading, setLoading] = useState(false);
	const [courseResults, setCourseResults] = useState([]);
	const [showCourseOptions, setShowCourseOptions] = useState(false);
	const [courseData, setCourseData] = useState(null);

	const courseRef = useRef(null);
	const dateRef = useRef(null);
	const scoreRef = useRef(null);
	const notesRef = useRef(null);
	const teesRef = useRef(null);

	useEffect(() => {
		getRound(route.params.roundData.id).then((round) => {
			setId(round.id);
			setCourse(round.course);
			setDate(new Date(round.date.toDate()));
			setScore(round.score);
			setTemp(round.temp);
			setRain(round.rain);
			setWind(round.wind);
			setWeatherCode(round.weatherCode);
			setLon(round.lon);
			setLat(round.lat);
			setNotes(round.notes);
			setImages(round.images || []);
			setTees(round.tees);
		});
	}, [route.params.roundData.id]);

	const handleAddImages = async () => {
		try {
			const result = await pickImage();
			if (result && result.length > 0) {
				setImages([...images, ...result]);
			}
		} catch (error) {
			console.error("Error adding images:", error);
		}
	};

	const handleRemoveImage = async (imageUri, index) => {
		try {
			// If it's a Firebase URL (starts with https), remove it from storage
			if (imageUri.startsWith("https://")) {
				await removeImage(imageUri, id);
			}

			// Remove from local state
			setImages(images.filter((_, i) => i !== index));
		} catch (error) {
			console.error("Error removing image:", error);
		}
	};

	const handleCourseChange = (text) => {
		setCourse(text);
		if (text.length >= 3) {
			searchGolfCourses(text, setCourseResults, setShowCourseOptions);
		} else {
			setCourseResults([]);
			setShowCourseOptions(false);
		}
	};

	const selectCourse = async (courseData) => {
		setCourse(courseData.text.text.split(",")[0]);
		setShowCourseOptions(false);
		setCourseData(courseData);

		if (dateRef.current) {
			dateRef.current.focus();
		}
	};

	const validateFields = () => {
		if (!course) {
			alert("Please enter a course name");
			courseRef.current.focus();
			return false;
		}
		if (!date) {
			alert("Please select a date");
			dateRef.current.focus();
			return false;
		}
		if (!score) {
			alert("Please enter your score");
			scoreRef.current.focus();
			return false;
		}
		if (!tees) {
			alert("Please specify which tees you played from");
			teesRef.current.focus();
			return false;
		}
		return true;
	};

	const updateDBRound = async () => {
		try {
			if (!validateFields()) return;
			setLoading(true);

			let latToUse = lat;
			let lonToUse = lon;
			let tempToUse = temp;
			let rainToUse = rain;
			let windToUse = wind;
			let weatherCodeToUse = weatherCode;

			// Only fetch course details and weather if the course selection has changed
			if (courseData) {
				const details = await getCourseDetails(courseData.placeId);
				if (!details) {
					alert("Could not fetch course details. Please try again.");
					setLoading(false);
					return;
				}

				// Format date as YYYY-MM-DD for weather API
				const formattedDate = date.toISOString().split("T")[0];

				// Save the lat/lon values from detailed course info
				latToUse = details.latitude;
				lonToUse = details.longitude;

				// Get weather data for the selected course and date
				const weather = await getWeatherData(details.latitude, details.longitude, formattedDate);
				if (!weather) {
					alert("Could not fetch weather data. Please try again.");
					setLoading(false);
					return;
				}

				// Set state for display purposes
				tempToUse = weather.temperature;
				rainToUse = weather.rain;
				windToUse = weather.wind;
				weatherCodeToUse = weather.weatherCode;

				// Update state values
				setLat(latToUse);
				setLon(lonToUse);
				setTemp(tempToUse);
				setRain(rainToUse);
				setWind(windToUse);
				setWeatherCode(weatherCodeToUse);
			}

			// Update the round with all data including modified images
			await updateRound(
				id,
				course,
				date,
				score,
				tempToUse,
				rainToUse,
				windToUse,
				weatherCodeToUse,
				notes,
				images,
				tees,
				latToUse,
				lonToUse,
			);

			setLoading(false);
			navigation.navigate("Home");
		} catch (error) {
			console.error("Error updating round:", error);
			alert("Error updating round: " + error.message);
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
					<Text variant="headlineSmall">Updating your round ...</Text>
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
					<Text variant="headlineSmall">Edit Round</Text>
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

				<View style={{ width: "80%", marginVertical: 15 }}>
					<Text variant="bodyLarge" style={{ marginBottom: 10 }}>
						Photos
					</Text>
					<ImageGallery
						images={images}
						onAddImages={handleAddImages}
						onRemoveImage={handleRemoveImage}
						isEditable={true}
					/>
				</View>

				<Button mode="contained" style={{ marginTop: 15 }} onPress={updateDBRound}>
					Update Round
				</Button>
			</View>
		</KeyboardAwareScrollView>
	);
}
