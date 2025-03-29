import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Input from "../components/Input";
import { Text, Button, useTheme, IconButton, Portal, Modal, ActivityIndicator } from "react-native-paper";
import { pickImage, addRound, updateRound, uploadImages } from "../utils/DataController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import img from "../../assets/img.jpg";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";

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
	const [loading, setLoading] = useState(false);

	const courseRef = useRef(null);
	const dateRef = useRef(null);
	const scoreRef = useRef(null);
	const tempRef = useRef(null);
	const rainRef = useRef(null);
	const windRef = useRef(null);
	const notesRef = useRef(null);
	const teesRef = useRef(null);

	const setPictures = async () => {
		try {
			const urls = await pickImage();
			setImages(urls);
		} catch (error) {
			console.error("Error setting round pictures:", error);
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
			if (!temp) {
				tempRef.current.focus();
				return;
			}
			if (!rain) {
				rainRef.current.focus();
				return;
			}
			if (!wind) {
				windRef.current.focus();
				return;
			}
			if (!tees) {
				teesRef.current.focus();
				return;
			}
			setLoading(true);
			const roundId = await addRound(course, date, score, temp, rain, wind, notes, null, tees);
			if (images) {
				const urls = await uploadImages(images, "rounds", roundId);
				await updateRound(roundId, course, date, score, temp, rain, wind, notes, urls, tees);
			}
			setLoading(false);
			navigation.navigate("Home");
		} catch (error) {
			console.error("Error adding round:", error);
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
					onChange={setCourse}
					type="search"
					value={course}
					inputRef={courseRef}
					nextRef={dateRef}>
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
				<Input onChange={setScore} type="number" value={score} inputRef={scoreRef} nextRef={tempRef}>
					Score
				</Input>
				<Input onChange={setTemp} type="number" value={temp} inputRef={tempRef} nextRef={rainRef}>
					Temperature
				</Input>
				<Input onChange={setRain} type="number" value={rain} inputRef={rainRef} nextRef={windRef}>
					Rain
				</Input>
				<Input onChange={setWind} type="number" value={wind} inputRef={windRef} nextRef={notesRef}>
					Wind
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
