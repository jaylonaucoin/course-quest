import React, {useState, useRef, useEffect} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, Button, Avatar, Icon, IconButton} from 'react-native-paper';
import Input from '../components/Input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {getUser, pickImage, setProfileInfo} from "../utils/DataController";

export default function EditAccountScreen() {
    const theme = useTheme();
    const [user, setUser] = useState({});
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [homeCourse, setHomeCourse] = useState();
    const [bio, setBio] = useState();
    const [profilePicture, setProfilePicture] = useState();

    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const homeCourseRef = useRef(null);
    const bioRef = useRef(null);

    useEffect(() => {
        getUser().then(user => {
            setUser(user);
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setHomeCourse(user.homeCourse);
            setBio(user.bio);
            setProfilePicture(user.profilePicture);
        });
    }, []);

    const setPicture = async () => {
        try {
            const url = await pickImage(true);
            setProfilePicture(url);
        } catch (error) {
            console.error("Error setting profile picture:", error);
        }
    };

    return (
        <KeyboardAwareScrollView extraScrollHeight={100} contentContainerStyle={{justifyContent: 'center', alignItems: 'center', alignContent: 'space-around', flexGrow: 1, backgroundColor: theme.colors.surface}}>
            <View style={{ width: '100%', alignContent: 'center', alignItems: 'center', justifyContent: 'center'}}>
                <Pressable style={{ marginBottom: 10, width: 125, height: 100 }} onPress={setPicture}>
                    {profilePicture ? (
                        <Avatar.Image size={100} source={{ uri: profilePicture }} />
                    ) : (
                        <Avatar.Image size={100} style={{ marginHorizontal: 10, justifyContent: 'center', alignContent: 'center', alignItems: 'center'}} source={() => <Icon source="account" color={theme.colors.onPrimary} size={80}/>} />
                    )}
                    <IconButton icon="camera" iconColor={theme.colors.inverseSurface} size={20} style={{position: 'absolute', top: 0, right: 0, backgroundColor: theme.colors.inversePrimary,  borderRadius: 100}}/>
                </Pressable>
                <Input onChange={setFirstName} value={firstName} autofill="given-name" inputRef={firstNameRef} nextRef={lastNameRef}>First Name</Input>
                <Input onChange={setLastName} value={lastName} autofill="family-name" inputRef={lastNameRef} nextRef={homeCourseRef}>Last Name</Input>
                <Input onChange={setHomeCourse} value={homeCourse} autofill="organization-title" inputRef={homeCourseRef} nextRef={bioRef} search>Home Course</Input>
                <Input onChange={setBio} value={bio} autofill="organization-title" inputRef={bioRef}>Bio</Input>
                <Button mode="contained" style={{marginTop: 20}} onPress={() => setProfileInfo(firstName, lastName, homeCourse, bio)}>Save Changes</Button>
            </View>
        </KeyboardAwareScrollView>
    );
}