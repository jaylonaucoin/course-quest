const React = require("react");
const { View } = require("react-native");

const MockIcon = (props) => React.createElement(View, { "data-testid": "mock-icon", ...props });

module.exports = {
	__esModule: true,
	default: MockIcon,
};
