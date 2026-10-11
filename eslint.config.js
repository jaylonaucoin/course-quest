// eslint.config.js
const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
	// Base ESLint recommended rules
	js.configs.recommended,

	// Configuration files (Node.js environment)
	{
		files: [
			"*.config.js",
			"babel.config.js",
			"metro.config.js",
			"tailwind.config.js",
			".eslintrc.js",
			".detoxrc.js",
			"e2e/jest.config.js",
		],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				...globals.node,
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			"prettier/prettier": "error",
		},
	},

	// React Native source files
	{
		files: ["src/**/*.{js,jsx}", "App.js", "firebaseConfig.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
				__DEV__: "readonly",
				React: "readonly",
				Platform: "readonly",
			},
		},
		plugins: {
			prettier: prettierPlugin,
			"unused-imports": require("eslint-plugin-unused-imports"),
			"react-hooks": require("eslint-plugin-react-hooks"),
		},
		rules: {
			// Prettier rules
			"prettier/prettier": "error",

			// Auto-fixable unused imports
			"no-unused-vars": "off", // Turn off base rule

			"no-console": ["warn", { allow: ["warn", "error"] }],
			"no-undef": "error",

			// React hooks rules
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
		},
	},

	// Jest tests, mocks, and setup
	{
		files: ["**/*.{test,spec}.{js,jsx}", "__mocks__/**/*.js", "jest.setup.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.jest,
				__DEV__: "readonly",
				React: "readonly",
				Platform: "readonly",
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			"prettier/prettier": "error",
			"no-undef": "error",
		},
	},

	// Detox e2e tests
	{
		files: ["e2e/**/*.{js,jsx}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				...globals.node,
				...globals.jest,
				device: "readonly",
				element: "readonly",
				by: "readonly",
				waitFor: "readonly",
				jasmine: "readonly",
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			"prettier/prettier": "error",
			"no-undef": "error",
		},
	},

	// Prettier configuration (should be last to override other formatting rules)
	prettier,

	// Ignore patterns
	{
		ignores: ["dist/*", "node_modules/*", ".expo/*", "android/*", "ios/*", "web-build/*"],
	},
];
