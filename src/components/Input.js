import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme, List } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

const Input = ({
	children,
	type = "text",
	size = "full",
	autofill = "off",
	onChange,
	value,
	inputRef,
	nextRef,
	submitForm,
	searchType = "search",
	searchResults = [],
	onSearchResultSelect,
	showSearchResults = false,
	searchResultIcon = "magnify",
}) => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const theme = useTheme();

	const inputStyle = {
		borderRadius: 15,
		borderColor: theme.colors.onSurfaceVariant,
		backgroundColor: theme.colors.surfaceVariant,
		placeholderTextColor: theme.colors.onSurfaceVariant,
	};

	const handleSubmitEditing = () => {
		if (nextRef?.current) {
			nextRef.current.focus();
		} else {
			submitForm && submitForm();
		}
	};

	const rightIcon = () => {
		if (type === "password") {
			return (
				<TextInput.Icon
					icon={passwordVisible ? "eye" : "eye-off"}
					onPress={() => setPasswordVisible(!passwordVisible)}
				/>
			);
		} else {
			switch (children) {
				case "Temperature":
					return <TextInput.Affix text="&deg;C" />;
				case "Wind":
					return <TextInput.Affix text="km/h" />;
				case "Rain":
					return <TextInput.Affix text="mm" />;
			}
		}
	};

	// Customize the display of search results based on search type
	const renderSearchResultItem = (result, index) => {
		if (searchType === "course") {
			return (
				<List.Item
					key={index}
					title={result.text.text}
					onPress={() => onSearchResultSelect && onSearchResultSelect(result)}
					style={{
						borderBottomWidth: index < searchResults.length - 1 ? 1 : 0,
						borderBottomColor: theme.colors.outline,
					}}
					titleStyle={{ color: theme.colors.onSurfaceVariant }}
					left={(props) => <List.Icon {...props} icon="golf" color={theme.colors.primary} />}
				/>
			);
		} else {
			// Default rendering for other search types
			return (
				<List.Item
					key={index}
					title={typeof result === "string" ? result : result.title || result.name || JSON.stringify(result)}
					onPress={() => onSearchResultSelect && onSearchResultSelect(result)}
					style={{
						borderBottomWidth: index < searchResults.length - 1 ? 1 : 0,
						borderBottomColor: theme.colors.outline,
					}}
					titleStyle={{ color: theme.colors.onSurfaceVariant }}
					left={(props) => <List.Icon {...props} icon={searchResultIcon} color={theme.colors.primary} />}
				/>
			);
		}
	};

	return (
		<View className={"max-w-96 self-center shrink w-full text-wrap p-2"}>
			{type === "password" ? (
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
			) : type === "email" ? (
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
			) : type === "search" ? (
				<View>
					<TextInput
						ref={inputRef}
						required
						onChangeText={onChange}
						value={value}
						name={children}
						id={children}
						inputMode="search"
						returnKeyType="next"
						clearButtonMode="never"
						onSubmitEditing={handleSubmitEditing}
						mode="outlined"
						autoComplete={autofill}
						placeholder={children}
						outlineStyle={inputStyle}
					/>
					{showSearchResults && searchResults.length > 0 && (
						<View
							style={{
								width: "100%",
								backgroundColor: theme.colors.surfaceVariant,
								borderRadius: 15,
								marginBottom: 10,
								maxHeight: 200,
							}}>
							<List.Section>
								{searchResults.map((result, index) => renderSearchResultItem(result, index))}
							</List.Section>
						</View>
					)}
				</View>
			) : type === "date" ? (
				<View
					style={{
						borderRadius: 15,
						borderColor: theme.colors.onSurfaceVariant,
						borderWidth: 1,
						backgroundColor: theme.colors.surfaceVariant,
						width: "100%",
						padding: 10,
						paddingLeft: 15,
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
					}}>
					<Text variant="bodyLarge" theme={{ colors: { onSurface: theme.colors.onSurfaceVariant } }}>
						Date
					</Text>
					<DateTimePicker
						mode="date"
						value={new Date(value)}
						onChange={onChange}
						maximumDate={new Date()}
						minimumDate={new Date(1940, 1, 1)}
						themeVariant={theme.dark ? "dark" : "light"}
					/>
				</View>
			) : type === "number" ? (
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
					multiline={children === "Bio" || children === "Notes"}
					name={children}
					id={children}
					autoComplete={autofill}
					placeholder={children}
					returnKeyType="next"
					lineBreakStrategyIOS="none"
					textBreakStrategy="simple"
					onSubmitEditing={handleSubmitEditing}
					mode="outlined"
					outlineStyle={inputStyle}
				/>
			)}
		</View>
	);
};

export default Input;
