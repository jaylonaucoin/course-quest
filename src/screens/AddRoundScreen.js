import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Input from "../components/Input";
import {
	Text,
	Button,
	useTheme,
	IconButton,
	Portal,
	Modal,
	ActivityIndicator,
	List,
} from "react-native-paper";
import { pickImage, addRound, updateRound, uploadImages } from "../utils/DataController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import img from "../../assets/img.jpg";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";

// Use direct string instead of @env since module resolver might not be configured
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default function AddRoundScreen({ navigation }) {
	const theme = useTheme();

	const [course, setCourse] = useState("");
	const [date, setDate] = useState(new Date());
	const [score, setScore] = useState(0);
	const [temp, setTemp] = useState(0);
	const [rain, setRain] = useState(0);
	const [wind, setWind] = useState(0);
	const [notes, setNotes] = useState(null);
	const [images, setImages] = useState([img]);
	const [tees, setTees] = useState(null);
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

	// Function to get course details from Google Places API
	const getCourseDetails = async (placeId) => {
		try {
			const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
					"X-Goog-FieldMask": "displayName,location",
				},
			});
			const data = await response.json();
			console.log(data);
			console.log(data.location);
			console.log(data.location.latitude);
			console.log(data.location.longitude);
			console.log(data.displayName.text);
			setLat(data.location.latitude);
			setLon(data.location.longitude);
			return {
				latitude: data.location.latitude,
				longitude: data.location.longitude,
				name: data.displayName.text,
			};
		} catch (error) {
			console.error("Error fetching course details:", error);
			return null;
		}
	};

	// Function to get weather data from OpenMeteo API's archive endpoint
	const getWeatherData = async (latitude, longitude, date) => {
		try {
			const response = await fetch(
				`https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,rain_sum,wind_speed_10m_max&timezone=auto`,
			);
			const data = await response.json();
			console.log(data);
			return {
				temperature: data.daily.temperature_2m_max[0],
				rain: data.daily.rain_sum[0],
				wind: data.daily.wind_speed_10m_max[0],
			};
		} catch (error) {
			console.error("Error fetching weather data:", error);
			return { temperature: 0, rain: 0, wind: 0 };
		}
	};

	const setPictures = async () => {
		try {
			const urls = await pickImage();
			setImages(urls);
		} catch (error) {
			console.error("Error setting round pictures:", error);
		}
	};

	const searchGolfCourses = async (query) => {
		if (query.length < 3) {
			setCourseResults([]);
			setShowCourseOptions(false);
			return;
		}

		try {
			await fetch("https://places.googleapis.com/v1/places:autocomplete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
				},
				body: JSON.stringify({
					input: query,
					includedPrimaryTypes: ["golf_course"],
				}),
			})
				.then((response) => response.json())
				.then((data) => {
					setCourseResults(data.suggestions.map((suggestion) => suggestion.placePrediction));
					setShowCourseOptions(true);
				})
				.catch((error) => console.error("Error:", error));
		} catch (error) {
			console.error("Error searching for golf courses:", error);
		}
	};

	const handleCourseChange = (text) => {
		setCourse(text);
		searchGolfCourses(text);
	};

	const selectCourse = async (courseData) => {
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
				courseRef.current.focus();
				return;
			}
			if (!date) {
				dateRef.current.focus();
				return;
			}
			if (!score) {
				scoreRef.current.focus();
				return;
			}
			if (!tees) {
				teesRef.current.focus();
				return;
			}
			setLoading(true);

			// Get course details from Google Places API
			const details = await getCourseDetails(courseData.placeId);

			if (details) {
				// Format date as YYYY-MM-DD for weather API
				const formattedDate = date.toISOString().split("T")[0];

				// Save the lat/lon values from detailed course info
				setLat(details.latitude);
				setLon(details.longitude);

				// Get weather data for the selected course and date
				const weather = await getWeatherData(details.latitude, details.longitude, formattedDate);

				// Set state for display purposes
				setTemp(weather.temperature);
				setRain(weather.rain);
				setWind(weather.wind);

				console.log("Saving data with:");
				console.log("Lat:", details.latitude);
				console.log("Lon:", details.longitude);
				console.log("Temp:", weather.temperature);
				console.log("Rain:", weather.rain);
				console.log("Wind:", weather.wind);

				// Use direct values from details object rather than state which might not be updated yet
				const latToUse = details.latitude;
				const lonToUse = details.longitude;

				const roundId = await addRound(
					course,
					date,
					score,
					weather.temperature,
					weather.rain,
					weather.wind,
					notes,
					null,
					tees,
					latToUse,
					lonToUse,
				);

				if (images && images.length > 0) {
					const urls = await uploadImages(images, "rounds", roundId);
					await updateRound(
						roundId,
						course,
						date,
						score,
						weather.temperature,
						weather.rain,
						weather.wind,
						notes,
						urls,
						tees,
						latToUse,
						lonToUse,
					);
				}

				console.log("Round added");
				console.log(roundId);
				console.log(course);
				console.log(date);
				console.log(score);
				console.log(weather.temperature);
				console.log(weather.rain);
				console.log(weather.wind);
				console.log(notes);
				console.log(latToUse);
				console.log(lonToUse);

				setLoading(false);
				navigation.navigate("Home");
			} else {
				// Fallback if no details available
				console.log("Saving data with default values - no course details available");

				const roundId = await addRound(
					course,
					date,
					score,
					temp,
					rain,
					wind,
					notes,
					null,
					tees,
					lat,
					lon,
				);

				if (images && images.length > 0) {
					const urls = await uploadImages(images, "rounds", roundId);
					await updateRound(
						roundId,
						course,
						date,
						score,
						temp,
						rain,
						wind,
						notes,
						urls,
						tees,
						lat,
						lon,
					);
				}

				console.log("Round added with default values");
				console.log(roundId);
				console.log(course);
				console.log(date);
				console.log(score);
				console.log(temp);
				console.log(rain);
				console.log(wind);
				console.log(notes);
				console.log(lat);
				console.log(lon);

				setLoading(false);
				navigation.navigate("Home");
			}
		} catch (error) {
			console.error("Error adding round:", error);
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
					nextRef={dateRef}>
					Course
				</Input>
				{showCourseOptions && courseResults.length > 0 && (
					<View
						style={{
							width: "100%",
							backgroundColor: theme.colors.surfaceVariant,
							borderRadius: 15,
							marginBottom: 10,
							maxHeight: 200,
						}}>
						<List.Section>
							{courseResults.map((result, index) => (
								<List.Item
									key={index}
									title={result.text.text}
									onPress={() => selectCourse(result)}
									style={{
										borderBottomWidth: index < courseResults.length - 1 ? 1 : 0,
										borderBottomColor: theme.colors.outline,
									}}
									titleStyle={{ color: theme.colors.onSurfaceVariant }}
									left={(props) => (
										<List.Icon {...props} icon="golf" color={theme.colors.primary} />
									)}
								/>
							))}
						</List.Section>
					</View>
				)}
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
						data={images}
						renderItem={({ item }) => (
							<Pressable onPress={setPictures}>
								<Image
									placeholder={img}
									style={{ height: "100%" }}
									source={item}
									contentFit="contain"
								/>
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
