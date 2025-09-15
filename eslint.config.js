// eslint.config.js
const js = require("@eslint/js");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
	// Base ESLint recommended rules
	js.configs.recommended,

	// Configuration files (Node.js environment)
	{
		files: ["*.config.js", "babel.config.js", "metro.config.js", "tailwind.config.js", ".eslintrc.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				module: "readonly",
				require: "readonly",
				exports: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				process: "readonly",
				Buffer: "readonly",
				global: "readonly",
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
				// React Native globals
				__DEV__: "readonly",
				global: "readonly",
				process: "readonly",
				Buffer: "readonly",
				console: "readonly",
				fetch: "readonly",
				alert: "readonly",
				// React globals
				React: "readonly",
				// Platform specific
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
			"unused-imports/no-unused-imports": "error", // Auto-remove unused imports
			"unused-imports/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],

			"no-console": ["warn", { allow: ["warn", "error"] }],
			"no-undef": "error",

			// React hooks rules
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
		},
	},

	// Prettier configuration (should be last to override other formatting rules)
	prettier,

	// Ignore patterns
	{
		ignores: ["dist/*", "node_modules/*", ".expo/*", "android/*", "ios/*", "web-build/*"],
	},
];
