import {
	convertTemperature,
	convertWindSpeed,
	convertPrecipitation,
	formatValueWithPrecision,
} from "./UnitConverter";

describe("convertTemperature", () => {
	it("returns same value when units are equal", () => {
		expect(convertTemperature(25, "celsius", "celsius")).toBe(25);
		expect(convertTemperature(77, "fahrenheit", "fahrenheit")).toBe(77);
	});

	it("converts celsius to fahrenheit", () => {
		expect(convertTemperature(0, "celsius", "fahrenheit")).toBe(32);
		expect(convertTemperature(100, "celsius", "fahrenheit")).toBe(212);
		expect(convertTemperature(25, "celsius", "fahrenheit")).toBe(77);
	});

	it("converts fahrenheit to celsius", () => {
		expect(convertTemperature(32, "fahrenheit", "celsius")).toBe(0);
		expect(convertTemperature(212, "fahrenheit", "celsius")).toBe(100);
	});
});

describe("convertWindSpeed", () => {
	it("returns same value when units are equal", () => {
		expect(convertWindSpeed(50, "kilometers", "kilometers")).toBe(50);
	});

	it("converts km/h to mph", () => {
		expect(convertWindSpeed(100, "kilometers", "miles")).toBeCloseTo(62.1371, 4);
	});

	it("converts mph to km/h", () => {
		expect(convertWindSpeed(62.1371, "miles", "kilometers")).toBeCloseTo(100, 2);
	});
});

describe("convertPrecipitation", () => {
	it("returns same value when units are equal", () => {
		expect(convertPrecipitation(10, "millimeters", "millimeters")).toBe(10);
	});

	it("converts mm to inches", () => {
		expect(convertPrecipitation(25.4, "millimeters", "inches")).toBeCloseTo(1, 4);
	});

	it("converts inches to mm", () => {
		expect(convertPrecipitation(1, "inches", "millimeters")).toBe(25.4);
	});
});

describe("formatValueWithPrecision", () => {
	it("rounds temperature to integer", () => {
		expect(formatValueWithPrecision(72.7, "temperature")).toBe("73");
	});

	it("formats wind with 1 decimal", () => {
		expect(formatValueWithPrecision(15.23, "wind")).toBe("15.2");
	});

	it("formats precipitation with 2 decimals", () => {
		expect(formatValueWithPrecision(5.678, "precipitation")).toBe("5.68");
	});

	it("returns string for unknown unit type", () => {
		expect(formatValueWithPrecision(10, "other")).toBe("10");
	});
});
