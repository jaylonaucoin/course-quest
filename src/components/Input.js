import React, {useState} from "react";
import { View } from "react-native";
import {Searchbar, Text, TextInput, useTheme} from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';

const Input = ({ children, type = 'text', size = "full", autofill = "off", onChange, value, inputRef, nextRef, submitForm }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const theme = useTheme();

    const inputStyle = {
        borderRadius: 15,
        borderColor: theme.colors.onSurfaceVariant,
        backgroundColor: theme.colors.surfaceVariant,
        placeholderTextColor: theme.colors.onSurfaceVariant,
    }

    const handleSubmitEditing = () => {
        if (nextRef?.current) {
            nextRef.current.focus();
        } else {
            submitForm && submitForm();
        }
    };

    const rightIcon = () => {
        if (type === 'password') {
            return <TextInput.Icon icon={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />;
        } else {
           switch (children) {
                case 'Temperature': return <TextInput.Affix text="&deg;C" />;
                case 'Wind': return <TextInput.Affix text='km/h' />;
                case 'Rain': return <TextInput.Affix text='mm' />;
           }
        }
    }

    return (
        <View className={"max-w-96 self-center grow shrink w-full p-2 basis-" + size}>
            {type === 'password' ? (
                <TextInput
                    ref={inputRef}
                    required
                    onChangeText={onChange}
                    value={value}
                    name={children}
                    id={children}
                    autoComplete={autofill}
                    placeholder={children}
                    returnKeyType={autofill === "password" ? "go" : "next"}
                    onSubmitEditing={handleSubmitEditing}
                    secureTextEntry={!passwordVisible}
                    mode="outlined"
                    outlineStyle={inputStyle}
                    right={rightIcon()}
                />
            ) : type === 'email' ? (
                <TextInput
                    ref={inputRef}
                    required
                    onChangeText={onChange}
                    value={value}
                    name={children}
                    id={children}
                    autoComplete={autofill}
                    placeholder={children}
                    inputMode="email"
                    returnKeyType="next"
                    onSubmitEditing={handleSubmitEditing}
                    mode="outlined"
                    outlineStyle={inputStyle}
                />
            ) : type === 'search' ? (
                <Searchbar
                    ref={inputRef}
                    required
                    onChangeText={onChange}
                    value={value}
                    name={children}
                    id={children}
                    inputMode='search'
                    returnKeyType="next"
                    clearButtonMode="never"
                    onSubmitEditing={handleSubmitEditing}
                    mode="bar"
                    autoComplete={autofill}
                    placeholder={children}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    style={{...inputStyle, borderWidth: 1}}
                />
            ) : type === 'date' ? (
                <View style={{borderRadius: 15, borderColor: theme.colors.onSurfaceVariant, borderWidth: 1, backgroundColor: theme.colors.surfaceVariant, width: '100%', padding: 10, paddingLeft: 15, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text variant="bodyLarge" theme={{ colors: {onSurface: theme.colors.onSurfaceVariant}}}>Date</Text>
                    <DateTimePicker
                        mode="date"
                        value={date}
                        onChange={onChange}
                        maximumDate={new Date()}
                        minimumDate={new Date( 1940, 1, 1)}
                        themeVariant={theme.dark ? "dark" : "light"}
                    />
                </View>
            ) : type === 'number' ? (
                <TextInput
                    ref={inputRef}
                    required
                    onChangeText={onChange}
                    value={value}
                    right={rightIcon()}
                    name={children}
                    id={children}
                    autoComplete={autofill}
                    placeholder={children}
                    inputMode="numeric"
                    returnKeyType="next"
                    onSubmitEditing={handleSubmitEditing}
                    mode="outlined"
                    outlineStyle={inputStyle}
                />
            ) : (
                <TextInput
                    ref={inputRef}
                    required
                    onChangeText={onChange}
                    value={value}
                    multiline={children === "Bio"|| children === "Notes"}
                    name={children}
                    id={children}
                    autoComplete={autofill}
                    placeholder={children}
                    returnKeyType="next"
                    onSubmitEditing={handleSubmitEditing}
                    mode="outlined"
                    outlineStyle={inputStyle}
                />
            )}
        </View>
    );
};

export default Input;
