import * as React from "react";
import { useRef, useState } from "react";
import { View } from "react-native";
import Input from "../components/Input";
import { Text, Button, useTheme, Portal, Modal, ActivityIndicator, ToggleButton } from "react-native-paper";
import { pickImage, addRound } from "../utils/DataController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getCourseDetails, getWeatherData, searchGolfCourses } from "../utils/APIController";
import ImageGallery from "../components/ImageGallery";

export default function AddRoundScreen({ navigation }) {
	const theme = useTheme();

	const [course, setCourse] = useState("");
	const [date, setDate] = useState(new Date());
	const [score, setScore] = useState(0);
	const [notes, setNotes] = useState("");
	const [images, setImages] = useState([]);
	const [tees, setTees] = useState("");
	const [holes, setHoles] = useState("18 holes");
	const [loading, setLoading] = useState(false);
	const [showCourseOptions, setShowCourseOptions] = useState(false);
	const [courseData, setCourseData] = useState(null);
	const [courseResults, setCourseResults] = useState([]);

	const courseRef = useRef(null);
	const dateRef = useRef(null);
	const scoreRef = useRef(null);
	const notesRef = useRef(null);
	const teesRef = useRef(null);

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

	const handleRemoveImage = (index) => {
		setImages(images.filter((_, i) => i !== index));
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
		if (!holes || !["18 holes", "Front 9", "Back 9"].includes(holes)) {
			alert("Please select a valid hole option");
			return false;
		}
		return true;
	};

	const addDBRound = async () => {
		try {
			if (!validateFields()) return;
			setLoading(true);

			// Get course details from Google Places API
			if (!courseData || !courseData.placeId) {
				alert("Error: Could not get course details. Please try selecting a course again.");
				setLoading(false);
				return;
			}

			const details = await getCourseDetails(courseData.placeId);
			if (!details) {
				alert("Could not fetch course details. Please try again.");
				setLoading(false);
				return;
			}

			// Format date as YYYY-MM-DD for weather API
			const formattedDate = date.toISOString().split("T")[0];
			const latToUse = details.latitude;
			const lonToUse = details.longitude;

			// Get weather data
			const weather = await getWeatherData(latToUse, lonToUse, formattedDate);
			if (!weather) {
				alert("Could not fetch weather data. Please try again.");
				setLoading(false);
				return;
			}

			// Add round with all data including images
			await addRound(
				course,
				date,
				score,
				weather.temperature,
				weather.rain,
				weather.wind,
				weather.weatherCode,
				notes,
				images,
				tees,
				latToUse,
				lonToUse,
				holes,
			);

			setLoading(false);
			navigation.navigate("Home");
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
				<View style={{ alignSelf: "center", width: "85%", padding: 8 }}>
					<ToggleButton.Row onValueChange={(value) => setHoles(value)} value={holes}>
						<ToggleButton
							icon={() => <Text>18 holes</Text>}
							value="18 holes"
							style={{ width: "33.3%", borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }}
						/>
						<ToggleButton icon={() => <Text>Front 9</Text>} value="Front 9" style={{ width: "33.3%" }} />
						<ToggleButton
							icon={() => <Text>Back 9</Text>}
							value="Back 9"
							style={{ width: "33.3%", borderBottomRightRadius: 10, borderTopRightRadius: 10 }}
						/>
					</ToggleButton.Row>
				</View>
				<Input onChange={setTees} value={tees} inputRef={teesRef}>
					Tees
				</Input>
				<Input onChange={setNotes} value={notes} inputRef={notesRef} nextRef={teesRef}>
					Notes
				</Input>

				<View style={{ width: "80%", marginVertical: 15 }}>
					<ImageGallery
						images={images}
						onAddImages={handleAddImages}
						onRemoveImage={handleRemoveImage}
						isEditable={true}
					/>
				</View>

				<Button mode="contained" style={{ marginBottom: 15 }} onPress={addDBRound}>
					Add Round
				</Button>
			</View>
		</KeyboardAwareScrollView>
	);
}
