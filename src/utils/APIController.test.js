import { getCourseDetails, getWeatherData, searchGolfCourses } from "./APIController";

describe("getCourseDetails", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	it("parses city, province, country from address components", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					displayName: { text: "Pebble Beach Golf Links" },
					location: { latitude: 36.5674, longitude: -121.9497 },
					addressComponents: [
						{ types: ["locality"], longText: "Pebble Beach" },
						{ types: ["administrative_area_level_1"], longText: "California" },
						{ types: ["country"], longText: "United States" },
					],
				}),
		});

		const result = await getCourseDetails("ChIJabc123");
		expect(result).toEqual({
			latitude: 36.5674,
			longitude: -121.9497,
			name: "Pebble Beach Golf Links",
			city: "Pebble Beach",
			province: "California",
			country: "United States",
		});
	});

	it("returns null on invalid/empty response", async () => {
		global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({}) });

		const result = await getCourseDetails("invalid");
		expect(result).toBeNull();
	});

	it("returns null when displayName is missing", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					location: { latitude: 36.5674, longitude: -121.9497 },
				}),
		});

		const result = await getCourseDetails("abc");
		expect(result).toBeNull();
	});

	it("returns null on network error", async () => {
		global.fetch.mockRejectedValueOnce(new Error("Network error"));

		const result = await getCourseDetails("abc");
		expect(result).toBeNull();
	});

	it("handles missing address components gracefully", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					displayName: { text: "Golf Course" },
					location: { latitude: 36.5674, longitude: -121.9497 },
					addressComponents: [],
				}),
		});

		const result = await getCourseDetails("abc");
		expect(result).toEqual({
			latitude: 36.5674,
			longitude: -121.9497,
			name: "Golf Course",
			city: undefined,
			province: undefined,
			country: undefined,
		});
	});
});

describe("getWeatherData", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	it("returns correct fields for recent date (<7 days) using forecast API", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					daily: {
						temperature_2m_max: [72.5],
						precipitation_sum: [0],
						wind_speed_10m_max: [15.2],
						weather_code: [0],
					},
				}),
		});

		const recentDate = new Date();
		recentDate.setDate(recentDate.getDate() - 2);
		const result = await getWeatherData(36.57, -121.95, recentDate);
		expect(result).toEqual({
			temperature: [72.5],
			rain: [0],
			wind: [15.2],
			weatherCode: [0],
		});
	});

	it("uses archive API for dates >7 days ago", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					daily: {
						temperature_2m_max: [68],
						precipitation_sum: [0.5],
						wind_speed_10m_max: [12],
						weather_code: [1],
					},
				}),
		});

		const oldDate = new Date();
		oldDate.setDate(oldDate.getDate() - 14);
		const result = await getWeatherData(36.57, -121.95, oldDate);
		expect(result.temperature[0]).toBe(68);
		expect(result.rain[0]).toBe(0.5);
		expect(result.wind[0]).toBe(12);
	});

	it("returns zero-defaults on network error", async () => {
		global.fetch.mockRejectedValueOnce(new Error("Network error"));

		const recentDate = new Date();
		recentDate.setDate(recentDate.getDate() - 1);
		const result = await getWeatherData(36.57, -121.95, recentDate);
		expect(result).toEqual({ temperature: 0, rain: 0, wind: 0, weatherCode: 0 });
	});

	it("handles future dates using archive API", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					daily: {
						temperature_2m_max: [75],
						precipitation_sum: [0],
						wind_speed_10m_max: [8],
						weather_code: [0],
					},
				}),
		});

		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 7);
		const result = await getWeatherData(36.57, -121.95, futureDate);
		expect(result.temperature[0]).toBe(75);
	});
});

describe("searchGolfCourses", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	it("does nothing when query < 3 chars", async () => {
		const setCourseResults = jest.fn();
		const setShowCourseOptions = jest.fn();

		await searchGolfCourses("ab", setCourseResults, setShowCourseOptions);

		expect(setCourseResults).toHaveBeenCalledWith([]);
		expect(setShowCourseOptions).toHaveBeenCalledWith(false);
		expect(setCourseResults).toHaveBeenCalledTimes(1);
		expect(setShowCourseOptions).toHaveBeenCalledTimes(1);
	});

	it("calls Places API and sets results on success", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () =>
				Promise.resolve({
					suggestions: [
						{
							placePrediction: {
								placeId: "ChIJ123",
								text: { text: "Pebble Beach Golf Links, CA" },
							},
						},
					],
				}),
		});

		const setCourseResults = jest.fn();
		const setShowCourseOptions = jest.fn();

		await searchGolfCourses("peb", setCourseResults, setShowCourseOptions);

		expect(setCourseResults).toHaveBeenCalledWith([
			{
				placeId: "ChIJ123",
				text: { text: "Pebble Beach Golf Links, CA" },
			},
		]);
		expect(setShowCourseOptions).toHaveBeenCalledWith(true);
	});

	it("clears results on empty suggestions", async () => {
		global.fetch.mockResolvedValueOnce({
			json: () => Promise.resolve({ suggestions: [] }),
		});

		const setCourseResults = jest.fn();
		const setShowCourseOptions = jest.fn();

		await searchGolfCourses("xyz", setCourseResults, setShowCourseOptions);

		expect(setCourseResults).toHaveBeenCalledWith([]);
		expect(setShowCourseOptions).toHaveBeenCalledWith(false);
	});

	it("clears results on network error", async () => {
		global.fetch.mockRejectedValueOnce(new Error("Network error"));

		const setCourseResults = jest.fn();
		const setShowCourseOptions = jest.fn();

		await searchGolfCourses("golf", setCourseResults, setShowCourseOptions);

		expect(setCourseResults).toHaveBeenCalledWith([]);
		expect(setShowCourseOptions).toHaveBeenCalledWith(false);
	});

	it("clears results when suggestions is undefined", async () => {
		global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({}) });

		const setCourseResults = jest.fn();
		const setShowCourseOptions = jest.fn();

		await searchGolfCourses("gol", setCourseResults, setShowCourseOptions);

		expect(setCourseResults).toHaveBeenCalledWith([]);
		expect(setShowCourseOptions).toHaveBeenCalledWith(false);
	});
});
