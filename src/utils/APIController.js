import { GOOGLE_PLACES_API_KEY } from "react-native-dotenv";

export async function getCourseDetails(placeId) {
	try {
		const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
				"X-Goog-FieldMask": "displayName,location,addressComponents",
			},
		});

		const data = await response.json();

		let city, province, country;

		for (const component of data.addressComponents || []) {
			if (component.types.includes("locality")) {
				city = component.longText;
			}
			if (component.types.includes("administrative_area_level_1")) {
				province = component.longText;
			}
			if (component.types.includes("country")) {
				country = component.longText;
			}
		}

		return {
			latitude: data.location.latitude,
			longitude: data.location.longitude,
			name: data.displayName.text,
			city,
			province,
			country,
		};
	} catch (error) {
		console.error("Error fetching course details:", error);
		return null;
	}
}

export async function getWeatherData(latitude, longitude, date) {
	try {
		// Determine if the date is less than 7 days in the past
		const selectedDate = new Date(date);
		const currentDate = new Date();
		const daysDifference = Math.floor((currentDate - selectedDate) / (1000 * 60 * 60 * 24));

		const formattedDate = selectedDate.toISOString().split("T")[0];

		// Use different API endpoints based on date range
		let apiUrl;

		if (daysDifference < 7 && daysDifference >= 0) {
			// For recent dates (less than 7 days old), use the forecast API
			apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,wind_speed_10m_max,precipitation_sum&start_date=${formattedDate}&end_date=${formattedDate}`;
		} else {
			// For older dates, use the archive API
			apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${formattedDate}&end_date=${formattedDate}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,weathercode&timezone=auto`;
		}

		const response = await fetch(apiUrl);
		const data = await response.json();
		return {
			temperature: data.daily.temperature_2m_max,
			rain: data.daily.precipitation_sum,
			wind: data.daily.wind_speed_10m_max,
			weatherCode: data.daily.weather_code,
		};
	} catch (error) {
		console.error("Error fetching weather data:", error);
		return { temperature: 0, rain: 0, wind: 0, weatherCode: 0 };
	}
}

export async function searchGolfCourses(query, setCourseResults, setShowCourseOptions) {
	if (query.length < 3) {
		setCourseResults([]);
		setShowCourseOptions(false);
		return;
	}

	try {
		const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
			},
			body: JSON.stringify({
				input: query,
				includedPrimaryTypes: ["golf_course", "sports_club"],
			}),
		});

		const data = await response.json();

		if (data.suggestions && data.suggestions.length > 0) {
			setCourseResults(data.suggestions.map((suggestion) => suggestion.placePrediction));
			setShowCourseOptions(true);
		} else {
			setCourseResults([]);
			setShowCourseOptions(false);
		}
	} catch (error) {
		console.error("Error searching for golf courses:", error);
		setCourseResults([]);
		setShowCourseOptions(false);
	}
}
