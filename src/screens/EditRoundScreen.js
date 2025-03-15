import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import {
  useTheme,
  Text,
  Button,
  IconButton,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import Input from '../components/Input';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  deleteRoundImages,
  getRound,
  pickImage,
  updateRound,
  uploadImages,
} from '../utils/DataController';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';

export default function EditRoundScreen({ route }) {
  const theme = useTheme();
  const navigation = useNavigation();

  const [id, setId] = useState(route.params.roundData.id);
  const [course, setCourse] = useState(route.params.roundData.course);
  const [date, setDate] = useState(new Date(route.params.roundData.date.toDate()));
  const [score, setScore] = useState(route.params.roundData.score);
  const [temp, setTemp] = useState(route.params.roundData.temp);
  const [rain, setRain] = useState(route.params.roundData.rain);
  const [wind, setWind] = useState(route.params.roundData.wind);
  const [notes, setNotes] = useState(route.params.roundData.notes);
  const [images, setImages] = useState(Array(route.params.roundData.images));
  const [tees, setTees] = useState(route.params.roundData.tees);
  const [loading, setLoading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  const courseRef = useRef(null);
  const dateRef = useRef(null);
  const scoreRef = useRef(null);
  const tempRef = useRef(null);
  const rainRef = useRef(null);
  const windRef = useRef(null);
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
      setNotes(round.notes);
      setImages(round.images);
      setTees(round.tees);
    });
  });

  const setPicture = async () => {
    try {
      const url = await pickImage();
      setImages(url);
      setImageChanged(true);
    } catch (error) {
      console.error('Error setting profile picture:', error);
    }
  };

  const updateDBRound = async () => {
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
      if (imageChanged) {
        await deleteRoundImages(id);
        const urls = await uploadImages(images, 'rounds', id);
        await updateRound(id, course, date, score, temp, rain, wind, notes, urls, tees);
      } else {
        await updateRound(id, course, date, score, temp, rain, wind, notes, images, tees);
      }
      setLoading(false);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error adding round:', error);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-around',
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
            width: '85%',
            alignSelf: 'center',
            gap: 75,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text variant="headlineSmall">Updating your round ...</Text>
          <ActivityIndicator size={100} color={theme.colors.primary} />
          <Text variant="titleSmall">This won't take long...</Text>
        </Modal>
      </Portal>
      <View
        style={{
          width: '100%',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 15,
        }}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
          }}>
          <Text variant="headlineSmall">Edit Round</Text>
        </View>
        <Input
          onChange={setCourse}
          type="search"
          value={course}
          inputRef={courseRef}
          nextRef={dateRef}>
          Course
        </Input>
        <View className={'max-w-96 self-center grow shrink w-full p-2 basis-full'}>
          <View
            style={{
              borderRadius: 15,
              borderColor: theme.colors.onSurfaceVariant,
              backgroundColor: theme.colors.elevation.level0,
              width: '100%',
              padding: 10,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text variant="bodyLarge">Date</Text>
            <DateTimePicker
              mode="date"
              value={date}
              onChange={(event, selectedDate) => setDate(selectedDate)}
              maximumDate={new Date()}
              minimumDate={new Date(1940, 1, 1)}
              textColor={theme.colors.onSurface}
            />
          </View>
        </View>
        <Input
          onChange={setScore}
          type="number"
          value={score}
          inputRef={scoreRef}
          nextRef={tempRef}>
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '80%',
            height: 'auto',
            marginVertical: 10,
          }}>
          <Carousel
            width={320}
            height={200}
            style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 15 }}
            loop={false}
            snapEnabled={true}
            pagingEnabled={true}
            scrollAnimationDuration={250}
            data={images}
            renderItem={({ item }) => (
              <Pressable onPress={setPicture}>
                <Image
                  style={{ width: '100%', height: '100%' }}
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
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: theme.colors.inversePrimary,
              borderRadius: 100,
            }}
          />
        </View>
        <Button mode="contained" style={{ marginTop: 15 }} onPress={updateDBRound}>
          Update Round
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
