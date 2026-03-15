/**
 * Unit conversion utilities
 */

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} value - Temperature value to convert
 * @param {string} fromUnit - Source unit ('celsius' or 'fahrenheit')
 * @param {string} toUnit - Target unit ('celsius' or 'fahrenheit')
 * @returns {number} - Converted temperature value
 */
export function convertTemperature(value, fromUnit, toUnit) {
	if (fromUnit === toUnit) return value;

	if (fromUnit === "celsius" && toUnit === "fahrenheit") {
		return (value * 9) / 5 + 32;
	} else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
		return ((value - 32) * 5) / 9;
	}

	return value;
}

/**
 * Convert wind speed between km/h and mph
 * @param {number} value - Wind speed value to convert
 * @param {string} fromUnit - Source unit ('kilometers' or 'miles')
 * @param {string} toUnit - Target unit ('kilometers' or 'miles')
 * @returns {number} - Converted wind speed value
 */
export function convertWindSpeed(value, fromUnit, toUnit) {
	if (fromUnit === toUnit) return value;

	if (fromUnit === "kilometers" && toUnit === "miles") {
		return value * 0.621371;
	} else if (fromUnit === "miles" && toUnit === "kilometers") {
		return value * 1.60934;
	}

	return value;
}

/**
 * Convert precipitation between mm and inches
 * @param {number} value - Precipitation value to convert
 * @param {string} fromUnit - Source unit ('millimeters' or 'inches')
 * @param {string} toUnit - Target unit ('millimeters' or 'inches')
 * @returns {number} - Converted precipitation value
 */
export function convertPrecipitation(value, fromUnit, toUnit) {
	if (fromUnit === toUnit) return value;

	if (fromUnit === "millimeters" && toUnit === "inches") {
		return value * 0.0393701;
	} else if (fromUnit === "inches" && toUnit === "millimeters") {
		return value * 25.4;
	}

	return value;
}

/**
 * Format a numeric value with the appropriate number of decimal places based on unit type
 * @param {number} value - Value to format
 * @param {string} unitType - Type of unit (temperature, wind, precipitation)
 * @returns {string} - Formatted value as a string
 */
export function formatValueWithPrecision(value, unitType) {
	if (unitType === "temperature") {
		return Math.round(value).toString();
	} else if (unitType === "wind") {
		return value.toFixed(1);
	} else if (unitType === "precipitation") {
		return value.toFixed(2);
	}

	return value.toString();
}
