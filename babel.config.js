module.exports = function (api) {
	api.cache(true);
	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
		plugins: [
			[
				"module:react-native-dotenv",
				{
					envName: "APP_ENV",
					moduleName: "react-native-dotenv",
					path: ".env.local",
					verbose: false,
				},
			],
			"react-native-reanimated/plugin",
		],
	};
};
