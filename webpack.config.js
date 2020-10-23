const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
	mode: "development",
	devtool: "inline-source-map",
	entry: path.resolve(__dirname, "src", "index.tsx"),
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js"
	},
	watch: true,
	watchOptions: {
		poll: 1000
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.ttf$/,
				use: ["file-loader"]
			},
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: [/node_modules/],
				options: {
					transpileOnly: true,
					experimentalWatchApi: true
				}
			}
		]
	},
	devServer: {
		clientLogLevel: "trace",
		contentBase: path.resolve(__dirname, "dist"),
		inline: true,
		hot: true,
		host: "0.0.0.0",
		port: 80
	},
	plugins: [
		new MonacoWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "index.html"),
			filename: path.resolve(__dirname, "dist", "index.html")
		})
	],
};